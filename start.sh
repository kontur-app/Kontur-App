#!/bin/bash

echo "=== Starting Kontur Application ==="

# Backend
echo "Starting Django backend on port 8000..."
cd backend
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Frontend
echo "Starting Next.js frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=== Kontur App Running ==="
echo "Backend:  http://localhost:8000/api/"
echo "Frontend: http://localhost:3000"
echo "Admin:    http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop all servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
