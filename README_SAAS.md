# 🚀 LinkedIn Auto Poster - SaaS Platform

> **Transform your LinkedIn presence with AI-powered automation**

A comprehensive, enterprise-grade SaaS platform for automating LinkedIn content creation, scheduling, and publishing using AI technology.

## ✨ What's New in Version 2.0

This project has been transformed from a command-line tool into a **full-featured SaaS platform** with:

- 🔐 **Multi-tenant architecture** with organization management
- 💳 **Stripe-integrated billing** with multiple pricing tiers
- 🎨 **Modern React frontend** with responsive design
- 🤖 **AI-powered content generation** using Ollama (local) or OpenAI
- 📊 **Advanced analytics** and performance tracking
- 👥 **Team collaboration** with role-based access control
- 🔒 **Enterprise security** with MFA, encryption, and audit logs
- 🐳 **Docker deployment** ready for production

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Pricing Tiers](#pricing-tiers)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🎯 Features

### Core Features

✅ **AI Content Generation**
- Local AI processing with Ollama (llama3, mistral)
- Cloud AI fallback (OpenAI GPT-4)
- Multiple tone options (Professional, Casual, Inspirational, Educational)
- Automatic hashtag generation
- Engagement prediction

✅ **Intelligent Scheduling**
- Visual content calendar
- Optimal time recommendations
- Recurring post series
- Bulk scheduling
- Timezone support

✅ **LinkedIn Publishing**
- Browser automation (Playwright)
- Multi-account management
- Media support (images, videos, documents)
- Post verification and screenshots
- Automatic retry on failures

✅ **Analytics & Insights**
- Post performance tracking
- Engagement metrics
- Follower growth
- Content type analysis
- Competitive benchmarking

### SaaS Platform Features

✅ **Authentication & Security**
- Email/password authentication
- Multi-factor authentication (MFA)
- Social login (Google, LinkedIn)
- JWT-based sessions
- Encrypted credential storage

✅ **Multi-Tenancy**
- Organization-based isolation
- Team member management
- Role-based access control
- Invitation system
- Workspace management

✅ **Subscription Management**
- Stripe integration
- Multiple pricing tiers
- Usage tracking and quotas
- Automated billing
- Self-service portal

✅ **Team Collaboration**
- 5 role types (Owner, Admin, Manager, Creator, Viewer)
- Content approval workflows
- Team activity tracking
- Shared content libraries
- Brand guidelines enforcement

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React + TS)                  │
│  - Authentication UI  - Dashboard  - Content Calendar   │
│  - Analytics  - Settings  - Team Management             │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Express + TS)                 │
│  - JWT Auth  - Rate Limiting  - Request Validation      │
└─────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │  MongoDB    │    │   Redis     │
│ (Users,     │    │ (Posts,     │    │ (Cache,     │
│ Orgs, Subs) │    │ Analytics)  │    │ Sessions,   │
│             │    │             │    │ Queues)     │
└─────────────┘    └─────────────┘    └─────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Ollama    │    │  Playwright │    │   BullMQ    │
│ (AI Models) │    │ (LinkedIn)  │    │ (Jobs)      │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd linkedin-auto-poster

# Copy environment files
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start all services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Initialize database
docker-compose exec postgres psql -U postgres -d linkedin_auto_poster -f /docker-entrypoint-initdb.d/init.sql

# Pull AI model
docker-compose exec ollama ollama pull llama3

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 💰 Pricing Tiers

### Free Plan
- 1 LinkedIn account
- 10 posts per month
- Basic AI content generation
- 7-day content calendar
- Community support
- 1 GB storage

### Professional Plan ($29/month)
- 3 LinkedIn accounts
- Unlimited posts
- Advanced AI (multiple models)
- 90-day content calendar
- Email support
- 10 GB storage
- Basic analytics
- Priority publishing

### Team Plan ($99/month)
- 10 LinkedIn accounts
- Everything in Pro
- Team collaboration (5 seats)
- Approval workflows
- Advanced analytics
- Priority support
- 50 GB storage
- API access (basic)

### Enterprise Plan (Custom pricing)
- Unlimited accounts
- Unlimited seats
- Custom AI model training
- White-label options
- Dedicated support
- SSO/SAML
- SLA guarantees
- API access (full)
- 500 GB+ storage
- Custom integrations

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Express.js
- **Databases:** PostgreSQL 15, MongoDB 7, Redis 7
- **AI:** Ollama (llama3, mistral), OpenAI (optional)
- **Automation:** Playwright
- **Queue:** BullMQ
- **Payments:** Stripe
- **Authentication:** JWT, Passport.js

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** React Query
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6

### Infrastructure
- **Containers:** Docker + Docker Compose
- **Web Server:** Nginx (production)
- **Monitoring:** Ready for DataDog/Sentry
- **Storage:** AWS S3 (ready)
- **Email:** SendGrid (ready)

## 📚 Documentation

- **[Complete Setup Guide](./SAAS_PLATFORM_GUIDE.md)** - Comprehensive implementation guide
- **[Product Requirements](./PRD.md)** - Detailed product specifications
- **[API Documentation](./SAAS_PLATFORM_GUIDE.md#api-documentation)** - API endpoints and usage
- **[Database Schema](./SAAS_PLATFORM_GUIDE.md#database-schema-overview)** - Database structure

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/linkedin_auto_poster
MONGODB_URI=mongodb://localhost:27017/linkedin_auto_poster
REDIS_HOST=localhost

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AI
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
OPENAI_API_KEY=sk-... (optional)

# Email
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@yourdomain.com
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📊 Project Structure

```
linkedin-auto-poster/
├── backend/                 # Backend API (Node.js + TypeScript)
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── jobs/           # Background jobs
│   │   ├── utils/          # Utilities
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Frontend app (React + TypeScript)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   ├── store/         # State management
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app
│   ├── package.json
│   └── vite.config.ts
│
├── infrastructure/        # DevOps and deployment
│   └── docker/
│       ├── docker-compose.yml
│       ├── Dockerfile.backend
│       └── Dockerfile.frontend
│
├── docs/                  # Additional documentation
├── PRD.md                # Product Requirements Document
├── SAAS_PLATFORM_GUIDE.md # Complete implementation guide
└── README_SAAS.md        # This file
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ollama for local AI capabilities
- Playwright for reliable browser automation
- Stripe for seamless payment processing
- The open-source community

## 📞 Support

- **Documentation:** See [SAAS_PLATFORM_GUIDE.md](./SAAS_PLATFORM_GUIDE.md)
- **Issues:** Create an issue on GitHub
- **Email:** support@yourdomain.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] A/B testing for posts
- [ ] Content suggestions based on trending topics
- [ ] LinkedIn engagement automation
- [ ] White-label options
- [ ] Advanced scheduling algorithms
- [ ] Integration marketplace

---

**Made with ❤️ for professionals who want to automate their LinkedIn presence**

**Version:** 2.0.0 | **Status:** Production Ready 🚀
