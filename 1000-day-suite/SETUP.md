# 🌸 1000-Day Maternal & Child Care Suite
## Complete Folder Structure & Run Commands

---

## 📁 FULL FOLDER STRUCTURE

```
1000-day-suite/
│
├── 📁 backend/                          # Node.js + Express API
│   ├── 📄 server.js                     # Entry point — Express app, middleware, routes
│   ├── 📄 package.json                  # Dependencies
│   ├── 📄 .env.example                  # Environment variable template
│   ├── 📄 .env                          # ← You create this (copy from .env.example)
│   │
│   ├── 📁 middleware/
│   │   └── 📄 auth.js                   # JWT requireAuth + requireRole middleware
│   │
│   ├── 📁 routes/
│   │   ├── 📄 auth.js                   # /api/auth — register, login, refresh, logout, link-partner
│   │   ├── 📄 ai.js                     # /api/ai  — Gemini chat, risk-assess, history
│   │   ├── 📄 health.js                 # /api/health — vitals, appointments, medications
│   │   ├── 📄 feed.js                   # /api/feed — health news feed
│   │   └── 📄 alerts.js                 # /api/alerts — partner alerts, emergency SOS
│   │
│   ├── 📁 supabase/
│   │   ├── 📄 client.js                 # Supabase service-role client + helpers
│   │   └── 📄 schema.sql                # ← Run this in Supabase SQL editor FIRST
│   │
│   └── 📁 utils/
│       └── 📄 jwt.js                    # sign/verify access+refresh tokens, rotation
│
│
└── 📁 frontend/                         # React + Vite app
    ├── 📄 index.html                    # HTML entry point
    ├── 📄 vite.config.js                # Vite config + proxy to backend
    ├── 📄 package.json                  # Dependencies
    ├── 📄 .env.example                  # Environment variable template
    ├── 📄 .env.local                    # ← You create this (copy from .env.example)
    │
    └── 📁 src/
        ├── 📄 main.jsx                  # React root mount
        ├── 📄 App.jsx                   # Root component — layout, routing, overlays
        ├── 📄 index.css                 # All styles (ported from original style.css)
        │
        ├── 📁 context/
        │   └── 📄 AppContext.jsx        # Global state — language, voice, toast, a11y modes
        │
        ├── 📁 hooks/
        │   ├── 📄 useAuth.js            # Auth state, login/register/logout, token refresh
        │   ├── 📄 useVoice.js           # Web Speech API — listen, speak, 8 Indian languages
        │   └── 📄 useVitals.js          # Vitals fetch + Supabase realtime subscription
        │
        ├── 📁 lib/
        │   ├── 📄 api.js                # fetch() wrapper with auto Bearer token injection
        │   └── 📄 supabase.js           # Supabase anon client + 4 realtime subscriptions
        │
        └── 📁 components/
            ├── 📄 Navigation.jsx        # Fixed top nav — links, language selector, auth
            ├── 📄 Hero.jsx              # Full-screen hero section
            ├── 📄 Workflow.jsx          # System architecture diagram (7 nodes)
            ├── 📄 HealthFeed.jsx        # Real-time news feed from Supabase
            ├── 📄 PartnerSection.jsx    # Partner cards + live alert subscription
            ├── 📄 EmergencySection.jsx  # SOS flow diagram + voice trigger + GPS
            ├── 📄 QRSection.jsx         # 4 QR codes via qrcode.react
            ├── 📄 VoiceAssistant.jsx    # Full-screen voice overlay — orb, wave, commands
            ├── 📄 AuthModal.jsx         # Sign in / Sign up modal
            ├── 📄 AccessibilityPanel.jsx # Fixed a11y panel — size, contrast, icon mode
            ├── 📄 Toast.jsx             # Notification toast
            ├── 📄 IconModeBar.jsx       # Bottom icon bar for low-literacy users
            │
            └── 📁 Dashboard/
                ├── 📄 index.jsx         # Dashboard with 4 tabs + real-time vitals display
                ├── 📄 TrendsTab.jsx     # Chart.js — BP trend, Risk trajectory, Blood sugar
                ├── 📄 ChatTab.jsx       # Gemini AI chat + voice mic + quick commands
                └── 📄 VitalsLogger.jsx  # Form — log vitals → AI risk → save to Supabase
```

---

## ⚙️ STEP-BY-STEP SETUP

### STEP 1 — Supabase Setup

1. Go to https://supabase.com and create a new project
2. Open **SQL Editor** and run the entire contents of `backend/supabase/schema.sql`
3. Enable **Realtime** on these tables:
   - Dashboard → Database → Replication
   - Toggle ON: `vitals`, `partner_alerts`, `ai_conversations`, `health_feed`
4. Copy your keys from **Settings → API**:
   - `Project URL`
   - `service_role` key (for backend)
   - `anon` key (for frontend)

---

### STEP 2 — Get API Keys

**Gemini AI:**
```
https://aistudio.google.com/app/apikey
→ Create API Key → Copy it
```

**Generate JWT Secrets (run twice — one for access, one for refresh):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### STEP 3 — Backend Setup

