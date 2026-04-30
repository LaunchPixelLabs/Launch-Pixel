# 🚀 Launch Pixel — The Complete Intelligence

> **If we can dream it, we can achieve it.**
> An autonomous AI agent platform that transforms how businesses operate — voice, chat, WhatsApp — all channels, one brain.

---

## 📊 Platform at a Glance

| Dimension | Value |
|-----------|-------|
| **Codebase** | 211 files · 745 code entities · 5,879 relationships |
| **Languages** | TypeScript · TSX · JavaScript · Bash |
| **Architecture** | 23 code communities · 20 execution flows · 7 classes |
| **Functions** | 427 functions · 100 tests · 542 test-coverage edges |
| **Critical Flows** | `reconnectAgent` (0.79) · `bootstrap` (0.78) · `DashboardPage` (0.69) |
| **Bridge Node** | `runSketchAgent` — the single most critical architectural chokepoint |

---

## 🧬 What Is Launch Pixel?

Launch Pixel is an **autonomous AI calling and business operations platform**. Think of it as **Jarvis for sales teams** — an always-on AI that can:

- 📞 **Make and receive phone calls** using human-like AI voices
- 💬 **Chat on WhatsApp** with persistent memory and context
- 🌐 **Engage via web chat** with real-time SSE streaming
- 🧠 **Learn from your business** through RAG-powered knowledge bases
- 🔄 **Execute complex workflows** via a visual no-code canvas builder
- 📊 **Track everything** — call analytics, lead scoring, conversion funnels

### Core Value Proposition

