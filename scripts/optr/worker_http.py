#!/usr/bin/env python3
"""
OPTR HTTP Worker
HTTP server that accepts trade requests and forwards to executor.
Runs on port 8787 by default.
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional

# Import executor
from optr_alpaca_execute import execute_trade


class TradeHandler(BaseHTTPRequestHandler):
    """HTTP request handler for trade execution"""
    
    def log_message(self, format, *args):
        """Override to use structured logging"""
        rid = getattr(self, 'request_id', 'unknown')
        message = format % args
        log_entry = {
            "level": "info",
            "message": message,
            "rid": rid,
            "path": self.path,
            "method": self.command
        }
        print(json.dumps(log_entry), file=sys.stderr)
    
    def send_json_response(self, data: dict, status_code: int = 200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def authenticate(self) -> bool:
        """Check x-optr-admin-key header"""
        admin_key = self.headers.get('x-optr-admin-key')
        expected_key = os.getenv('OPTR_ADMIN_KEY')
        
        if not expected_key:
            # If no key configured, allow (development mode)
            return True
        
        return admin_key == expected_key
    
    def do_POST(self):
        """Handle POST requests"""
        # Extract request ID
        self.request_id = self.headers.get('x-request-id', f'worker_{os.getpid()}_{id(self)}')
        
        # Only accept /trade endpoint
        if self.path not in ['/trade', '/']:
            self.send_json_response({
                "success": False,
                "reason": "not_found",
                "message": f"Endpoint {self.path} not found"
            }, 404)
            return
        
        # Authenticate
        if not self.authenticate():
            self.send_json_response({
                "success": False,
                "reason": "unauthorized",
                "message": "Invalid or missing x-optr-admin-key"
            }, 401)
            return
        
        # Parse request body
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            trade_request = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_json_response({
                "success": False,
                "reason": "invalid_json",
                "message": "Invalid JSON payload"
            }, 400)
            return
        except Exception as e:
            self.send_json_response({
                "success": False,
                "reason": "bad_request",
                "message": str(e)
            }, 400)
            return
        
        # Validate required fields
        if not isinstance(trade_request, dict):
            self.send_json_response({
                "success": False,
                "reason": "invalid_payload",
                "message": "Payload must be a JSON object"
            }, 400)
            return
        
        if "symbol" not in trade_request or "side" not in trade_request:
            self.send_json_response({
                "success": False,
                "reason": "missing_fields",
                "message": "Missing required fields: symbol, side"
            }, 400)
            return
        
        # Log request
        print(json.dumps({
            "level": "info",
            "message": "Processing trade request",
            "rid": self.request_id,
            "symbol": trade_request.get("symbol"),
            "side": trade_request.get("side")
        }), file=sys.stderr)
        
        # Execute trade via executor (which handles all safety checks)
        result = execute_trade(trade_request)
        
        # Determine status code
        if result["success"]:
            status_code = 200
        else:
            reason = result.get("reason", "")
            if reason in ["unauthorized", "missing_credentials"]:
                status_code = 401
            elif reason in ["invalid_json", "missing_fields", "invalid_payload", 
                           "symbol_not_allowed", "exceeds_max_notional", "exceeds_daily_notional"]:
                status_code = 400
            elif reason in ["live_trading_blocked"]:
                status_code = 403
            else:
                status_code = 500
        
        # Log result
        print(json.dumps({
            "level": "info" if result["success"] else "error",
            "message": "Trade result",
            "rid": self.request_id,
            "success": result["success"],
            "reason": result.get("reason"),
            "order_id": result.get("order_id")
        }), file=sys.stderr)
        
        # Send response
        self.send_json_response(result, status_code)
    
    def do_GET(self):
        """Handle GET requests (health check)"""
        if self.path == '/health':
            self.send_json_response({
                "status": "ok",
                "service": "optr-worker",
                "version": "1.0.0"
            }, 200)
        else:
            self.send_json_response({
                "success": False,
                "reason": "method_not_allowed",
                "message": "Only POST requests accepted for trading"
            }, 405)


def run_server(port: int = 8787):
    """Start HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, TradeHandler)
    
    print(json.dumps({
        "level": "info",
        "message": f"OPTR Worker started on port {port}",
        "port": port,
        "pid": os.getpid()
    }), file=sys.stderr)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(json.dumps({
            "level": "info",
            "message": "OPTR Worker shutting down"
        }), file=sys.stderr)
        httpd.shutdown()


if __name__ == '__main__':
    port = int(os.getenv('OPTR_WORKER_PORT', '8787'))
    run_server(port)
