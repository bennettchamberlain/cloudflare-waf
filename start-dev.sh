#!/bin/bash

# Cloudflare WAF Manager - Development Startup Script

echo "🚀 Starting Cloudflare WAF Manager Development Environment"
echo "==========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Port $1 is already in use. Please stop the service using this port."
        return 1
    fi
    return 0
}

# Check if ports are available
check_port 3000 || exit 1
check_port 8000 || exit 1

echo "📦 Setting up backend..."
echo "------------------------"

# Setup backend
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

# Start backend in background
echo "Starting FastAPI backend on http://localhost:8000..."
python main.py &
BACKEND_PID=$!

cd ..

echo ""
echo "🌐 Setting up frontend..."
echo "-------------------------"

# Setup frontend
cd frontend

# Install npm dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from template..."
    cp .env.local.example .env.local
fi

# Start frontend in background
echo "Starting Next.js frontend on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Development environment started!"
echo "==================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait