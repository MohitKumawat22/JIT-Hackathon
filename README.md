<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Three.js-3D_Avatar-000000?style=for-the-badge&logo=three.js" />
</p>

<h1 align="center">🏥 AmritCare AI</h1>

<p align="center">
  <strong>An AI-powered healthcare platform connecting patients and doctors with intelligent triage, 3D avatar consultations, and automated health calls.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Env Variables</a> •
  <a href="#-folder-structure">Folder Structure</a> •
  <a href="#-team">Team</a>
</p>

---

## 📌 About

**AmritCare AI** is a comprehensive healthcare web application built for the **JIT Hackathon 2026** (Powered by Microsoft). It bridges the gap between patients and healthcare providers by offering:

- 🤖 **AI Health Triage** — Describe your symptoms, get home remedies and specialist recommendations
- 🗺️ **Nearby Hospital Finder** — Real-time geolocation-based hospital/clinic search via Google Places API
- 📞 **AI Calling Assistant** — Automated outbound health checkup calls using Twilio + Grok AI
- 🧑‍⚕️ **3D AI Doctor Avatar** — Interactive Three.js avatar with lip-sync and conversational gestures
- 📋 **Role-Based Portals** — Separate dashboards for patients and doctors
- 📊 **Health Timeline** — Complete medical history tracking (triages, bookings, call logs)

> **"Instead of navigating through complex hospital systems, just talk to AmritCare — it triages your symptoms, finds nearby hospitals, books appointments, and even calls you for health check-ins."**

---

## ✨ Features

### Patient Portal
| Feature | Description |
|---|---|
| **AI Symptom Triage** | Chat with Grok-3-mini AI to analyze symptoms, get home remedy suggestions, and specialist recommendations |
| **Nearby Hospitals** | Google Places integration with real-time geolocation, distance calculation (Haversine), and directions |
| **Appointment Booking** | Book facility visits with `.ics` calendar download support |
| **AI Health Calls** | Schedule automated outbound calls — Twilio dials you, Grok AI conducts a personalized health conversation |
| **Medical History** | Timeline view of all triages, bookings, and AI call summaries with severity badges |
| **Dashboard** | Overview of health metrics, upcoming appointments, and quick actions |

### Doctor Portal
| Feature | Description |
|---|---|
| **Patient Overview** | View assigned patients and their medical data |
| **Dashboard** | Metrics, patient queue, and appointment management |
| **Profile Settings** | Manage doctor profile and availability |
| **X-Ray Analysis** | AI-assisted X-ray image analysis |

