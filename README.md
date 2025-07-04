# Cloudflare WAF Manager

A web application that makes it easy for Webflow site owners to set up Cloudflare WAF (Web Application Firewall) protection without having to learn the Cloudflare UI or write complex rules.

## 🎯 Problem

Many non-technical Webflow users experience high bot traffic and bandwidth costs due to scraping but don't know how to configure security tools like Cloudflare properly. This application provides a simple dashboard to:

- Connect their Webflow site
- Connect their Cloudflare account  
- Enable prebuilt WAF rule templates (like blocking scrapers, rate-limiting, or geo-blocking)
- View basic analytics like traffic, blocked requests, and bandwidth saved

## 🏗️ Architecture

This is a monorepo with two main components:

```
cloudflare-waf/
├── frontend/       # Next.js (React, TypeScript, Tailwind CSS, shadcn/ui)
│   └── UI for onboarding, toggling rules, showing stats
├── backend/        # FastAPI (Python)
│   └── Handles domain verification, Cloudflare API calls, analytics
```

### Frontend Stack
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **Axios** for API calls
- **React Hook Form** for form handling
- **Recharts** for analytics visualization

### Backend Stack  
- **FastAPI** for the REST API
- **Pydantic** for data validation
- **httpx** for Cloudflare API requests
- **python-dotenv** for environment configuration
- **JWT** for authentication (demo mode included)

## 🚀 Features

### ✅ Implemented Features

1. **Domain Verification**
   - DNS TXT record verification
   - Meta tag verification
   - Step-by-step onboarding flow

2. **Cloudflare Integration**
   - API token connection
   - Zone detection and management
   - Secure credential handling

3. **WAF Rule Templates**
   - Block Common Scrapers
   - Aggressive Rate Limiting  
   - Geo-blocking for suspicious countries
   - SQL Injection Protection
   - XSS Protection
   - Toggle rules on/off with simple switches

4. **Analytics Dashboard**
   - Total requests and blocked requests
   - Bandwidth savings calculation
   - Protection rate percentage
   - Top blocked countries
   - Daily statistics visualization

5. **User Interface**
   - Beautiful, modern UI with shadcn/ui
   - Responsive design for all devices
   - Progressive onboarding flow
   - Real-time status indicators
   - Error handling and loading states

### 🔮 Potential Future Features

- OAuth authentication for Cloudflare
- Team/multi-user support
- Custom rule builder
- Advanced analytics with charts
- Email notifications for threats
- Webhook integrations
- Export/import rule configurations

## 🛠️ Setup & Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Cloudflare account** with an API token

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 API Documentation

### Authentication

All API endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

For demo purposes, use `demo-token` as the token.

### Key Endpoints

#### `GET /templates`
Get all available WAF rule templates.

#### `POST /verify-domain`
Verify domain ownership via DNS or meta tag.

**Request Body:**
```json
{
  "domain": "example.com",
  "verification_method": "dns"
}
```

#### `POST /connect-cloudflare`
Connect a Cloudflare account using an API token.

**Request Body:**
```json
{
  "api_token": "your-cloudflare-api-token"
}
```

#### `POST /apply-waf-rule`
Enable or disable a WAF rule template.

**Request Body:**
```json
{
  "template_id": "block_scrapers",
  "enabled": true
}
```

#### `GET /get-stats?domain=example.com&days=7`
Get analytics and statistics for a domain.

### Complete API documentation is available at `http://localhost:8000/docs` when running the backend.

## 🔐 Security Considerations

### Demo vs Production

This application includes demo/development features that should be replaced in production:

1. **Authentication**: Currently uses a demo token. Implement proper JWT authentication.
2. **API Token Storage**: Store Cloudflare tokens encrypted in a secure database.
3. **Rate Limiting**: Add rate limiting to prevent API abuse.
4. **Input Validation**: Enhanced validation for all user inputs.
5. **HTTPS**: Use HTTPS in production for all communications.

### Cloudflare API Token Permissions

Create a Cloudflare API token with these permissions:
- **Zone:Zone:Read** - To list and read zone information
- **Zone:Zone Settings:Edit** - To modify zone settings  
- **Zone:Zone WAF:Edit** - To create and manage firewall rules

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing  
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
- Deploy to services like **Railway**, **Render**, or **Heroku**
- Set environment variables for production
- Use a production database (PostgreSQL recommended)

### Frontend Deployment
- Deploy to **Vercel**, **Netlify**, or **AWS Amplify**
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Configure domain and SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](README.md)
2. Search existing [issues](https://github.com/yourusername/cloudflare-waf/issues)
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Cloudflare](https://www.cloudflare.com/) for their excellent API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [FastAPI](https://fastapi.tiangolo.com/) for the amazing Python framework
- [Next.js](https://nextjs.org/) for the React framework
