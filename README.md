Perfect — since this is for your **IEEE Hackathon project**, here’s a polished **README.md** draft in the same structured style as the Create React App README, but tailored for your **Maternal Health App — Backend Setup**:


# Getting Started with Maternal Health App — Backend

This project was developed as part of an IEEE Hackathon.  
It provides a backend API for maternal health tracking, partner collaboration, and AI-powered quick advice.

## Stack
| Layer            | Tech                          |
|------------------|-------------------------------|
| API Server       | Express.js (ESM)              |
| Database         | Supabase (PostgreSQL)         |
| Auth             | JWT (access + refresh tokens) |
| AI               | Google Gemini 1.5 Flash       |
| Password hashing | bcryptjs                      |

---

## Project Structure

backend/
├── server.js                  ← Express entry point
├── package.json
├── .env.example               ← Copy to .env and fill in
├── middleware/
│   └── auth.js                ← requireAuth, requireRole
├── routes/
│   ├── auth.js                ← register, login, refresh, logout, switch-to-partner
│   ├── ai.js                  ← Gemini chat, quick-advice, session history
│   └── health.js              ← health logs, appointments
├── supabase/
│   ├── client.js              ← Supabase service-role client
│   └── schema.sql             ← Run this in Supabase SQL editor first
└── utils/
    └── jwt.js                 ← Token signing/verification/rotation

frontend/
└── hooks/
    └── useAuth.js             ← Drop into your src/hooks/ folder

## Quick Start

### 1. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)  
2. Go to **SQL Editor** and run the contents of `backend/supabase/schema.sql`  
3. Copy your **Project URL** and **service_role key** from Settings → API  

### 2. Get your API keys
- Supabase: Settings → API → `anon` and `service_role` keys  
- Gemini: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)  

### 3. Generate JWT secrets
bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run twice — once for ACCESS_SECRET, once for REFRESH_SECRET


### 4. Configure environment
bash
cd backend
cp .env.example .env
# Fill in all values in .env


### 5. Install and run
bash
cd backend
npm install
npm run dev        # development (auto-restarts on change)
# or
npm start          # production


### 6. Frontend hook
Copy `frontend/hooks/useAuth.js` to your `src/hooks/` folder.  

In your frontend `.env.local`:
bash
VITE_API_URL=http://localhost:4000/api


## API Reference

### Auth
| Method | Endpoint                  | Auth | Body                                   |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/api/auth/register`      | —    | `{ email, password, name, role }`      |
| POST   | `/api/auth/login`         | —    | `{ email, password }`                  |
| POST   | `/api/auth/refresh`       | —    | `{ refreshToken }`                     |
| GET    | `/api/auth/me`            | ✅   | —                                      |
| POST   | `/api/auth/logout`        | ✅   | `{ refreshToken }`                     |
| POST   | `/api/auth/logout-all`    | ✅   | —                                      |
| POST   | `/api/auth/switch-to-partner` | ✅ mother | `{ partnerEmail }`             |

### AI (Gemini)
| Method | Endpoint                  | Auth | Body                                   |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/api/ai/chat`            | ✅   | `{ message, sessionId? }`              |
| POST   | `/api/ai/quick-advice`    | ✅   | `{ question, context? }`               |
| GET    | `/api/ai/sessions`        | ✅   | —                                      |
| GET    | `/api/ai/history/:sessionId` | ✅ | —                                      |
| DELETE | `/api/ai/sessions/:sessionId` | ✅ | —                                      |

### Health
| Method | Endpoint                  | Auth | Body                                   |
|--------|---------------------------|------|----------------------------------------|
| POST   | `/api/health/log`         | ✅   | `{ mood, symptoms, weight_kg, bp_systolic, bp_diastolic, notes }` |
| GET    | `/api/health/logs`        | ✅   | —                                      |
| POST   | `/api/health/appointments`| ✅   | `{ doctor_id, scheduled_at, type, notes }` |
| GET    | `/api/health/appointments`| ✅   | —                                      |
| PATCH  | `/api/health/appointments/:id` | ✅ | `{ status, notes }`                   |



## Security Notes
- Access tokens expire in 15 minutes; `useAuth` silently refreshes at 14 min  
- Refresh tokens are hashed before DB storage — never stored raw  
- Each refresh rotates the refresh token (old one is revoked immediately)  
- Auth endpoints have a tighter rate limit (20 requests / 15 min)  
- Helmet + CORS + rate limiting applied globally  

---

## About
This backend was built for the IEEE Hackathon to support a maternal health app with secure authentication, AI-powered advice, and health tracking features.