### AI Calling System (End-to-End)
```
Patient schedules call → call-worker.js polls DB → Fetches patient context →
Grok generates greeting → Twilio dials patient → Multi-turn voice conversation →
Grok summarizes call → Severity detected → Summary saved to history
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.2 (App Router), React 19.2 |
| **Styling** | Tailwind CSS v4 |
| **3D Avatar** | Three.js + @react-three/fiber + @react-three/drei |
| **AI Engine** | x.ai Grok-3-mini |
| **Voice (TTS)** | ElevenLabs Text-to-Speech |
| **Voice (Calls)** | Twilio (Outbound Calls + Native STT) |
| **Database** | MongoDB Atlas (Mongoose v9.6) |
| **Auth** | Custom JWT/Session + bcryptjs |
| **Location** | Google Places API |
| **Scheduling** | node-cron (call worker) |
| **Dev Tunnel** | ngrok (Twilio webhook) |

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Patient  │  │ Doctor   │  │ AI Chat  │  │ 3D      │ │
│  │ Portal   │  │ Portal   │  │ (Triage) │  │ Avatar  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└───────┼──────────────┼─────────────┼─────────────┼──────┘
        │              │             │             │
        ▼              ▼             ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS API ROUTES                      │
│  /api/auth  /api/chat  /api/places  /api/triage         │
│  /api/bookings  /api/calls  /api/twilio/voice           │
│  /api/patient  /api/doctors  /api/tts  /api/lipsync     │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────────┐
  │ MongoDB  │   │ x.ai     │   │ External     │
  │ Atlas    │   │ (Grok)   │   │ Services     │
  │          │   │          │   │ • Twilio      │
  │ Patients │   │ Triage   │   │ • ElevenLabs │
  │ Bookings │   │ Calls    │   │ • Google Maps│
  │ Triages  │   │ Summary  │   │ • ngrok      │
  │ CallLogs │   │          │   │              │
  └──────────┘   └──────────┘   └──────────────┘

  ┌──────────────────────────────────────┐
  │     STANDALONE: call-worker.js       │
  │  Polls DB every 30s for due calls    │
  │  Fetches context → Grok greeting     │
  │  → Twilio outbound call              │
  └──────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier works)
- API keys for: **x.ai (Grok)**, **Google Places**, **Twilio**, **ElevenLabs** (optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/MohitKumawat22/JIT-Hackathon.git
cd JIT-Hackathon

# 2. Install dependencies
cd my-app
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see section below)

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000** 🎉

### Quick Start (Minimal — Without Calling Feature)

Only need the core platform? Just set two env vars:

```bash
# .env.local
MONGODB_URI=your_mongodb_connection_string
GROK_API_KEY=your_xai_api_key
```

```bash
cd my-app && npm install && npm run dev
```

### Full Setup (With AI Calling Feature)

Running the AI calling system requires **3 terminals**:

```bash
# Terminal 1 — Next.js dev server
cd my-app && npm run dev

# Terminal 2 — AI Call Worker (polls for scheduled calls)
node scripts/call-worker.js

# Terminal 3 — Expose webhook to Twilio
ngrok http 3000
# Copy the HTTPS URL → paste into .env.local as NGROK_URL
# Restart Terminal 2 after updating NGROK_URL
```

---

## 🔑 Environment Variables

Create a `.env.local` file inside the `my-app/` directory:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/amritcare

# AI Engine
GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxx

# Google Maps / Places
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx

# Twilio (for AI calling feature)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+14155551234

# ngrok (update each session for Twilio webhooks)
NGROK_URL=https://xxxx-xx-xx-xxx-xx.ngrok-free.app

# ElevenLabs (optional — for avatar TTS)
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📁 Folder Structure

```
JIT-Hackathon/
├── README.md
├── PLANNING.md                    # Detailed project planning document
├── TECHNICAL_DETAILS.md           # In-depth technical documentation
├── scripts/
│   └── call-worker.js             # Standalone AI call scheduling worker
└── my-app/                        # Next.js application root
    ├── public/                    # Static assets (avatar.glb, images)
    ├── src/
    │   ├── app/
    │   │   ├── page.js            # Landing page
    │   │   ├── layout.js          # Root layout
    │   │   ├── globals.css        # Global styles
    │   │   │
    │   │   ├── patient/           # Patient portal
    │   │   │   ├── login/         # Patient login
    │   │   │   ├── register/      # Patient registration
    │   │   │   ├── dashboard/     # Patient dashboard
    │   │   │   ├── triage/        # AI symptom triage chat
    │   │   │   ├── locate/        # Nearby hospitals map
    │   │   │   └── history/       # Medical history timeline
    │   │   │
    │   │   ├── doctor/            # Doctor portal
    │   │   │   ├── login/         # Doctor login
    │   │   │   ├── signup/        # Doctor registration
    │   │   │   ├── dashboard/     # Doctor dashboard
    │   │   │   ├── settings/      # Profile settings
    │   │   │   ├── verify/        # Verification flow
    │   │   │   ├── subscribe/     # Subscription page
    │   │   │   └── xray/          # X-ray analysis
    │   │   │
    │   │   └── api/               # Backend API routes
    │   │       ├── auth/          # Login & registration
    │   │       ├── chat/          # Grok AI chat endpoint
    │   │       ├── triage/        # Triage session CRUD
    │   │       ├── places/        # Google Places proxy
    │   │       ├── bookings/      # Appointment management
    │   │       ├── calls/         # AI call scheduling
    │   │       ├── twilio/        # Twilio voice webhooks
    │   │       ├── tts/           # ElevenLabs TTS proxy
    │   │       ├── lipsync/       # Avatar lip-sync data
    │   │       ├── patient/       # Patient profile API
    │   │       └── doctors/       # Doctor data API
    │   │
    │   ├── components/
    │   │   ├── Avatar.tsx         # 3D avatar with lip-sync + gestures
    │   │   ├── AvatarScene.tsx    # Three.js canvas wrapper
    │   │   ├── patient/           # Patient-specific components
    │   │   └── doctor/            # Doctor-specific components
    │   │
    │   ├── hooks/
    │   │   └── useVoiceConversation.ts  # Voice input/output hook
    │   │
    │   ├── models/                # Mongoose schemas
    │   │   ├── Patient.js
    │   │   ├── Booking.js
    │   │   ├── Triage.js
    │   │   └── CallLog.js
    │   │
    │   └── lib/
    │       └── db.js              # MongoDB connection (global cache)
    │
    └── package.json
