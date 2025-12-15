#!/usr/bin/env python3
"""
OPTR Alpaca Trade Executor
Executes trades via Alpaca API with safety guards:
- Paper-only enforcement (unless OPTR_ALLOW_LIVE=true)
- Symbol allowlist
- Per-order notional cap
- Per-day notional cap (best effort, resets at UTC midnight)
"""

import os
import sys
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple

# Daily notional tracker (in-memory, resets at midnight UTC)
# Note: This is best-effort tracking. For single-threaded worker_http.py usage, no locking needed.
# If using in a multi-threaded context, add threading.Lock() around access.
daily_notional = {"total": 0.0, "date": ""}


def get_current_date_utc() -> str:
    """Get current date in UTC as YYYY-MM-DD"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def reset_daily_notional_if_needed():
    """Reset daily notional counter if new UTC day"""
    global daily_notional
    today = get_current_date_utc()
    if daily_notional["date"] != today:
        daily_notional = {"total": 0.0, "date": today}


def check_paper_only_enforcement() -> Tuple[bool, Optional[str]]:
    """
    Check if live trading is blocked.
    Returns: (is_ok, reason)
    """
    alpaca_url = os.getenv("ALPACA_BASE_URL", "")
    allow_live = os.getenv("OPTR_ALLOW_LIVE", "false").lower() == "true"
    
    # If ALPACA_BASE_URL doesn't contain "paper" and OPTR_ALLOW_LIVE is not true
    if "paper" not in alpaca_url.lower() and not allow_live:
        return False, "live_trading_blocked"
    
    return True, None


def check_symbol_allowlist(symbol: str) -> Tuple[bool, Optional[str]]:
    """
    Check if symbol is in allowlist (if configured).
    Returns: (is_ok, reason)
    """
    allowlist_env = os.getenv("OPTR_SYMBOL_ALLOWLIST", "")
    if not allowlist_env:
        return True, None
    
    allowlist = [s.strip().upper() for s in allowlist_env.split(",")]
    if symbol.upper() not in allowlist:
        return False, "symbol_not_allowed"
    
    return True, None


def get_latest_price(symbol: str) -> Optional[float]:
    """
    Get latest price for symbol using Alpaca API.
    Returns None on error.
    """
    try:
        from alpaca.data.historical import StockHistoricalDataClient
        from alpaca.data.requests import StockLatestQuoteRequest
        
        api_key = os.getenv("ALPACA_API_KEY")
        secret_key = os.getenv("ALPACA_SECRET_KEY")
        
        if not api_key or not secret_key:
            return None
        
        client = StockHistoricalDataClient(api_key, secret_key)
        request = StockLatestQuoteRequest(symbol_or_symbols=symbol)
        quote = client.get_stock_latest_quote(request)
        
        if symbol in quote:
            return float(quote[symbol].ask_price or quote[symbol].bid_price)
        
        return None
    except Exception:
        return None


def calculate_notional(trade_request: Dict[str, Any]) -> Optional[float]:
    """
    Calculate notional value of the trade.
    For notional mode: use provided value
    For qty mode: estimate using latest price
    Returns None if cannot calculate
    """
    if "notional" in trade_request and trade_request["notional"]:
        return float(trade_request["notional"])
    
    if "qty" in trade_request and trade_request["qty"]:
        qty = float(trade_request["qty"])
        symbol = trade_request["symbol"]
        price = get_latest_price(symbol)
        
        if price:
            return qty * price
    
    return None


def check_per_order_notional_cap(notional: float) -> Tuple[bool, Optional[str]]:
    """
    Check per-order notional cap.
    Returns: (is_ok, reason)
    """
    max_notional_env = os.getenv("OPTR_MAX_NOTIONAL", "50")
    try:
        max_notional = float(max_notional_env)
    except ValueError:
        max_notional = 50.0
    
    if notional > max_notional:
        return False, "exceeds_max_notional"
    
    return True, None


def check_daily_notional_cap(notional: float) -> Tuple[bool, Optional[str]]:
    """
    Check per-day notional cap (best effort).
    Returns: (is_ok, reason)
    """
    max_daily_env = os.getenv("OPTR_MAX_NOTIONAL_PER_DAY")
    if not max_daily_env:
        return True, None
    
    try:
        max_daily = float(max_daily_env)
    except ValueError:
        return True, None
    
    global daily_notional
    reset_daily_notional_if_needed()
    
    new_total = daily_notional["total"] + notional
    if new_total > max_daily:
        return False, "exceeds_daily_notional"
    
    return True, None


def update_daily_notional(notional: float):
    """Update daily notional counter"""
    global daily_notional
    reset_daily_notional_if_needed()
    daily_notional["total"] += notional


def execute_trade(trade_request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute trade via Alpaca with all safety checks.
    Returns response dict with success/reason/order details.
    """
    try:
        # 1. Paper-only enforcement
        ok, reason = check_paper_only_enforcement()
        if not ok:
            return {
                "success": False,
                "reason": reason,
                "message": "Live trading is blocked. Set OPTR_ALLOW_LIVE=true to enable."
            }
        
        # 2. Symbol allowlist
        symbol = trade_request.get("symbol", "").upper()
        ok, reason = check_symbol_allowlist(symbol)
        if not ok:
            return {
                "success": False,
                "reason": reason,
                "message": f"Symbol {symbol} not in allowlist"
            }
        
        # 3. Calculate notional
        notional = calculate_notional(trade_request)
        
        # 4. Per-order notional cap (if we can calculate it)
        if notional is not None:
            ok, reason = check_per_order_notional_cap(notional)
            if not ok:
                max_notional = float(os.getenv("OPTR_MAX_NOTIONAL", "50"))
                return {
                    "success": False,
                    "reason": reason,
                    "message": f"Order notional {notional:.2f} exceeds max {max_notional:.2f}"
                }
            
            # 5. Daily notional cap
            ok, reason = check_daily_notional_cap(notional)
            if not ok:
                max_daily = float(os.getenv("OPTR_MAX_NOTIONAL_PER_DAY", "0"))
                current = daily_notional["total"]
                return {
                    "success": False,
                    "reason": reason,
                    "message": f"Daily notional limit exceeded. Current: {current:.2f}, Requested: {notional:.2f}, Max: {max_daily:.2f}"
                }
        
        # 6. Execute via Alpaca
        from alpaca.trading.client import TradingClient
        from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
        from alpaca.trading.enums import OrderSide, TimeInForce
        
        api_key = os.getenv("ALPACA_API_KEY")
        secret_key = os.getenv("ALPACA_SECRET_KEY")
        base_url = os.getenv("ALPACA_BASE_URL")
        
        if not api_key or not secret_key:
            return {
                "success": False,
                "reason": "missing_credentials",
                "message": "ALPACA_API_KEY or ALPACA_SECRET_KEY not set"
            }
        
        # Determine if paper mode
        paper = "paper" in (base_url or "").lower()
        
        client = TradingClient(api_key, secret_key, paper=paper, url_override=base_url)
        
        # Build order request
        side = OrderSide.BUY if trade_request["side"].lower() == "buy" else OrderSide.SELL
        time_in_force = TimeInForce.DAY  # Default
        
        if "time_in_force" in trade_request:
            tif_map = {
                "day": TimeInForce.DAY,
                "gtc": TimeInForce.GTC,
                "ioc": TimeInForce.IOC,
                "fok": TimeInForce.FOK
            }
            time_in_force = tif_map.get(trade_request["time_in_force"].lower(), TimeInForce.DAY)
        
        # Market or limit order
        order_type = trade_request.get("type", "market").lower()
        
        if order_type == "limit" and "limit_price" in trade_request:
            order_data = LimitOrderRequest(
                symbol=symbol,
                qty=trade_request.get("qty"),
                notional=trade_request.get("notional"),
                side=side,
                time_in_force=time_in_force,
                limit_price=float(trade_request["limit_price"])
            )
        else:
            order_data = MarketOrderRequest(
                symbol=symbol,
                qty=trade_request.get("qty"),
                notional=trade_request.get("notional"),
                side=side,
                time_in_force=time_in_force
            )
        
        order = client.submit_order(order_data)
        
        # Update daily notional counter
        if notional is not None:
            update_daily_notional(notional)
        
        # Safely extract order data with type checking
        try:
            filled_qty = float(order.filled_qty) if order.filled_qty else 0.0
        except (ValueError, TypeError):
            filled_qty = 0.0
        
        try:
            filled_avg_price = float(order.filled_avg_price) if order.filled_avg_price else None
        except (ValueError, TypeError):
            filled_avg_price = None
        
        # Handle submitted_at which could be datetime or string
        if order.submitted_at:
            if hasattr(order.submitted_at, 'isoformat'):
                submitted_at = order.submitted_at.isoformat()
            else:
                submitted_at = str(order.submitted_at)
        else:
            submitted_at = None
        
        return {
            "success": True,
            "order_id": str(order.id),
            "status": str(order.status),
            "filled_qty": filled_qty,
            "filled_avg_price": filled_avg_price,
            "symbol": symbol,
            "side": trade_request["side"],
            "submitted_at": submitted_at
        }
        
    except Exception as e:
        # Return explicit failure without stack trace
        error_msg = str(e)
        # Try to extract meaningful error from Alpaca API errors
        if "insufficient" in error_msg.lower():
            reason = "insufficient_funds"
        elif "not found" in error_msg.lower():
            reason = "symbol_not_found"
        elif "market closed" in error_msg.lower():
            reason = "market_closed"
        else:
            reason = "execution_failed"
        
        return {
            "success": False,
            "reason": reason,
            "message": error_msg
        }


def main():
    """CLI entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "reason": "missing_input",
            "message": "Usage: optr_alpaca_execute.py <trade_json>"
        }))
        sys.exit(1)
    
    try:
        trade_json = sys.argv[1]
        trade_request = json.loads(trade_json)
        result = execute_trade(trade_request)
        print(json.dumps(result))
        sys.exit(0 if result["success"] else 1)
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "reason": "invalid_json",
            "message": f"Invalid JSON: {str(e)}"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "reason": "unexpected_error",
            "message": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
