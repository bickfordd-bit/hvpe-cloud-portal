#!/bin/bash
# Integration test for OPTR trade components

set -e

echo "=== OPTR Trade Integration Tests ==="
echo ""

# Test 1: Python syntax
echo "✓ Test 1: Python syntax check"
python3 -m py_compile optr_alpaca_execute.py run_trade.py worker_http.py
echo "  All Python scripts have valid syntax"
echo ""

# Test 2: CLI help
echo "✓ Test 2: CLI help output"
python3 run_trade.py --help > /dev/null
echo "  CLI help works correctly"
echo ""

# Test 3: CLI error handling (missing credentials)
echo "✓ Test 3: CLI error handling"
output=$(python3 run_trade.py AAPL buy dollars --dollars 100 2>&1 || true)
if echo "$output" | grep -q "Missing Alpaca credentials"; then
    echo "  Credential validation works correctly"
else
    echo "  ERROR: Expected credential error"
    echo "  Got: $output"
    exit 1
fi
echo ""

# Test 4: Validation errors
echo "✓ Test 4: Input validation"
output=$(python3 run_trade.py AAPL buy invalid_mode --dollars 100 2>&1 || true)
if echo "$output" | grep -q "invalid choice"; then
    echo "  Mode validation works correctly"
else
    echo "  ERROR: Expected mode validation error"
    echo "  Got: $output"
    exit 1
fi
echo ""

# Test 5: HTTP worker startup check (without actually starting it)
echo "✓ Test 5: HTTP worker module import"
python3 -c "from worker_http import OPTRWorkerHandler, run_server; print('Worker imports successfully')"
echo ""

echo "=== All Tests Passed ==="
echo ""
echo "To run the full stack locally:"
echo ""
echo "1. Set environment variables:"
echo "   export OPTR_ADMIN_KEY='your-secret-key'"
echo "   export ALPACA_API_KEY='your-alpaca-key'"
echo "   export ALPACA_API_SECRET='your-alpaca-secret'"
echo ""
echo "2. Start the worker:"
echo "   python3 worker_http.py"
echo ""
echo "3. In the portal directory, set:"
echo "   export OPTR_ADMIN_KEY='your-secret-key'"
echo "   export OPTR_WORKER_URL='http://localhost:8787'"
echo ""
echo "4. Start the Next.js dev server:"
echo "   npm run dev"
echo ""
echo "5. Test the API:"
echo "   curl -X POST http://localhost:3000/api/optr/trade \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'x-optr-admin-key: your-secret-key' \\"
echo "     -d '{\"symbol\":\"AAPL\",\"side\":\"buy\",\"mode\":\"dollars\",\"dollars\":100}'"
