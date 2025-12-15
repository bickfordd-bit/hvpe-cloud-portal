#!/usr/bin/env python3
"""
OPTR Alpaca Trade Executor
Executes market orders via Alpaca Trading API with support for fractional shares.
"""

import os
import sys
import time
from dataclasses import dataclass, asdict
from typing import Optional, Literal
from decimal import Decimal

try:
    from alpaca.trading.client import TradingClient
    from alpaca.trading.requests import MarketOrderRequest
    from alpaca.trading.enums import OrderSide, TimeInForce
    from alpaca.common.exceptions import APIError
except ImportError:
    print("Error: alpaca-py not installed. Install with: pip install alpaca-py", file=sys.stderr)
    sys.exit(1)


@dataclass
class OptrResult:
    """Result from OPTR trade execution"""
    success: bool
    symbol: str
    side: str
    mode: str
    shares_executed: float
    dollars_executed: float
    order_id: Optional[str] = None
    filled_price: Optional[float] = None
    error: Optional[str] = None
    reason: Optional[str] = None
    request_id: Optional[str] = None


class AlpacaExecutor:
    """Executes trades via Alpaca API with retry logic and validation"""
    
    def __init__(self):
        self.api_key = os.getenv('ALPACA_API_KEY')
        self.api_secret = os.getenv('ALPACA_API_SECRET')
        self.base_url = os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')
        
        if not self.api_key or not self.api_secret:
            raise ValueError("ALPACA_API_KEY and ALPACA_API_SECRET must be set")
        
        self.client = TradingClient(
            api_key=self.api_key,
            secret_key=self.api_secret,
            paper=(self.base_url == 'https://paper-api.alpaca.markets')
        )
    
    def execute_trade(
        self,
        symbol: str,
        side: Literal['buy', 'sell'],
        mode: Literal['auto', 'dollars', 'shares'],
        dollars: float = 0.0,
        shares: float = 0.0,
        min_dollars: float = 1.0,
        request_id: Optional[str] = None,
        max_retries: int = 3
    ) -> OptrResult:
        """
        Execute a market order with automatic handling of dollars vs shares.
        
        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL')
            side: 'buy' or 'sell'
            mode: 'auto', 'dollars', or 'shares'
            dollars: Dollar amount for notional orders (mode='dollars' or 'auto')
            shares: Number of shares (mode='shares')
            min_dollars: Minimum dollar amount to execute (default 1.0)
            request_id: Optional request tracking ID
            max_retries: Number of retry attempts on failure
            
        Returns:
            OptrResult with execution details
        """
        symbol = symbol.upper().strip()
        
        # Validation
        if mode == 'shares' and shares <= 0:
            return OptrResult(
                success=False,
                symbol=symbol,
                side=side,
                mode=mode,
                shares_executed=0,
                dollars_executed=0,
                error="shares mode requires shares > 0",
                reason="invalid_shares",
                request_id=request_id
            )
        
        if mode == 'dollars' and dollars <= 0:
            return OptrResult(
                success=False,
                symbol=symbol,
                side=side,
                mode=mode,
                shares_executed=0,
                dollars_executed=0,
                error="dollars mode requires dollars > 0",
                reason="invalid_dollars",
                request_id=request_id
            )
        
        if mode == 'auto' and dollars <= 0 and shares <= 0:
            return OptrResult(
                success=False,
                symbol=symbol,
                side=side,
                mode=mode,
                shares_executed=0,
                dollars_executed=0,
                error="auto mode requires either dollars > 0 or shares > 0",
                reason="invalid_auto_params",
                request_id=request_id
            )
        
        # Determine order type (notional vs qty)
        use_notional = (mode == 'dollars') or (mode == 'auto' and dollars > 0 and shares == 0)
        
        if use_notional and dollars < min_dollars:
            return OptrResult(
                success=False,
                symbol=symbol,
                side=side,
                mode=mode,
                shares_executed=0,
                dollars_executed=0,
                error=f"dollars ({dollars}) below minimum ({min_dollars})",
                reason="below_min_dollars",
                request_id=request_id
            )
        
        # Execute with retries
        for attempt in range(max_retries):
            try:
                order_side = OrderSide.BUY if side == 'buy' else OrderSide.SELL
                
                if use_notional:
                    # Notional (dollar-based) order
                    order_data = MarketOrderRequest(
                        symbol=symbol,
                        notional=dollars,
                        side=order_side,
                        time_in_force=TimeInForce.DAY
                    )
                else:
                    # Quantity (shares-based) order - supports fractional
                    order_data = MarketOrderRequest(
                        symbol=symbol,
                        qty=shares,
                        side=order_side,
                        time_in_force=TimeInForce.DAY
                    )
                
                # Submit order
                order = self.client.submit_order(order_data)
                
                # Wait for fill (simple polling, max 10 seconds)
                filled_order = self._wait_for_fill(order.id, timeout=10)
                
                if filled_order and filled_order.filled_qty:
                    filled_qty = float(filled_order.filled_qty)
                    filled_avg_price = float(filled_order.filled_avg_price) if filled_order.filled_avg_price else 0.0
                    dollars_exec = filled_qty * filled_avg_price
                    
                    return OptrResult(
                        success=True,
                        symbol=symbol,
                        side=side,
                        mode=mode,
                        shares_executed=filled_qty,
                        dollars_executed=dollars_exec,
                        order_id=str(order.id),
                        filled_price=filled_avg_price,
                        request_id=request_id
                    )
                else:
                    # Order not filled in time
                    return OptrResult(
                        success=False,
                        symbol=symbol,
                        side=side,
                        mode=mode,
                        shares_executed=0,
                        dollars_executed=0,
                        order_id=str(order.id),
                        error="order not filled within timeout",
                        reason="fill_timeout",
                        request_id=request_id
                    )
                    
            except APIError as e:
                error_msg = str(e)
                if "symbol" in error_msg.lower() and "not found" in error_msg.lower():
                    reason = "invalid_symbol"
                elif "insufficient" in error_msg.lower():
                    reason = "insufficient_funds"
                elif "not tradable" in error_msg.lower():
                    reason = "symbol_not_tradable"
                else:
                    reason = "alpaca_api_error"
                
                if attempt < max_retries - 1:
                    # Retry on transient errors
                    if "rate limit" in error_msg.lower() or "timeout" in error_msg.lower():
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                
                return OptrResult(
                    success=False,
                    symbol=symbol,
                    side=side,
                    mode=mode,
                    shares_executed=0,
                    dollars_executed=0,
                    error=error_msg,
                    reason=reason,
                    request_id=request_id
                )
            
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                
                return OptrResult(
                    success=False,
                    symbol=symbol,
                    side=side,
                    mode=mode,
                    shares_executed=0,
                    dollars_executed=0,
                    error=str(e),
                    reason="unknown_error",
                    request_id=request_id
                )
        
        return OptrResult(
            success=False,
            symbol=symbol,
            side=side,
            mode=mode,
            shares_executed=0,
            dollars_executed=0,
            error="max retries exceeded",
            reason="max_retries",
            request_id=request_id
        )
    
    def _wait_for_fill(self, order_id, timeout=10):
        """Poll for order fill status"""
        start = time.time()
        while time.time() - start < timeout:
            try:
                order = self.client.get_order_by_id(order_id)
                if order.status in ['filled', 'partially_filled']:
                    return order
                if order.status in ['canceled', 'expired', 'rejected']:
                    return None
                time.sleep(0.5)
            except Exception:
                time.sleep(0.5)
        return None


