#!/usr/bin/env python3
"""
OPTR Trade CLI Wrapper

Simple command-line interface for executing trades via the OPTR Alpaca executor.
Accepts arguments and prints JSON results.
"""

import sys
import json
import argparse
from optr_alpaca_execute import AlpacaExecutor


def main():
    """Parse arguments and execute trade"""
    parser = argparse.ArgumentParser(
        description='Execute OPTR trades via Alpaca',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Buy $100 of AAPL in auto mode
  python run_trade.py AAPL buy auto --dollars 100

  # Buy 10 shares of TSLA
  python run_trade.py TSLA buy shares --shares 10

  # Sell $50 of NVDA with minimum $10
  python run_trade.py NVDA sell auto --dollars 50 --min-dollars 10
        """
    )
    
    parser.add_argument('symbol', help='Stock symbol (e.g., AAPL, TSLA)')
    parser.add_argument('side', choices=['buy', 'sell'], help='Order side')
    parser.add_argument('mode', choices=['auto', 'dollars', 'shares'], help='Execution mode')
    parser.add_argument('--dollars', type=float, help='Dollar amount for fractional orders')
    parser.add_argument('--shares', type=float, help='Number of shares')
    parser.add_argument('--min-dollars', type=float, help='Minimum dollar amount (auto mode)')
    
    # Optional credentials (fallback to env vars)
    parser.add_argument('--api-key', help='Alpaca API key (defaults to ALPACA_API_KEY env)')
    parser.add_argument('--api-secret', help='Alpaca API secret (defaults to ALPACA_API_SECRET env)')
    parser.add_argument('--base-url', help='Alpaca base URL (defaults to paper trading)')
    
    args = parser.parse_args()
    
    try:
        # Initialize executor
        executor = AlpacaExecutor(
            api_key=args.api_key,
            api_secret=args.api_secret,
            base_url=args.base_url
        )
        
        # Execute trade
        result = executor.execute_trade(
            symbol=args.symbol,
            side=args.side,
            mode=args.mode,
            dollars=args.dollars,
            shares=args.shares,
            min_dollars=args.min_dollars
        )
        
        # Print JSON result
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result.get('success') else 1)
        
    except ValueError as e:
        # Configuration errors
        print(json.dumps({
            "success": False,
            "error": str(e)
        }, indent=2))
        sys.exit(1)
    except Exception as e:
        # Unexpected errors
        print(json.dumps({
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
