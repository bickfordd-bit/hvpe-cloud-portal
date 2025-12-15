#!/usr/bin/env python3
"""
OPTR Alpaca Execution Module

Submits orders to Alpaca with explicit failure reasons.
Handles auto/fractional dollar orders vs share-based orders.
Admin-safe with detailed error reporting.
"""

import os
import sys
from typing import Dict, Any, Optional
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce


class AlpacaExecutor:
    """Alpaca order execution with comprehensive error handling"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        """
        Initialize Alpaca client
        
        Args:
            api_key: Alpaca API key (defaults to ALPACA_API_KEY env var)
            api_secret: Alpaca API secret (defaults to ALPACA_API_SECRET env var)
            base_url: Alpaca base URL (defaults to ALPACA_BASE_URL or paper trading)
        """
        self.api_key = api_key or os.getenv('ALPACA_API_KEY')
        self.api_secret = api_secret or os.getenv('ALPACA_API_SECRET')
        self.base_url = base_url or os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')
        
        if not self.api_key or not self.api_secret:
            raise ValueError(
                "Missing Alpaca credentials. Set ALPACA_API_KEY and ALPACA_API_SECRET "
                "environment variables or pass them to the constructor."
            )
        
        # Determine if using paper trading
        self.is_paper = 'paper' in self.base_url.lower()
        
        try:
            self.client = TradingClient(
                api_key=self.api_key,
                secret_key=self.api_secret,
                paper=self.is_paper
            )
        except Exception as e:
            raise ValueError(f"Failed to initialize Alpaca client: {str(e)}")
    
    def execute_trade(
        self,
        symbol: str,
        side: str,
        mode: str,
        dollars: Optional[float] = None,
        shares: Optional[float] = None,
        min_dollars: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Execute a trade on Alpaca
        
        Args:
            symbol: Stock symbol (e.g., "AAPL")
            side: Order side ("buy" or "sell")
            mode: Execution mode ("auto", "dollars", "shares")
            dollars: Dollar amount for fractional/notional orders
            shares: Number of shares for share-based orders
            min_dollars: Minimum dollar amount for auto mode (default: 1.0)
        
        Returns:
            Dict with success status, order details, or error information
        """
        try:
            # Validate inputs
            if not symbol:
                return {
                    "success": False,
                    "error": "Missing required parameter: symbol"
                }
            
            if side not in ['buy', 'sell']:
                return {
                    "success": False,
                    "error": f"Invalid side '{side}'. Must be 'buy' or 'sell'."
                }
            
            if mode not in ['auto', 'dollars', 'shares']:
                return {
                    "success": False,
                    "error": f"Invalid mode '{mode}'. Must be 'auto', 'dollars', or 'shares'."
                }
            
            # Mode-specific validation
            if mode == 'shares' and not shares:
                return {
                    "success": False,
                    "error": "shares parameter required when mode is 'shares'"
                }
            
            if mode in ['dollars', 'auto'] and not dollars:
                return {
                    "success": False,
                    "error": f"dollars parameter required when mode is '{mode}'"
                }
            
            # Minimum amount validation (applies to all modes with dollar amounts)
            if mode in ['auto', 'dollars'] and dollars:
                min_amount = min_dollars or 1.0
                if dollars < min_amount:
                    return {
                        "success": False,
                        "error": f"Order size ${dollars:.2f} below minimum ${min_amount:.2f}"
                    }
            
            # Check account buying power (for buy orders)
            if side == 'buy':
                account = self.client.get_account()
                buying_power = float(account.buying_power)
                
                # Validate buying power for dollar-based orders
                # Note: For share-based orders, we rely on Alpaca's validation
                # since we'd need real-time price data to calculate dollar value
                if mode in ['dollars', 'auto'] and dollars:
                    if dollars > buying_power:
                        return {
                            "success": False,
                            "error": f"Insufficient buying power. Required: ${dollars:.2f}, Available: ${buying_power:.2f}"
                        }
            
            # Convert side to Alpaca enum
            order_side = OrderSide.BUY if side == 'buy' else OrderSide.SELL
            
            # Build order request based on mode
            if mode == 'shares':
                # Share-based order
                order_data = MarketOrderRequest(
                    symbol=symbol,
                    qty=shares,
                    side=order_side,
                    time_in_force=TimeInForce.DAY
                )
            else:
                # Dollar-based (notional/fractional) order
                order_data = MarketOrderRequest(
                    symbol=symbol,
                    notional=dollars,
                    side=order_side,
                    time_in_force=TimeInForce.DAY
                )
            
            # Submit order
            order = self.client.submit_order(order_data)
            
            return {
                "success": True,
                "message": f"Order submitted successfully",
                "order_id": order.id,
                "details": {
                    "symbol": order.symbol,
                    "side": order.side.value,
                    "qty": str(order.qty) if order.qty else None,
                    "notional": str(order.notional) if order.notional else None,
                    "status": order.status.value,
                    "submitted_at": order.submitted_at.isoformat() if order.submitted_at else None,
                    "filled_at": order.filled_at.isoformat() if order.filled_at else None,
                    "type": order.type.value,
                    "time_in_force": order.time_in_force.value
                }
            }
            
        except Exception as e:
            error_msg = str(e)
            
            # Parse common Alpaca errors for better messages
            if "insufficient" in error_msg.lower():
                return {
                    "success": False,
                    "error": "Insufficient buying power for this order"
                }
            elif "not found" in error_msg.lower() or "invalid symbol" in error_msg.lower():
                return {
                    "success": False,
                    "error": f"Invalid or unknown symbol: {symbol}"
                }
            elif "market closed" in error_msg.lower():
                return {
                    "success": False,
                    "error": "Market is currently closed"
                }
            elif "forbidden" in error_msg.lower() or "unauthorized" in error_msg.lower():
                return {
                    "success": False,
                    "error": "Alpaca authentication failed - check API credentials"
                }
            else:
                return {
                    "success": False,
                    "error": f"Order execution failed: {error_msg}"
                }


def main():
    """CLI entry point for testing"""
    import json
    
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Usage: optr_alpaca_execute.py <symbol> <side> <mode> [--dollars N] [--shares N] [--min-dollars N]"
        }))
        sys.exit(1)
    
    symbol = sys.argv[1]
    side = sys.argv[2]
    mode = sys.argv[3]
    
    # Parse optional arguments
    dollars = None
    shares = None
    min_dollars = None
    
    i = 4
    while i < len(sys.argv):
        if sys.argv[i] == '--dollars' and i + 1 < len(sys.argv):
            dollars = float(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--shares' and i + 1 < len(sys.argv):
            shares = float(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--min-dollars' and i + 1 < len(sys.argv):
            min_dollars = float(sys.argv[i + 1])
            i += 2
        else:
            i += 1
    
    try:
        executor = AlpacaExecutor()
        result = executor.execute_trade(
            symbol=symbol,
            side=side,
            mode=mode,
            dollars=dollars,
            shares=shares,
            min_dollars=min_dollars
        )
        print(json.dumps(result, indent=2))
        sys.exit(0 if result.get('success') else 1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == '__main__':
    main()