```
┌─────────────────────────────────────────────────────────┐
│                LAUNCH PIXEL = SALES MONSTER             │
│                                                         │
│   Your AI Agent That Never Sleeps, Never Forgets,       │
│   And Always Closes.                                    │
│                                                         │
│   Voice ← → Chat ← → WhatsApp ← → Workflows           │
│         All Powered By One Unified Brain                │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Overview

### System Topology

```
                    ┌──────────────────────────────────────────┐
                    │           CUSTOMER TOUCHPOINTS            │
                    │  📞 Voice  ·  💬 WhatsApp  ·  🌐 Web    │
                    └──────────────┬───────────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────────┐
                    │         FRONTEND LAYER (Next.js 14)       │
                    │                                           │
                    │  UnifiedLandingPage ──→ DashboardPage     │
                    │       │                     │             │
                    │  Navigation              Sidebar          │
                    │  Footer                  AdvancedAgentUI  │
                    │  FloatingButtons         AgentListView    │
                    │  PersistentBackground    SteeringCanvas   │
                    │  GlobalLoader            KnowledgeBaseUI  │
                    │  ClickSpark              TestAgentUI      │
                    │                          WhatsAppConfigUI │
                    │                          VoiceLibraryUI   │
                    │                          WorkflowBuilder  │
                    └──────────────┬───────────────────────────┘
                                   │ Firebase Auth + API Routes
                    ┌──────────────▼───────────────────────────┐
                    │      BACKEND WORKER (Hono + Render.com)   │
                    │                                           │
                    │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │
                    │  │  Agent  │  │  API      │  │ Billing │ │
                    │  │ System  │  │  Routes   │  │ System  │ │
                    │  └────┬────┘  └────┬─────┘  └────┬────┘ │
                    │       │            │              │       │
                    │  sketch-runner  server.ts    stripe.ts    │
                    │  sketch-tools   routes/*     usage.ts     │
                    │  ws-relay       api/*        enforce.ts   │
                    │  queue          external.ts               │
                    │  memory                                   │
                    │  worker                                   │
                    └──────────────┬───────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
    ┌─────────▼──────┐  ┌─────────▼──────┐  ┌─────────▼──────┐
    │   INTEGRATIONS  │  │   DATA LAYER   │  │   AI ENGINE    │
    │                 │  │                │  │                │
    │  Twilio API     │  │  Neon Postgres │  │  NVIDIA NIM    │
    │  ElevenLabs AI  │  │  Drizzle ORM   │  │  Llama 3.1     │
    │  WhatsApp       │  │  pgvector      │  │  405B Instruct │
    │  (Baileys)      │  │  Migrations    │  │                │
    │  Stripe         │  │                │  │  Streaming SSE │
    │  Google Cal     │  │  Knowledge     │  │  Tool Calling  │
    │  Google Sheets  │  │  Chunks + RAG  │  │  Context Mgmt  │
    └─────────────────┘  └────────────────┘  └────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR, routing, API routes |
| **UI Framework** | Tailwind CSS + Framer Motion + GSAP | Premium animations & styling |
| **Auth** | Firebase Authentication | Google OAuth + anonymous auth |
| **Backend** | Hono on Render.com | Lightweight, high-performance HTTP |
| **Database** | Neon PostgreSQL + Drizzle ORM | Serverless, schema-driven |
| **AI Engine** | NVIDIA NIM 405B (Llama 3.1) | Tool-calling, streaming inference |
| **Voice** | Twilio + ElevenLabs Conversational AI | HD voice synthesis + telephony |
| **Messaging** | Baileys (WhatsApp Web) | Direct WhatsApp integration |
| **Payments** | Stripe | Subscriptions + usage billing |
| **Vector Search** | pgvector | Semantic search for RAG |
| **Hosting** | Cloudflare Pages + Render.com | Edge delivery + Node.js runtime |

---

## 🔬 Execution Flows (Graph-Verified)

These are the actual execution paths through the codebase, ordered by criticality score:

### Critical Path: Agent Lifecycle

```
reconnectAgent (0.79) ──→ bootstrap (0.78)
    │
    ├── runSketchAgent         ← BRIDGE NODE (architectural chokepoint)
    │      ├── sketch-tools    ← Tool definitions
    │      ├── ws-relay        ← WebSocket voice relay
    │      ├── memory          ← Contact context & persistence
    │      └── queue           ← Channel message queuing
    │
    ├── handleVoiceRelay       ← Twilio ↔ ElevenLabs bridge
    │      ├── finalizeCall    ← Post-call processing
    │      └── analyzeCallAndScoreLead ← AI-powered lead scoring
    │
    └── handleInboundWhatsApp (0.62) ← WhatsApp message handler
           ├── runSketchAgent
           └── extractAndSaveMemories
```

### Critical Path: User Interface

```
Home (0.69) ──→ UnifiedLandingPage
    │                 ├── Navigation
    │                 ├── SplitTextReveal
    │                 ├── MagneticButton
    │                 ├── ChromaGrid
    │                 ├── TestimonialsCarousel
    │                 └── Footer

DashboardPage (0.69) ──→ useDashboard hook
    │
    ├── Sidebar              ├── AgentListView
    ├── PremiumBackground    ├── AdvancedAgentUI
    ├── LiveOperationsTicker ├── SteeringCanvas
    ├── GrowthPanel          ├── KnowledgeBaseUI
    ├── PerformanceGraph     ├── TestAgentUI
    ├── OutboundTab          ├── WhatsAppConfigUI
    ├── ConversationsTab     ├── VoiceLibraryUI
    └── BillingTab           └── WorkflowBuilderUI
```

---

## 🧩 Code Communities (23 Detected)

The codebase organizes into **23 structural communities** detected via graph analysis:

| # | Community | Size | Language | Description |
|---|-----------|------|----------|-------------|
| 1 | **tests-test:handles** | 98 | TypeScript | API route handlers + comprehensive test suites |
| 2 | **components-handle** | 92 | TSX | Landing page, animations, visual components |
| 3 | **dashboard-ui** | 83 | TSX | Full dashboard: agents, workflows, billing, testing |
| 4 | **agent-handle** | 46 | TypeScript | Core agent system: runner, tools, memory, queue |
| 5 | **ui-use** | 46 | TSX | shadcn/ui component library |
| 6 | **lib-it:should** | 33 | TypeScript | Utilities: CSV parser, blog helpers, `cn()` |
| 7 | **hooks-handle** | 26 | TypeScript | React hooks: `useDashboard`, `useToast`, auth |
| 8 | **src-thread** | 14 | TypeScript | Server bootstrap and shutdown |
| 9 | **api-whats** | 10 | TypeScript | WhatsApp + Twilio + deployment APIs |
| 10 | **billing-check** | 6 | TypeScript | Stripe, usage tracking, enforcement |

### Architectural Warning

> ⚠️ **High coupling detected**: 13 cross-community edges between `whatsapp-page` ↔ `dashboard-ui`. The Dashboard page directly references 13 dashboard components, creating a tightly coupled facade. Consider extracting a `DashboardOrchestrator` to decouple routing from component selection.

---

## 🎯 Core Modules Deep-Dive

### 1. Agent Execution Engine (`/backend-worker/src/agent/`)

The brain of the platform. **46 code entities** in this community.

| File | Purpose | Key Functions |
|------|---------|---------------|
| `sketch-runner.ts` | Core AI execution engine | `runSketchAgent` — **THE bridge node** |
| `sketch-tools.ts` | Tool definitions for agent capabilities | Calendar, webhooks, search tools |
| `ws-relay.ts` | WebSocket relay: Twilio ↔ ElevenLabs | `handleVoiceRelay`, `finalizeCall` |
| `queue.ts` | Per-channel message queuing | `ChannelQueue`, `QueueManager` |
| `memory.ts` | Contact context & long-term memory | `getContactContext`, `saveMemory` |
| `worker.ts` | Background task processor | `TaskWorker` (outbound calls, WhatsApp, analysis) |
| `analysis.ts` | Post-call AI analysis | `analyzeCallAndScoreLead` |
| `mcp-bridge.ts` | Model Context Protocol bridge | `MCPBridge` for extensible tool calling |
| `whatsapp-auth.ts` | Baileys auth state persistence | `useDatabaseAuthState` |

#### `runSketchAgent` — The Chokepoint

This single function is the **most architecturally critical node** in the entire codebase (highest betweenness centrality among non-test nodes). Every voice call, every WhatsApp message, and every web chat request flows through it. It:

- Receives the user message + conversation history
- Injects knowledge base context via RAG
- Calls NVIDIA NIM 405B with tool definitions
- Streams responses token-by-token via SSE
- Handles tool calls recursively (max 5 iterations with circuit breaker)
- Tracks token usage for billing

### 2. Frontend Dashboard (`/frontend/components/dashboard/`)

**83 code entities** — the primary user interface.

| Component | Lines | Purpose |
|-----------|-------|---------|
| `AdvancedAgentUI` | Agent configuration wizard |
| `AgentListView` | Agent gallery with presets (Outbound Hunter, Inbound Closer) |
| `SteeringCanvas` | Visual no-code workflow builder |
| `KnowledgeBaseUI` | Document upload, web scraping, RAG management |
| `TestAgentUI` | Live agent testing (voice, chat, WhatsApp) |
| `WhatsAppConfigUI` | WhatsApp QR pairing & connection management |
| `VoiceLibraryUI` | ElevenLabs voice selection & preview |
| `WorkflowBuilderUI` | React Flow-based workflow designer |
| `Sidebar` | Navigation with FloatingOrb animation |
| `LiveOperationsTicker` | Real-time event feed |
| `GrowthPanel` | Animated metric counters |
| `PerformanceGraph` | Recharts-based performance visualization |
| `MissionControlHUD` | System health dashboard |
| `PremiumBackground` | Canvas particle field animation |

### 3. API Layer (`/frontend/app/api/` + `/backend-worker/src/api/`)

**98 entities** in the API community (largest community).

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/call/agent` | POST | Create/update agent configuration on ElevenLabs |
| `/api/call/contacts` | GET/POST | Contact CRUD with E.164 phone validation |
| `/api/call/initiate` | POST | Trigger outbound call via Twilio |
| `/api/call/scrape` | POST | Web scraping → knowledge base ingestion |
| `/api/call/train` | POST | Document upload (PDF/DOCX/TXT) → RAG |
| `/api/call/webhook` | POST | Twilio call status webhooks |
| `backend/api/whatsapp` | * | WhatsApp connect, QR, status, messaging |
| `backend/api/deploy` | POST | Agent deployment to ElevenLabs |
| `backend/api/outbound` | POST | Campaign execution engine |
| `backend/api/twilio` | POST | Phone number provisioning |

### 4. Design System (`/frontend/components/`)

**92 entities** — premium, motion-rich UI components.

| Component | Animation Tech | Effect |
|-----------|---------------|--------|
| `Antigravity` | Custom physics | Zero-gravity particle simulation |
| `ChromaGrid` | Mouse tracking | Interactive color-shifting card grid |
| `ClickSpark` | Canvas API | Click-triggered particle explosions |
| `DecryptedText` | Interval-based | Matrix-style text decryption reveal |
| `GlitchText` | CSS keyframes | Cyberpunk glitch text effect |
| `MagneticButton` | Mouse proximity | Buttons that follow cursor magnetically |
| `ParallaxSection` | Scroll-based | Depth-layered scroll parallax |
| `SplitTextReveal` | GSAP ScrollTrigger | Word-by-word scroll-triggered reveal |
| `SpotlightCard` | Mouse tracking | Spotlight effect following cursor |
| `TiltedCard` | 3D transform | Perspective-tilting card on hover |
| `CardSwap` | GSAP timeline | Stacked card carousel animation |
| `LogoLoop` | requestAnimationFrame | Infinite scrolling logo marquee |
| `TestimonialsCarousel` | Auto-advance | Animated testimonial rotator |
| `NoiseOverlay` | CSS filter | Film grain texture overlay |
| `PersistentBackground` | Three.js-ready | Ambient background animation |

### 5. State Management (`/frontend/hooks/`)

**26 entities** — centralized state via custom hooks.

| Hook | Purpose |
|------|---------|
| `useDashboard` | **Master hook** — agent CRUD, CSV upload, calling, billing, export |
| `useAnonymousAuth` | Firebase anonymous authentication |
| `useToast` | Notification toast system (reducer pattern) |
| `useIsMobile` | Responsive breakpoint detection |

### 6. Database Schema (`/backend-worker/src/db/`)

Built with **Drizzle ORM** on **Neon PostgreSQL**:

| Table | Purpose |
|-------|---------|
| `users` | Firebase UID, email, workspace membership |
| `workspaces` | Team collaboration spaces |
| `agentConfigurations` | Agent settings, system prompts, voice config |
| `agentContacts` | Customer contacts with E.164 phone numbers |
| `callLogs` | Call transcripts, duration, sentiment, lead scores |
| `knowledgeSources` | Document metadata (URLs, files) |
| `knowledgeChunks` | pgvector embeddings for semantic search |
| `scheduledTasks` | Meeting scheduling and reminders |
| `billing` | Stripe customer IDs, subscription status |
| `whatsapp_auth_keys` | Baileys session persistence |

---

## 🧪 Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| **Scrape Endpoint** | 15 tests | URL validation, HTML processing, section detection, edge cases |
| **Train Endpoint** | 25 tests | File validation, text extraction, API integration, error messages |
| **CSV Parser** | 12 tests | Phone validation, E.164 formatting, duplicate detection |
| **Total** | **100 test nodes** | 542 test-coverage edges across the graph |

---

## 💰 Business Model

### Pricing Architecture

| Tier | Price | Agents | Minutes | Key Features |
|------|-------|--------|---------|--------------|
| **Starter** | $29/mo | 1 | 500 | Basic analytics, email support, standard voices |
| **Growth** | $99/mo | 5 | 2,500 | Advanced analytics, WhatsApp, custom workflows, premium voices |
| **Enterprise** | Custom | Unlimited | Unlimited | White-label, SSO, SLA, on-premise, dedicated support |

### Revenue Streams

1. **MRR** — Monthly subscription fees
2. **Usage** — Per-minute charges beyond tier limits
3. **Premium** — Advanced tools, custom integrations
4. **Enterprise** — Custom development, white-label licensing

---

## 🔧 Development Infrastructure

### Dual-Agent Development System

Launch Pixel is developed using a **dual-agent architecture** for maximum velocity:

| Agent | Model | Role |
|-------|-------|------|
| **Antigravity** (this agent) | Claude Opus 4.6 | Architecture, planning, code review, research, graph analysis |
| **Claude CLI** (terminal) | GLM-4.7 via NVIDIA NIM | Fast file edits, shell commands, git operations |

### NVIDIA NIM Proxy Configuration

```
Proxy: localhost:8082 (free-claude-code)
├── Opus tier  → deepseek-ai/deepseek-v3.2  (heavy reasoning)
├── Sonnet tier → z-ai/glm4.7               (fast coding)
└── Haiku tier  → z-ai/glm4.7               (instant tasks)
```

### Code Knowledge Graph

The codebase is instrumented with a **persistent knowledge graph** (code-review-graph) for structural analysis:

- **745 nodes** (427 functions, 100 tests, 211 files, 7 classes)
- **5,879 edges** (3,879 calls, 738 imports, 547 contains, 542 tested-by, 173 references)
- **23 communities** detected via Leiden algorithm
- **20 execution flows** traced from entry points
- **Auto-incremental updates** on every code change

### Local Development

```bash
# Prerequisites: Node.js 18+, PostgreSQL (Neon), Firebase project

# Clone & install
git clone https://github.com/launchpixel/launch-pixel-ai-agent
cd Launch-Pixel

# Environment setup
./setup-env.sh                              # Configure all .env files

# Start backend
cd backend-worker && npm run dev            # Hono server on Render

# Start frontend
cd frontend && npm run dev                  # Next.js on localhost:3000

# Access dashboard
open http://localhost:3000/call/dashboard

# Launch NVIDIA-powered Claude agent
nvidia-claude                               # Shell alias
```

### Code Standards

| Standard | Tool |
|----------|------|
| TypeScript strict mode | Built-in |
| 2-space indentation, 120 char width | Biome |
| Runtime validation | Zod schemas |
| Database queries | Drizzle ORM |
| Commits | Conventional (`feat:`, `fix:`, `chore:`) |
| Code graph | code-review-graph MCP |

---

## 🚧 Known Issues & Technical Debt

### Critical Issues

| # | Issue | Impact | Mitigation |
|---|-------|--------|------------|
| 1 | **runSketchAgent is a chokepoint** | Single point of failure for all AI operations | Extract into microservice with failover |
| 2 | **DashboardPage coupling** | 13 direct component imports = fragile facade | Extract DashboardOrchestrator pattern |
| 3 | **Agent persistence** | Agents terminate when user disconnects | Cloudflare Durable Objects |
| 4 | **No embeddings** | 0/745 nodes have vector embeddings | Run `embed_graph_tool` |
| 5 | **WhatsApp session fragility** | Baileys auth can drop on cold restarts | Implement session heartbeat |

### Technical Debt

| Area | Debt | Priority |
|------|------|----------|
| Large components | Dashboard page needs decomposition | High |
| TypeScript `any` | Strict typing needed throughout | Medium |
| Console logs | Replace with structured logging | Medium |
| Error handling | Inconsistent patterns | High |
| State management | Consider Zustand migration | Low |
| Mobile responsive | Dashboard gaps on small screens | Medium |

---

## 🔮 Roadmap

### Phase 1: Hardening (Week 1-2)
- [ ] Extract `runSketchAgent` into isolated service with circuit breakers
- [ ] Implement Cloudflare Durable Objects for agent persistence
- [ ] Add structured logging (Pino) replacing console.log
- [ ] Fix Dashboard coupling — extract orchestrator pattern
- [ ] Set up Sentry error tracking

### Phase 2: Intelligence (Week 3-4)
- [ ] Advanced RAG with hybrid search (keyword + semantic)
- [ ] Agent memory persistence across sessions
- [ ] Voice cloning with ElevenLabs API
- [ ] Real-time collaboration (multi-user dashboard)
- [ ] Enhanced Canvas workflow execution engine

### Phase 3: Scale (Week 5-6)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Comprehensive test coverage (>80%)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Rate limiting and DDoS protection
- [ ] Multi-region deployment

### Phase 4: Enterprise (Week 7-8)
- [ ] SSO integration (SAML/OIDC)
- [ ] Audit logging
- [ ] White-label theming engine
- [ ] Mobile application (React Native)
- [ ] Developer API platform with documentation

---

## 📈 Key Metrics & Targets

| Category | Metric | Target |
|----------|--------|--------|
| **Uptime** | SLA | 99.9% |
| **API Latency** | p95 response time | <200ms |
| **Page Load** | Largest Contentful Paint | <2s |
| **Error Rate** | 5xx responses | <0.1% |
| **Test Coverage** | Line coverage | >80% |
| **Lighthouse** | Performance score | >90 |
| **Agent Success** | Call completion rate | >95% |
| **Conversion** | Lead → appointment rate | >20% improvement |
| **Cost per Call** | Infrastructure + AI | <$0.50 |
| **Customer ROI** | Revenue generated / cost | >300% |

---

## 🏆 Competitive Advantages

1. **Sketch-Powered Intelligence** — Advanced tool-calling agent runtime with MCP bridge
2. **Triple-Channel AI** — Voice + WhatsApp + Web in one unified platform
3. **Visual Workflow Builder** — No-code agent behavior design
4. **Real-Time Voice** — Twilio + ElevenLabs Conversational AI = human-quality calls
5. **Enterprise RAG** — pgvector semantic search across all knowledge sources
6. **Premium Design** — GSAP + Framer Motion + Canvas animations (not your average SaaS)
7. **Dual-Agent Development** — Antigravity (architecture) + Claude CLI (execution) = 2x velocity
8. **Graph-Instrumented Codebase** — Structural analysis, impact tracking, automated review

---

## 📞 Contact & Resources

| | |
|---|---|
| **Team** | LaunchPixel Engineering |
| **Email** | contact@launchpixel.in |
| **WhatsApp** | +91-7004635011 |
| **GitHub** | github.com/launchpixel/launch-pixel-ai-agent |

**Documentation Links**:
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs)
- [Twilio Voice API](https://www.twilio.com/docs)
- [NVIDIA NIM API](https://build.nvidia.com/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)
- [Drizzle ORM](https://orm.drizzle.team/)

---

## 📝 Document Version

| Field | Value |
|-------|-------|
| **Version** | 2.0 |
| **Last Updated** | April 30, 2026 |
| **Generated By** | Antigravity (Claude Opus 4.6) + Code Review Graph |
| **Data Source** | 745 nodes, 5,879 edges, 23 communities, 20 flows |
| **Next Review** | May 7, 2026 |

---

*This document is machine-generated from live codebase analysis. Every metric, every flow, every community is derived from the actual code graph — not assumptions. If we can dream it, we can build it. And we're building it.* 🔥