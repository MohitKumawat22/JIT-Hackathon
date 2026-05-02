# AmritCare - Technical Documentation

AmritCare is a comprehensive healthcare web application connecting patients and doctors, offering features like an AI-powered triage/health assistant, nearby hospital tracking, and booking management.

## 1. Tech Stack Overview

- **Frontend**: Next.js 16.2.4 (App Router), React 19.2.4
- **Styling**: Tailwind CSS (v4)
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: MongoDB via Mongoose (v9.6.1)
- **Authentication**: Custom JWT/Session based with `bcryptjs` for password hashing
- **External Integrations**:
  - **x.ai (Grok)**: Used for the AI Health Assistant/Triage + AI Calling Assistant
  - **Google Places API**: Used for locating nearby hospitals and clinics
  - **Twilio**: Outbound calling + native Speech-to-Text (`<Gather input="speech">`)
  - **node-cron**: Scheduling engine for the call worker
  - **ngrok**: Local webhook tunnel for Twilio during development

## 2. Project Architecture

The application is structured using Next.js App Router paradigm (`src/app/`):

### Application Routes (`src/app/`)
- `/` - Landing Page
- **/patient** (Patient Portal)
  - `/patient/login` & `/patient/register` - Patient Authentication
  - `/patient/dashboard` - Main patient dashboard overview + **AI Call Scheduler**
  - `/patient/history` - Patient medical history (triages, bookings, **AI call logs**)
  - `/patient/locate` - Nearby hospitals map integration
  - `/patient/triage` - AI Health Assistant Chatbot interface
- **/doctor** (Doctor Portal)
  - `/doctor/login` - Doctor Authentication
  - `/doctor/dashboard` - Doctor dashboard showing patient data and metrics
  - `/doctor/settings` - Doctor profile management

### API Routes (`src/app/api/`)
- `/api/auth/login` & `/api/auth/register` - Handle user authentication and registration
- `/api/bookings` - Manage patient facility bookings (CRUD)
- `/api/chat` - Connects to `grok-3-mini` (x.ai API) to provide intelligent health recommendations based on a structured system prompt
- `/api/patient/profile` - Fetches and updates patient data
- `/api/places` - Integrates with Google Places API to find nearby healthcare facilities using `lat`/`lng` and Haversine distance calculations
- `/api/triage` - Saves and retrieves AI chat triage session transcripts and summaries
- **`/api/calls`** - REST API for scheduling, listing, and cancelling AI health calls (GET/POST/DELETE)
- **`/api/twilio/voice`** - Twilio webhook that handles live call TwiML responses, mid-call Grok AI turns, and post-call summary generation

### Standalone Scripts (`scripts/`)
- **`call-worker.js`** - Node.js process that polls MongoDB every 30 seconds, finds due calls, fetches patient context, generates greetings via Grok, and fires Twilio outbound calls

## 3. Database Schema (MongoDB)

The project uses Mongoose models located in `src/models/`:

### 1. Patient Model (`Patient.js`)
Stores patient user information.
- `firstName`, `lastName` (String)
- `email`, `username` (String, unique)
- `password` (String, hashed)
- `phone` (String)
- `age` (Number)
- `blood` (String - Blood Group)

### 2. Booking Model (`Booking.js`)
Tracks appointments or hospital visits created by the patient.
- `patientId` (ObjectId ref "Patient")
- `facilityName`, `address`, `department` (String)
- `lat`, `lng`, `rating` (Number)
- `placeId` (String - Google Place ID)
- `status` (Enum: "upcoming", "completed", "cancelled")
- `notes` (String)

### 3. Triage Model (`Triage.js`)
Stores the transcript and summary of the AI triage session.
- `patientId` (ObjectId ref "Patient")
- `title` (String)
- `severity` (Enum: "critical", "high", "moderate", "low", "info")
- `symptoms` (Array of Strings)
- `transcript` (Array of { role: "user" | "assistant", text: String })
- `recommendation` (String)

