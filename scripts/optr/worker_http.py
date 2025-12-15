#!/usr/bin/env python3
"""
OPTR Execution Worker HTTP Server

Minimal HTTP server that validates OPTR_ADMIN_KEY, invokes the executor,
and returns JSON responses. Configurable port via OPTR_WORKER_PORT.
"""

import os
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Dict, Any
from optr_alpaca_execute import AlpacaExecutor


class OPTRWorkerHandler(BaseHTTPRequestHandler):
    """HTTP request handler for OPTR trade execution"""
    
    def _send_json_response(self, data: Dict[str, Any], status_code: int = 200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, x-optr-admin-key')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _log_request(self, message: str, **kwargs):
        """Log request with context"""
        log_data = {
            "message": message,
            "path": self.path,
            "client": self.client_address[0],
            **kwargs
        }
        print(json.dumps(log_data), file=sys.stderr)
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self._send_json_response({}, 204)
    
    def do_POST(self):
        """Handle POST requests"""
        # Only accept /trade or root path
        if self.path not in ['/', '/trade']:
            self._send_json_response({
                "success": False,
                "error": f"Not found: {self.path}"
            }, 404)
            return
        
        try:
            # Validate admin key
            admin_key = self.headers.get('x-optr-admin-key')
            expected_key = os.getenv('OPTR_ADMIN_KEY')
            
            if not expected_key:
                self._log_request("OPTR_ADMIN_KEY not configured", level="error")
                self._send_json_response({
                    "success": False,
                    "error": "Server configuration error"
                }, 500)
                return
            
            if not admin_key or admin_key != expected_key:
                self._log_request("Unauthorized request", has_key=bool(admin_key))
                self._send_json_response({
                    "success": False,
                    "error": "Unauthorized - Invalid or missing x-optr-admin-key"
                }, 401)
                return
            
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_json_response({
                    "success": False,
                    "error": "Empty request body"
                }, 400)
                return
            
            body_data = self.rfile.read(content_length)
            request_data = json.loads(body_data.decode('utf-8'))
            
            # Extract parameters
            symbol = request_data.get('symbol')
            side = request_data.get('side')
            mode = request_data.get('mode')
            dollars = request_data.get('dollars')
            shares = request_data.get('shares')
            min_dollars = request_data.get('min_dollars')
            
            self._log_request("Executing trade", symbol=symbol, side=side, mode=mode)
            
            # Execute trade
            executor = AlpacaExecutor()
            result = executor.execute_trade(
                symbol=symbol,
                side=side,
                mode=mode,
                dollars=dollars,
                shares=shares,
                min_dollars=min_dollars
            )
            
            # Return result with appropriate status code
            status_code = 200 if result.get('success') else 400
            self._send_json_response(result, status_code)
            
            if result.get('success'):
                self._log_request("Trade executed", order_id=result.get('order_id'))
            else:
                self._log_request("Trade failed", error=result.get('error'))
        
        except json.JSONDecodeError as e:
            self._log_request("Invalid JSON", error=str(e))
            self._send_json_response({
                "success": False,
                "error": f"Invalid JSON: {str(e)}"
            }, 400)
        
        except ValueError as e:
            self._log_request("Configuration error", error=str(e))
            self._send_json_response({
                "success": False,
                "error": str(e)
            }, 500)
        
        except Exception as e:
            self._log_request("Unexpected error", error=str(e))
            self._send_json_response({
                "success": False,
                "error": f"Internal server error: {str(e)}"
            }, 500)
    
    def log_message(self, format, *args):
        """Override to use structured logging"""
        # Suppress default logging, use custom _log_request instead
        pass


def run_server(port: int = 8787):
    """Start the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, OPTRWorkerHandler)
    
    # Check configuration
    if not os.getenv('OPTR_ADMIN_KEY'):
        print(json.dumps({
            "level": "warning",
            "message": "OPTR_ADMIN_KEY not set - server will reject all requests"
        }), file=sys.stderr)
    
    if not os.getenv('ALPACA_API_KEY') or not os.getenv('ALPACA_API_SECRET'):
        print(json.dumps({
            "level": "warning",
            "message": "Alpaca credentials not set - trades will fail"
        }), file=sys.stderr)
    
    # Determine trading mode
    base_url = os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')
    is_paper = 'paper' in base_url.lower()
    
    print(json.dumps({
        "level": "info",
        "message": "OPTR Execution Worker started",
        "port": port,
        "mode": "paper" if is_paper else "live",
        "base_url": base_url
    }), file=sys.stderr)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(json.dumps({
            "level": "info",
            "message": "Server shutting down"
        }), file=sys.stderr)
        httpd.shutdown()


def main():
    """Entry point"""
    port = int(os.getenv('OPTR_WORKER_PORT', 8787))
    
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port: {sys.argv[1]}", file=sys.stderr)
            sys.exit(1)
    
    run_server(port)


if __name__ == '__main__':
    main()