```

---

## 🗄️ Database Schema

### Patient
| Field | Type | Description |
|---|---|---|
| `firstName`, `lastName` | String | Patient name |
| `email`, `username` | String (unique) | Login credentials |
| `password` | String | bcrypt-hashed password |
| `phone` | String | Contact number |
| `age` | Number | Patient age |
| `blood` | String | Blood group |

### Booking
| Field | Type | Description |
|---|---|---|
| `patientId` | ObjectId → Patient | Owner reference |
| `facilityName` | String | Hospital/clinic name |
| `department` | String | Medical department |
| `lat`, `lng` | Number | Geo-coordinates |
| `status` | Enum | `upcoming` · `completed` · `cancelled` |

### Triage
| Field | Type | Description |
|---|---|---|
| `patientId` | ObjectId → Patient | Owner reference |
| `severity` | Enum | `critical` · `high` · `moderate` · `low` · `info` |
| `symptoms` | [String] | Extracted symptoms |
| `transcript` | [{ role, text }] | Full chat transcript |
| `recommendation` | String | AI recommendation |

### CallLog
| Field | Type | Description |
|---|---|---|
| `patientId` | ObjectId → Patient | Owner reference |
| `scheduledAt` | Date | Scheduled call time |
| `status` | Enum | `scheduled` · `in-progress` · `completed` · `failed` · `cancelled` |
| `callSid` | String | Twilio Call SID |
| `transcript` | [{ role, text, timestamp }] | Call transcript |
| `summary` | String | AI-generated post-call summary |
| `severity` | Enum | Keyword-detected severity level |

---

## 🔒 Safety & Compliance

- **No prescriptions** — The AI strictly recommends home remedies and specialist types only, never specific medications
- **Emergency detection** — Critical keywords (chest pain, stroke, unconscious) trigger immediate emergency advice
- **Call safety limits** — AI calls are capped at 20 transcript entries (10 exchanges) to prevent runaway conversations
- **Token limits** — Grok replies are limited to 80 tokens per turn for natural phone conversation pacing
- **Password security** — All passwords are hashed with bcryptjs before storage
- **Connection pooling** — Global Mongoose cache prevents connection exhaustion in serverless environments

---

## 🧪 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Start AI call worker (from project root)
node scripts/call-worker.js
```

---

## 📸 Screenshots

> *Screenshots coming soon — run the app locally to see the full UI!*

---

## 👥 Team

**Team MohitKumawat22** — Built with ❤️ for JIT Hackathon 2026 (Powered by Microsoft)

- 🔗 **Repository**: [github.com/MohitKumawat22/JIT-Hackathon](https://github.com/MohitKumawat22/JIT-Hackathon)

---

## 📄 License

This project was built for the JIT Hackathon 2026. All rights reserved.

---

<p align="center">
  <strong>⭐ Star this repo if you found it interesting!</strong>
</p>
