# 🤖 Launch Pixel AI Agent

> **Autonomous AI calling agents powered by ElevenLabs Conversational AI + Twilio**

Transform your sales and support operations with intelligent AI agents that can make and receive phone calls, understand context, and take actions autonomously.

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## ✨ Features

### 🎯 Outbound Hunter Agent
- **Automated Cold Calling**: Reach hundreds of prospects automatically
- **Intelligent Conversations**: Natural, context-aware dialogues
- **Objection Handling**: Trained to handle common objections
- **Meeting Booking**: Automatically schedules meetings with interested prospects
- **WhatsApp Notifications**: Real-time alerts for hot leads

### 📞 Inbound Closer Agent
- **24/7 Availability**: Never miss a call, even outside business hours
- **Smart Routing**: Qualifies leads and routes to appropriate team members
- **FAQ Handling**: Answers common questions using knowledge base
- **Support Tickets**: Creates tickets for complex issues
- **CRM Integration**: Logs all interactions automatically

### 🧠 Knowledge Base Training
- **Website Scraping**: Automatically extract content from your website
- **Document Upload**: Train on PDFs, DOCX, and text files
- **Dynamic Updates**: Update agent knowledge in real-time
- **Multi-source Learning**: Combine multiple data sources

### 📊 Analytics & Insights
- **Call Metrics**: Duration, success rate, conversion tracking
- **Conversation Analysis**: Sentiment analysis and key topics
- **Performance Dashboard**: Real-time metrics and trends
- **Export Reports**: CSV/PDF export for deeper analysis

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Dashboard     │  Next.js 14 (Cloudflare Pages)
│  (Frontend)     │  - Agent configuration
└────────┬────────┘  - Contact management
         │           - Analytics
         │
         ▼
┌─────────────────┐
│   API Routes    │  Next.js API Routes
│  (Middleware)   │  - Agent creation
└────────┬────────┘  - Webhook handling
         │           - Scraping
         │
         ▼
┌─────────────────┐
│ Cloudflare      │  Cloudflare Worker
│    Worker       │  - Twilio ↔ ElevenLabs bridge
└────────┬────────┘  - Call initiation
         │           - TwiML generation
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Twilio │ │  ElevenLabs  │
│ (Phone)│ │ (AI Agent)   │
└────────┘ └──────────────┘
```

### Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Firebase Auth

**Backend Worker**:
- Cloudflare Workers
- TypeScript
- Twilio API
- ElevenLabs Conversational AI API

**Infrastructure**:
- Cloudflare Pages (Frontend hosting)
- Cloudflare Workers (Serverless functions)
- Firebase (Authentication)
- PostgreSQL (Optional - for backend API)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Cloudflare account
- ElevenLabs account
- Twilio account
- Firebase project

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/launchpixel-ai-agent.git
cd launchpixel-ai-agent
```

### 2. Run Setup Script
```bash
./deploy.sh
# Select option 4: Local Development Setup
```

### 3. Configure Environment Variables

**Backend Worker** (`backend-worker/.dev.vars`):
```bash
ELEVENLABS_API_KEY=sk_your_key
TWILIO_ACCOUNT_SID=ACyour_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
ELEVENLABS_AGENT_ID=agent_your_id
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
ELEVENLABS_API_KEY=your_key
```

### 4. Start Development Servers

**Terminal 1** (Backend Worker):
```bash
cd backend-worker
wrangler dev
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Open Dashboard
Navigate to http://localhost:3000/call/dashboard

---

## 📦 Deployment

### Quick Deploy (Recommended)
```bash
./deploy.sh
# Select option 3: Both (Worker + Frontend)
```

### Manual Deployment

#### Deploy Backend Worker
```bash
cd backend-worker

# Set production secrets
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER
wrangler secret put ELEVENLABS_AGENT_ID

# Deploy
wrangler deploy
```

#### Deploy Frontend
```bash
cd frontend

# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=launchpixel-ai-agent
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 🎮 Usage

### Creating an Agent

1. **Sign in** to the dashboard at `/call/dashboard`
2. **Choose agent type**: Outbound Hunter or Inbound Closer
3. **Train the agent**:
   - Enter your website URL to scrape content
   - Upload documents (PDFs, DOCX)
4. **Configure voice & persona**:
   - Select voice (Rachel, Drew, Clyde, etc.)
   - Write system prompt
5. **Save configuration**

### Making Outbound Calls

1. Go to **Contacts & Lists** tab
2. Import contacts via CSV or add manually
3. Click **Initiate Batch Call** to start campaign
4. Monitor progress in **Analytics & Logs**

### Receiving Inbound Calls

1. Configure Twilio webhook to point to your worker
2. Calls to your Twilio number will be handled by the AI agent
3. View call logs in the dashboard

### Monitoring Performance

1. Go to **Analytics & Logs** tab
2. View metrics:
   - Total calls
   - Average duration
   - Conversion rate
   - Meeting bookings
3. Export reports for deeper analysis

