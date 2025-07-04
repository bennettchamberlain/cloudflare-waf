# 🚀 Quick Start Guide

Get your Cloudflare WAF Manager up and running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://python.org/))
- A Cloudflare account with an API token ([Get Token](https://dash.cloudflare.com/profile/api-tokens))

## Option 1: Automated Setup (Recommended)

### Linux/macOS
```bash
./start-dev.sh
```

### Windows
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py

# In a new terminal - Frontend
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

## Option 2: Manual Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### 2. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## 🎉 You're Ready!

- **Application**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Test the Demo

1. **Enter a domain**: `example.com`
2. **Choose verification**: DNS or Meta tag
3. **Enter API token**: Use any text (demo mode)
4. **Toggle WAF rules**: Try enabling different protection rules
5. **View analytics**: See the mock dashboard with statistics

## 🔑 Real Cloudflare Integration

To connect with real Cloudflare:

1. Create an API token at: https://dash.cloudflare.com/profile/api-tokens
2. Grant permissions:
   - Zone:Zone:Read
   - Zone:Zone Settings:Edit  
   - Zone:Zone WAF:Edit
3. Replace `demo-token` in the frontend with real authentication
4. Use your actual domain and API token

## 🛟 Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000

# Kill the processes
kill -9 <PID>
```

### Missing Dependencies
```bash
# Update Node.js
node --version  # Should be 18+

# Update Python
python3 --version  # Should be 3.8+
```

### CORS Issues
Make sure both frontend (3000) and backend (8000) are running.

## 📚 What's Next?

1. Read the full [README.md](README.md) for detailed documentation
2. Explore the API at http://localhost:8000/docs
3. Customize the WAF rules in `backend/main.py`
4. Modify the UI components in `frontend/src/components/`

## 🚀 Deploy to Production

- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel, Netlify, or AWS Amplify

See [README.md](README.md) for detailed deployment instructions.