#!/bin/bash

echo "Starting simple HTTP server to test login..."
echo "Open http://localhost:8000/login-test.html in your browser"

# Start a simple HTTP server
python3 -m http.server 8000