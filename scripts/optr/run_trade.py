#!/usr/bin/env python3
"""
CLI wrapper for OPTR trade execution
Calls optr_alpaca_execute.py and prints JSON result
"""

import sys
import json
from optr_alpaca_execute import AlpacaExecutor
from dataclasses import asdict


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Execute OPTR trade via Alpaca (CLI)')
    parser.add_argument('--symbol', required=True, help='Stock symbol (e.g., AAPL)')
    parser.add_argument('--side', choices=['buy', 'sell'], default='buy', help='Buy or sell')
    parser.add_argument('--mode', choices=['auto', 'dollars', 'shares'], default='auto', help='Execution mode')
    parser.add_argument('--dollars', type=float, default=0, help='Dollar amount (for dollars/auto mode)')
    parser.add_argument('--shares', type=float, default=0, help='Number of shares (for shares mode)')
    parser.add_argument('--min-dollars', type=float, default=1.0, help='Minimum dollar threshold')
    parser.add_argument('--request-id', help='Request tracking ID (optional)')
    
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
        
        # Print JSON result
        print(json.dumps(asdict(result), indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result.success else 1)
        
    except Exception as e:
        error_result = {
            'success': False,
            'symbol': args.symbol,
            'side': args.side,
            'mode': args.mode,
            'shares_executed': 0,
            'dollars_executed': 0,
            'error': str(e),
            'reason': 'cli_error',
            'request_id': args.request_id
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
