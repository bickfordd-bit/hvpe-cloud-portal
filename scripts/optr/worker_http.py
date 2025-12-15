#!/usr/bin/env python3
"""
OPTR Worker HTTP Server
Minimal HTTP server that accepts trade requests from the Next.js API
and executes them via Alpaca TradingClient.
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from dataclasses import asdict

try:
    from optr_alpaca_execute import AlpacaExecutor, OptrResult
except ImportError:
    print("Error: Could not import optr_alpaca_execute. Make sure the file is in the same directory.", file=sys.stderr)
    sys.exit(1)


class OptrTradeHandler(BaseHTTPRequestHandler):
    """Handles POST requests for trade execution"""
    
    def log_message(self, format, *args):
        """Override to control logging"""
        # Log to stderr with structured format
        sys.stderr.write(f"[Worker] {self.address_string()} - {format % args}\n")
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Check authentication
            admin_key = self.headers.get('x-optr-admin-key')
            expected_key = os.getenv('OPTR_ADMIN_KEY')
            
            if not expected_key:
                self.send_error_response(500, 'server_misconfigured', 'OPTR_ADMIN_KEY not set')
                return
            
            if not admin_key or admin_key != expected_key:
                self.send_error_response(401, 'unauthorized', 'Invalid or missing x-optr-admin-key')
                return
            
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error_response(400, 'invalid_body', 'Empty request body')
                return
            
            body_bytes = self.rfile.read(content_length)
            try:
                body = json.loads(body_bytes)
            except json.JSONDecodeError:
                self.send_error_response(400, 'invalid_json', 'Request body is not valid JSON')
                return
            
            # Extract parameters
            symbol = body.get('symbol')
            side = body.get('side', 'buy')
            mode = body.get('mode', 'auto')
            dollars = body.get('dollars', 0)
            shares = body.get('shares', 0)
            min_dollars = body.get('min_dollars', 1.0)
            request_id = body.get('request_id') or self.headers.get('x-request-id')
            
            if not symbol:
                self.send_error_response(400, 'missing_symbol', 'symbol is required')
                return
            
            # Execute trade
            try:
                executor = AlpacaExecutor()
                result = executor.execute_trade(
                    symbol=symbol,
                    side=side,
                    mode=mode,
                    dollars=float(dollars) if dollars else 0.0,
                    shares=float(shares) if shares else 0.0,
                    min_dollars=float(min_dollars) if min_dollars else 1.0,
                    request_id=request_id
                )
                
                # Send response
                if result.success:
                    self.send_json_response(200, asdict(result))
                else:
                    # Trade execution failed, but we can communicate the failure
                    self.send_json_response(400, asdict(result))
                    
            except ValueError as e:
                # Initialization error (missing env vars)
                error_result = OptrResult(
                    success=False,
                    symbol=symbol,
                    side=side,
                    mode=mode,
                    shares_executed=0,
                    dollars_executed=0,
                    error=str(e),
                    reason='executor_init_error',
                    request_id=request_id
                )
                self.send_json_response(500, asdict(error_result))
            
            except Exception as e:
                # Unexpected error
                error_result = OptrResult(
                    success=False,
                    symbol=symbol,
                    side=side,
                    mode=mode,
                    shares_executed=0,
                    dollars_executed=0,
                    error='Internal worker error',
                    reason='worker_error',
                    request_id=request_id
                )
                self.send_json_response(500, asdict(error_result))
                sys.stderr.write(f"[Worker] Unexpected error: {str(e)}\n")
        
        except Exception as e:
            # Catch-all for handler errors
            self.send_error_response(500, 'internal_error', 'Internal server error')
            sys.stderr.write(f"[Worker] Handler error: {str(e)}\n")
    
    def send_json_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, status_code, error_code, message):
        """Send error response (does not leak stack traces)"""
        error_data = {
            'success': False,
            'error': message,
            'error_code': error_code
        }
        self.send_json_response(status_code, error_data)


def run_server(port=8787):
    """Start the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, OptrTradeHandler)
    
    print(f"OPTR Worker listening on port {port}...", file=sys.stderr)
    print(f"Environment: ALPACA_BASE_URL={os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')}", file=sys.stderr)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down worker...", file=sys.stderr)
        httpd.shutdown()


def main():
    """Entry point"""
    port = int(os.getenv('OPTR_WORKER_PORT', '8787'))
    
    # Validate required env vars
    if not os.getenv('OPTR_ADMIN_KEY'):
        print("Error: OPTR_ADMIN_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)
    
    if not os.getenv('ALPACA_API_KEY') or not os.getenv('ALPACA_API_SECRET'):
        print("Error: ALPACA_API_KEY and ALPACA_API_SECRET must be set", file=sys.stderr)
        sys.exit(1)
    
    run_server(port)


if __name__ == '__main__':
    main()
