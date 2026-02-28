-- ═══════════════════════════════════════════════════════════
-- 1000-Day Maternal & Child Care Suite — Supabase Schema
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('mother','partner','doctor')),
  language      TEXT DEFAULT 'en-IN',
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── MOTHER PROFILES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mother_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_id      UUID REFERENCES users(id),
  doctor_id       UUID REFERENCES users(id),
  due_date        DATE,
  weeks_pregnant  INT DEFAULT 0,
  blood_type      TEXT,
  weight_kg       DECIMAL(5,2),
  height_cm       INT,
  ayushman_id     TEXT,
  emergency_name  TEXT,
  emergency_phone TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── VITALS (real-time subscribed) ──────────────────────────
CREATE TABLE IF NOT EXISTS vitals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  recorded_at   TIMESTAMPTZ DEFAULT NOW(),
  bp_systolic   INT,
  bp_diastolic  INT,
  blood_sugar   DECIMAL(5,1),
  weight_kg     DECIMAL(5,2),
  pulse         INT,
  temperature   DECIMAL(4,1),
  oxygen_sat    INT,
  symptom_code  INT DEFAULT 0,
  mood          INT DEFAULT 1 CHECK (mood BETWEEN 1 AND 4),
  risk_score    INT DEFAULT 0,
  risk_level    TEXT DEFAULT 'low' CHECK (risk_level IN ('low','medium','high')),
  ai_summary    TEXT,
  notes         TEXT
);

-- ── AI CONVERSATIONS (real-time) ───────────────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id  UUID NOT NULL DEFAULT uuid_generate_v4(),
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  language    TEXT DEFAULT 'en-IN',
  audio_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── APPOINTMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mother_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id       UUID REFERENCES users(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_mins   INT DEFAULT 30,
  type            TEXT DEFAULT 'checkup',
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','in_progress')),
  video_room_id   TEXT,
  doctor_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── HEALTH FEED (real-time) ────────────────────────────────
CREATE TABLE IF NOT EXISTS health_feed (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source      TEXT NOT NULL,
  source_icon TEXT,
  source_color TEXT,
  source_bg   TEXT,
  title       TEXT NOT NULL,
  summary     TEXT,
  tags        TEXT[],
  priority    INT DEFAULT 5,
  is_live     BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MEDICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  dose          TEXT,
  time_of_day   TEXT CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  instructions  TEXT,
  taken_today   BOOLEAN DEFAULT FALSE,
  taken_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMERGENCY EVENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  status      TEXT DEFAULT 'triggered',
  resolved_at TIMESTAMPTZ,
  notes       TEXT
);

-- ── PARTNER ALERTS (real-time) ────────────────────────────
CREATE TABLE IF NOT EXISTS partner_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mother_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_id  UUID REFERENCES users(id),
  alert_type  TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── REFRESH TOKENS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vitals_user_time ON vitals(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conv_session  ON ai_conversations(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_appts_mother     ON appointments(mother_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_alerts_partner   ON partner_alerts(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_published   ON health_feed(published_at DESC);

-- ── ENABLE REALTIME ─────────────────────────────────────────
-- In Supabase Dashboard → Database → Replication, enable for:
-- vitals, ai_conversations, partner_alerts, health_feed

ALTER TABLE vitals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_alerts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications       ENABLE ROW LEVEL SECURITY;

-- ── SEED HEALTH FEED ────────────────────────────────────────
INSERT INTO health_feed (source,source_icon,source_color,source_bg,title,summary,tags,priority,is_live) VALUES
('WHO','🌍','#2196F3','#E3F2FD','New WHO Guidelines: Iron Supplementation During Pregnancy','WHO updates daily iron dosage for second trimester — includes folate co-prescription for maximum absorption.',ARRAY['#Nutrition','#Iron'],1,true),
('ICMR','🏛️','#9C27B0','#F3E5F5','Study: Mobile Monitoring Reduces Maternal Mortality 34%','ICMR confirms AI-assisted vital tracking in rural India has dramatically improved maternal outcomes.',ARRAY['#Research','#AI'],2,false),
('MoHFW','🇮🇳','#F44336','#FFEBEE','Ayushman Bharat Expands Maternity Coverage in Telangana','Government announces expanded benefits — all prenatal scans and consultations under PM-JAY scheme.',ARRAY['#Policy','#Ayushman'],3,false),
('UNICEF','🌱','#4CAF50','#E8F5E9','First 1000 Days: Why Nutrition Matters Most','UNICEF data shows brain development in first 1000 days is irreversible.',ARRAY['#ChildHealth','#1000Days'],4,false),
('Lancet','📰','#FF9800','#FFF3E0','Gestational Diabetes: Early Screening Saves Lives','Meta-analysis: glucose test at 16 weeks prevents 62% of GDM complications.',ARRAY['#Diabetes','#Research'],5,false),
('Community','✕','#333333','#F5F5F5','Trending: #SafePregnancy — Community Tips Going Viral','Indian mothers sharing AI monitoring combinations for healthy deliveries.',ARRAY['#Community','#Trending'],6,false)
ON CONFLICT DO NOTHING;

-- ── UPDATED_AT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER mother_profiles_updated_at BEFORE UPDATE ON mother_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