```bash
# Navigate into backend folder
cd backend

# Copy env template
cp .env.example .env

# Edit .env and fill in your values:
# SUPABASE_URL=https://xxxx.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
# JWT_ACCESS_SECRET=<64-byte hex from above>
# JWT_REFRESH_SECRET=<64-byte hex from above>
# GEMINI_API_KEY=AIza...
# CORS_ORIGIN=http://localhost:5173

# Install dependencies
npm install

# Run in development (auto-restarts on file change)
npm run dev

# OR run in production
npm start
```

✅ Backend runs at: **http://localhost:4000**
✅ Health check: **http://localhost:4000/ping**

---

### STEP 4 — Frontend Setup

```bash
# Navigate into frontend folder
cd frontend

# Copy env template
cp .env.example .env.local

# Edit .env.local and fill in your values:
# VITE_API_URL=http://localhost:4000/api
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

✅ Frontend runs at: **http://localhost:5173**

---

## 🔑 ENVIRONMENT VARIABLES REFERENCE

### backend/.env

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase → Settings → API
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=a1b2c3d4e5f6...  (64 hex chars)
JWT_REFRESH_SECRET=f6e5d4c3b2a1...  (64 hex chars — DIFFERENT from access)

# Google AI Studio → https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...
```

### frontend/.env.local

```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📡 API ENDPOINTS REFERENCE

```
AUTH
  POST   /api/auth/register          Register (mother/partner/doctor)
  POST   /api/auth/login             Login → returns accessToken + refreshToken
  POST   /api/auth/refresh           Rotate refresh token → new token pair
  GET    /api/auth/me                Get current user profile
  POST   /api/auth/logout            Revoke refresh token
  POST   /api/auth/link-partner      Mother links partner by email
  PATCH  /api/auth/language          Update preferred language

AI (Gemini 1.5 Flash)
  POST   /api/ai/chat                Multilingual chat with conversation history
  POST   /api/ai/risk-assess         AI risk score + language-aware summary
  GET    /api/ai/sessions            List past chat sessions
  GET    /api/ai/history/:sessionId  Full chat history for a session

HEALTH
  POST   /api/health/vitals          Log vitals → auto partner alert if high risk
  GET    /api/health/vitals          Fetch vitals history (last 30)
  GET    /api/health/vitals/latest   Most recent vitals entry
  GET    /api/health/summary         Combined vitals + appointments + medications
  POST   /api/health/appointments    Book appointment
  GET    /api/health/appointments    List appointments (role-aware)
  GET    /api/health/medications     List medications
  PATCH  /api/health/medications/:id/taken  Mark medication as taken

FEED
  GET    /api/feed                   Latest health news feed (real-time via Supabase)

ALERTS
  GET    /api/alerts                 Partner's unread alerts
  PATCH  /api/alerts/:id/read        Mark alert as read
  POST   /api/alerts/emergency       Trigger SOS → GPS → partner alert
```

---

## 🔴 SUPABASE REALTIME CHANNELS

These update automatically in the browser without polling:

```
vitals:{userId}        → New vital recorded (Dashboard overview updates live)
alerts:{partnerId}     → New partner alert (plays voice + toast instantly)
chat:{sessionId}       → New AI message (chat panel updates)
health_feed            → New health article (feed adds card at top)
```

---

## 🗄️ DATABASE TABLES

```
users              → All accounts (mother / partner / doctor)
mother_profiles    → Pregnancy details, linked partner/doctor
vitals             → BP, sugar, weight, risk score — REALTIME
ai_conversations   → Full Gemini chat history by session — REALTIME
appointments       → Scheduled consultations
medications        → Daily medication schedule + taken status
health_feed        → WHO/ICMR/UNICEF news — REALTIME
partner_alerts     → Risk + emergency alerts to partner — REALTIME
emergency_events   → SOS trigger log with GPS coordinates
refresh_tokens     → Hashed JWT refresh tokens (rotated on use)
```

---

## 🧪 TEST THE APP

```bash
# 1. Register a mother account
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@test.com","password":"test1234","name":"Priya Sharma","role":"mother","language":"hi-IN"}'

# 2. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@test.com","password":"test1234"}'

# 3. Ask Gemini in Hindi (use token from login response)
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"message":"मेरा बीपी 128/84 है, क्या यह ठीक है?","language":"hi-IN"}'

# 4. Log vitals
curl -X POST http://localhost:4000/api/health/vitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"bp_systolic":128,"bp_diastolic":84,"blood_sugar":95,"weight_kg":62.4,"symptom_code":2,"mood":2,"risk_score":42,"risk_level":"medium"}'

# 5. Health check
curl http://localhost:4000/ping
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Backend (Railway / Render / Fly.io)
```bash
# Set all env vars in your platform dashboard
# Deploy command:
npm start
```

### Frontend (Vercel / Netlify)
```bash
# Build command:
npm run build

# Output directory:
dist

# Environment variables: add VITE_* vars in platform dashboard
# Change VITE_API_URL to your deployed backend URL
```

---

## 📦 DEPENDENCIES SUMMARY

### Backend
```
express            Web framework
@supabase/supabase-js   Database + realtime client
@google/generative-ai   Gemini AI
jsonwebtoken       JWT sign/verify
bcryptjs           Password hashing
cors helmet        Security
express-rate-limit Rate limiting
morgan             HTTP logging
dotenv uuid        Utilities
```

### Frontend
```
react react-dom    UI framework
vite               Build tool
@supabase/supabase-js   Realtime client
chart.js + react-chartjs-2   Trend graphs
qrcode.react       QR code generator
```
