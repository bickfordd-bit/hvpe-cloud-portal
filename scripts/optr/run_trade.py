#!/usr/bin/env python3
"""
OPTR Trade CLI
Command-line interface for executing trades.
Wraps optr_alpaca_execute.py and respects all env-based guards.
"""

import sys
import json
import argparse
from typing import Optional
from optr_alpaca_execute import execute_trade


def parse_args():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(
        description='Execute OPTR trade via Alpaca',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Market buy $50 of AAPL
  %(prog)s --symbol AAPL --side buy --notional 50

  # Market buy 10 shares of AAPL
  %(prog)s --symbol AAPL --side buy --qty 10

  # Limit buy 10 shares at $150
  %(prog)s --symbol AAPL --side buy --qty 10 --type limit --limit-price 150.00

Environment Variables:
  ALPACA_API_KEY, ALPACA_SECRET_KEY, ALPACA_BASE_URL
  OPTR_SYMBOL_ALLOWLIST, OPTR_MAX_NOTIONAL, OPTR_MAX_NOTIONAL_PER_DAY
  OPTR_ALLOW_LIVE (default: false, blocks live trading)
        """
    )
    
    parser.add_argument('--symbol', required=True, help='Stock symbol (e.g., AAPL)')
    parser.add_argument('--side', required=True, choices=['buy', 'sell'], help='Trade side')
    parser.add_argument('--qty', type=float, help='Number of shares')
    parser.add_argument('--notional', type=float, help='Dollar amount (for fractional shares)')
    parser.add_argument('--type', choices=['market', 'limit'], default='market', help='Order type')
    parser.add_argument('--limit-price', type=float, help='Limit price (required for limit orders)')
    parser.add_argument('--time-in-force', choices=['day', 'gtc', 'ioc', 'fok'], default='day', help='Time in force')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    
    return parser.parse_args()


def main():
    """Main entry point"""
    args = parse_args()
    
    # Validate qty or notional
    if not args.qty and not args.notional:
        print("Error: Must specify either --qty or --notional", file=sys.stderr)
        sys.exit(1)
    
    if args.qty and args.notional:
        print("Error: Cannot specify both --qty and --notional", file=sys.stderr)
        sys.exit(1)
    
    # Validate limit order
    if args.type == 'limit' and not args.limit_price:
        print("Error: --limit-price required for limit orders", file=sys.stderr)
        sys.exit(1)
    
    # Build trade request
    trade_request = {
        "symbol": args.symbol,
        "side": args.side,
        "type": args.type,
        "time_in_force": args.time_in_force
    }
    
    if args.qty:
        trade_request["qty"] = args.qty
    if args.notional:
        trade_request["notional"] = args.notional
    if args.limit_price:
        trade_request["limit_price"] = args.limit_price
    
    # Execute trade (respects all env-based guards via executor)
    result = execute_trade(trade_request)
    
    # Output result
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result["success"]:
            print(f"✓ Trade executed successfully")
            print(f"  Order ID: {result.get('order_id')}")
            print(f"  Symbol: {result.get('symbol')}")
            print(f"  Side: {result.get('side')}")
            print(f"  Status: {result.get('status')}")
            if result.get('filled_qty'):
                print(f"  Filled: {result.get('filled_qty')} @ {result.get('filled_avg_price', 'pending')}")
        else:
            print(f"✗ Trade failed: {result.get('reason')}", file=sys.stderr)
            print(f"  {result.get('message', '')}", file=sys.stderr)
    
    sys.exit(0 if result["success"] else 1)


if __name__ == '__main__':
    main()