def main():
    """CLI entry point for testing"""
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description='Execute OPTR trade via Alpaca')
    parser.add_argument('--symbol', required=True, help='Stock symbol')
    parser.add_argument('--side', choices=['buy', 'sell'], default='buy', help='Buy or sell')
    parser.add_argument('--mode', choices=['auto', 'dollars', 'shares'], default='auto', help='Execution mode')
    parser.add_argument('--dollars', type=float, default=0, help='Dollar amount')
    parser.add_argument('--shares', type=float, default=0, help='Number of shares')
    parser.add_argument('--min-dollars', type=float, default=1.0, help='Minimum dollar amount')
    parser.add_argument('--request-id', help='Request tracking ID')
    
    args = parser.parse_args()
    
    try:
        executor = AlpacaExecutor()
        result = executor.execute_trade(
            symbol=args.symbol,
            side=args.side,
            mode=args.mode,
            dollars=args.dollars,
            shares=args.shares,
            min_dollars=args.min_dollars,
            request_id=args.request_id
        )
        print(json.dumps(asdict(result), indent=2))
        sys.exit(0 if result.success else 1)
    except Exception as e:
        error_result = OptrResult(
            success=False,
            symbol=args.symbol,
            side=args.side,
            mode=args.mode,
            shares_executed=0,
            dollars_executed=0,
            error=str(e),
            reason="initialization_error",
            request_id=args.request_id
        )
        print(json.dumps(asdict(error_result), indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