---

## 🔧 Configuration

### Agent System Prompt Template

```
You are a professional [outbound/inbound] agent for [Company Name].

Your task is to:
1. Greet the customer warmly
2. [Outbound: Pitch value proposition | Inbound: Understand their needs]
3. Answer questions using your knowledge base
4. Handle objections professionally
5. [Outbound: Book meetings | Inbound: Resolve issues or route to team]
6. Always send a summary using notify_team tool

Important rules:
- Do not hallucinate information
- Keep responses concise (2-3 sentences)
- Be polite and professional
- Listen actively and respond contextually
```

### Voice Options

| Voice ID | Description | Best For |
|----------|-------------|----------|
| rachel | Professional, Female | Sales, Support |
| drew | News/Serious, Male | B2B, Enterprise |
| clyde | Warm/Friendly, Male | Customer Service |
| mimie | Childish/Anime, Female | Entertainment |

### Webhook Configuration

**Twilio Voice Webhook**:
- URL: `https://your-worker.workers.dev/twiml`
- Method: POST

**Status Callback**:
- URL: `https://your-worker.workers.dev/webhook`
- Method: POST

---

## 📊 Performance Optimization

### Frontend Optimizations
- ✅ Static export for fast loading
- ✅ Image optimization (WebP, AVIF)
- ✅ Code splitting
- ✅ SWC minification
- ✅ Brotli compression

### Backend Optimizations
- ✅ Edge deployment (low latency)
- ✅ Environment variable validation
- ✅ Error handling & retries
- ✅ CORS configuration
- ✅ Request validation

### Monitoring
- Cloudflare Analytics
- ElevenLabs conversation metrics
- Twilio call logs
- Custom dashboard analytics

---

## 🔒 Security

- ✅ All API keys stored as secrets
- ✅ CORS properly configured
- ✅ Firebase authentication
- ✅ Phone number validation
- ✅ Rate limiting (Cloudflare)
- ✅ HTTPS enforced
- ✅ Input sanitization
- ✅ Webhook signature verification

---

## 🧪 Testing

### Unit Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
cd backend-worker
npm test
```

### End-to-End Testing
1. Use test phone number
2. Initiate call from dashboard
3. Verify conversation flow
4. Check webhook delivery
5. Confirm WhatsApp notification

---

## 📈 Roadmap

### Phase 1: Core Features (✅ Complete)
- [x] Outbound calling
- [x] Inbound handling
- [x] Knowledge base training
- [x] Basic analytics

### Phase 2: Enhanced Features (🚧 In Progress)
- [ ] GSAP animations for dashboard
- [ ] Advanced analytics dashboard
- [ ] A/B testing for prompts
- [ ] Call recording & playback
- [ ] Multi-language support

### Phase 3: Integrations (📋 Planned)
- [ ] Salesforce integration
- [ ] HubSpot integration
- [ ] Zapier webhooks
- [ ] Slack notifications
- [ ] Calendar integrations (Google, Outlook)

### Phase 4: Advanced AI (🔮 Future)
- [ ] Sentiment analysis
- [ ] Voice cloning
- [ ] Real-time coaching
- [ ] Predictive analytics
- [ ] Auto-optimization

---

## 💰 Pricing

### Development (Free Tier)
- Cloudflare: Free (100k requests/day)
- ElevenLabs: $5/month (Starter)
- Twilio: Pay-as-you-go (~$0.014/min)

### Production (Recommended)
- Cloudflare: Free or $5/month (Pro)
- ElevenLabs: $22/month (Creator)
- Twilio: ~$50/month (500 minutes)
- **Total**: ~$75/month

### Enterprise
- Custom pricing
- Dedicated support
- SLA guarantees
- White-label options

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## 📝 License

Proprietary - Launch Pixel © 2026

All rights reserved. This software is proprietary and confidential.

---

## 🆘 Support

### Documentation
- [Deployment Guide](./DEPLOYMENT.md)
- [API Reference](./docs/API.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

### Contact
- **Email**: support@launchpixel.in
- **Discord**: https://discord.gg/launchpixel
- **Twitter**: @launchpixel

### Resources
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers)

---

## 🙏 Acknowledgments

Built with:
- [ElevenLabs](https://elevenlabs.io) - Conversational AI
- [Twilio](https://twilio.com) - Communications API
- [Cloudflare](https://cloudflare.com) - Edge infrastructure
- [Next.js](https://nextjs.org) - React framework
- [Firebase](https://firebase.google.com) - Authentication

---

## 📸 Screenshots

### Dashboard
![Dashboard](./docs/images/dashboard.png)

### Agent Configuration
![Configuration](./docs/images/configuration.png)

### Analytics
![Analytics](./docs/images/analytics.png)

---

<div align="center">

**Made with ❤️ by Launch Pixel**

[Website](https://launchpixel.in) • [Twitter](https://twitter.com/launchpixel) • [LinkedIn](https://linkedin.com/company/launchpixel)

</div>