### 4. CallLog Model (`CallLog.js`)
Tracks AI-powered health checkup calls.
- `patientId` (ObjectId ref "Patient")
- `scheduledAt` (Date)
- `status` (Enum: "scheduled", "in-progress", "completed", "failed", "cancelled")
- `callSid` (String - Twilio Call SID)
- `context` (Object - pre-fetched patient profile, last triage, recent bookings, past call summaries)
- `greeting` (String - Grok-generated opening line)
- `transcript` (Array of { role: "assistant" | "patient", text, timestamp })
- `summary` (String - Grok-generated post-call summary)
- `severity` (Enum: "critical", "high", "moderate", "low", "info" — keyword-detected)
- `notes` (String - patient's optional reason for the call)

## 4. Key Components & Integrations

### AI Triage System (`/api/chat` & `TriageChat.js`)
- Uses **Grok-3-mini** model.
- Requires `GROK_API_KEY` in environment variables.
- System prompt strictly restricts the AI from prescribing medications, instructing it to only recommend home remedies and specify the type of specialist to consult.
- Handles user emergency prompts by triggering immediate medical attention advice.

### AI Calling Assistant (`/api/calls`, `/api/twilio/voice`, `call-worker.js`, `ScheduleCall.jsx`)
An automated outbound calling system that conducts personalized health conversations:

**How It Works (Full Flow):**
1. Patient schedules a call from their dashboard (date/time picker + optional notes)
2. `POST /api/calls` creates a `CallLog` with status `scheduled`
3. `call-worker.js` polls every 30 seconds, finds due calls
4. For each due call, it runs `Promise.all` to fetch context in parallel:
   - Patient profile (name, age, blood group, phone)
   - Latest triage session (symptoms, severity, recommendation)
   - Recent bookings (last 2 visits)
   - Past call summaries (last 3 calls)
5. Context is saved to `CallLog.context`, greeting is pre-generated via Grok
6. Twilio fires outbound call → patient's phone rings
7. Twilio hits `POST /api/twilio/voice` webhook with TwiML responses
8. Multi-turn conversation: Twilio STT → Grok AI reply (max 80 tokens) → TwiML speak → loop
9. On hangup: Grok summarizes transcript, severity is keyword-detected, saved to CallLog
10. Summary and severity badge appear in the patient's history page

**Severity Detection (Post-Call):**
| Severity | Trigger Keywords |
|---|---|
| `critical` | chest pain, can't breathe, heart attack, stroke, unconscious, emergency |
| `high` | severe, hospital, ambulance, dizzy, vomiting, very bad |
| `moderate` | pain, fever, headache, nausea, tired, weak |
| `low` | okay, fine, better, good, normal |
| `info` | (default fallback) |

**Safety Limits:**
- Calls are capped at 20 transcript entries (10 exchanges) to prevent runaway calls
- Grok replies are limited to 80 tokens per turn for natural phone conversation pacing
- Emergency keywords trigger immediate advice to call emergency services

### Location Services (`/api/places`)
- Uses **Google Places API** (Nearby Search).
- Requires `GOOGLE_MAPS_API_KEY`.
- Includes a sophisticated fallback mechanism using the Haversine formula to generate dummy data relative to the user's actual position if the API key is missing or invalid.

### Database Connection (`src/lib/db.js`)
- Implements a global cache mechanism for Mongoose connections. This prevents "connection pool exhaustion" during Next.js hot reloads in development and efficiently manages connections in a serverless environment.

## 5. Development Setup

### Environment Variables (`.env.local`)
```
MONGODB_URI=                 # MongoDB connection string
GROK_API_KEY=                # x.ai API key for Grok-3-mini
GOOGLE_MAPS_API_KEY=         # Google Places API key
TWILIO_ACCOUNT_SID=          # Twilio Account SID
TWILIO_AUTH_TOKEN=           # Twilio Auth Token
TWILIO_PHONE_NUMBER=         # Twilio trial number (e.g. +14155551234)
NGROK_URL=                   # ngrok tunnel URL (update each session)
```

### Running Locally (3 Terminals)
```bash
# Terminal 1 — Next.js dev server
cd my-app && npm run dev

# Terminal 2 — AI Call Worker (polls for due calls)
node scripts/call-worker.js

# Terminal 3 — Expose webhook to Twilio
ngrok http 3000
# Copy the https URL → paste into .env.local as NGROK_URL
# Restart Terminal 2 after updating NGROK_URL
```

### Quick Start (without calling feature)
1. Fill in `MONGODB_URI` and `GROK_API_KEY` in `.env.local`
2. `cd my-app && npm install && npm run dev`
3. The database can optionally be populated using `node seed.js`
