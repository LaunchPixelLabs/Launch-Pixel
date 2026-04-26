# Launch Pixel AI Agent — Deployment Checklist

Complete this checklist in order to deploy the full system.

## Prerequisites

- [ ] Node.js v18+ installed
- [ ] `wrangler` CLI installed (`npm i -g wrangler`)
- [ ] Cloudflare account with Workers plan
- [ ] Render.com account
- [ ] Twilio account with phone number
- [ ] ElevenLabs account with Conversational AI access
- [ ] Firebase project with Authentication enabled

---

## Step 1: Set Up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Web App** and copy the config values
4. Generate a **Service Account** JSON key (Settings → Service Accounts → Generate New)

---

## Step 2: Deploy Backend Worker (Cloudflare)

```bash
cd backend-worker
npm install

# Set secrets (you'll be prompted for values)
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER
wrangler secret put ELEVENLABS_AGENT_ID

# Optional: WhatsApp notifications
wrangler secret put TWILIO_WHATSAPP_NUMBER    # Format: whatsapp:+14155238886
wrangler secret put BUSINESS_WHATSAPP_NUMBER  # Format: whatsapp:+919876543210

# Deploy
wrangler deploy
```

**Copy the Worker URL** from the output (e.g., `https://lp-calling-agent.your-sub.workers.dev`).

---

## Step 3: Configure Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com) → Phone Numbers → Your Number
2. Under **Voice & Fax → A CALL COMES IN**:
   - Set to **Webhook** → `https://YOUR_WORKER_URL/twiml` → HTTP POST
3. Under **Status Callback URL**:
   - Set to `https://YOUR_WORKER_URL/webhook`

---

## Step 4: Deploy Backend API (Render)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → New → Web Service
3. Connect your GitHub repo, set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add environment variables in Render dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DB_HOST` | Your MySQL host |
| `DB_PORT` | `3306` |
| `DB_NAME` | Your database name |
| `DB_USER` | Your database user |
| `DB_PASSWORD` | Your database password |
| `SESSION_SECRET` | Random 64-char string |
| `CLIENT_URL` | Your frontend URL |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `ELEVENLABS_API_KEY` | Your ElevenLabs key |

**Copy the Render URL** (e.g., `https://launchpixel-backend.onrender.com`).

---

## Step 5: Deploy Frontend (Cloudflare Pages)

```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy out --project-name=launchpixel-ai-agent
```

Or connect via GitHub in Cloudflare Pages dashboard:
- **Build command**: `npm run build`
- **Build output**: `out` or `.next`
- **Root directory**: `frontend`

Add environment variables in Cloudflare Pages dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase config |
| `NEXT_PUBLIC_API_URL` | Your Render backend URL |
| `NEXT_PUBLIC_WORKER_URL` | Your Cloudflare Worker URL |
| `ELEVENLABS_API_KEY` | Your ElevenLabs key |

---

## Step 6: Verify

1. **Health check**: `curl https://YOUR_WORKER_URL/health`
2. **Auth**: Log in at `https://YOUR_FRONTEND/call/auth`
3. **Dashboard**: Navigate to `/call/dashboard` — all tabs should load
4. **Test call**: Use Quick Dial to call your own number
5. **WhatsApp**: Verify notification arrives after a qualifying call

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Worker 500 error | Check `wrangler tail` logs, verify all secrets are set |
| Auth failures | Verify Firebase config matches between frontend and backend |
| Calls not connecting | Verify Twilio phone number and webhook URL |
| No WhatsApp | Check TWILIO_WHATSAPP_NUMBER format (must start with `whatsapp:`) |
| Backend 502 | Check Render logs, verify DB connection |
