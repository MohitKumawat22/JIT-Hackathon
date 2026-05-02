# 🏥 MediAI — JIT Hackathon Project Planning
> 30-Hour Hackathon | Powered by Microsoft | Team: MohitKumawat22
> Repo: https://github.com/MohitKumawat22/JIT-Hackathon

---

## 📌 Project Overview

**MediAI** is a fully AI-powered Hospital & Clinic Management System with a **talking 3D AI doctor avatar** that understands natural language commands and manages patients, appointments, medicines, and reports — all through conversation.

### Core Idea
> "Instead of clicking through forms, just talk to MediAI — it books appointments, reads prescriptions, alerts on low stock, and generates reports automatically."

---

## 🎯 Problem Statement

Indian hospitals waste **2–3 hours per day per staff member** on manual data entry — writing patient records, booking appointments on paper, tracking medicine stock in spreadsheets. Small clinics have no affordable digital solution. MediAI solves this with a single AI-first interface anyone can use by speaking or typing.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| 3D Avatar | Three.js + @react-three/fiber + @react-three/drei |
| AI Brain | Claude API (claude-sonnet-4-20250514) |
| Voice Output | ElevenLabs Text-to-Speech |
| Voice Input | Web Speech API (browser built-in) |
| Database | MongoDB Atlas (free tier) |
| Auth | NextAuth.js |
| Charts | Recharts |
| Notifications | Twilio (WhatsApp/SMS) |
| Deployment | Vercel |
| Styling | Tailwind CSS + shadcn/ui |

---

## 📁 Project Folder Structure

```
JIT-Hackathon/
└── my-app/
    ├── public/
    │   └── avatar.glb              ← Ready Player Me 3D avatar
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            ← Main dashboard
    │   │   ├── layout.tsx
    │   │   └── api/
    │   │       ├── chat/route.ts   ← Claude AI endpoint
    │   │       ├── tts/route.ts    ← ElevenLabs TTS endpoint
    │   │       ├── patients/route.ts
    │   │       ├── appointments/route.ts
    │   │       ├── medicines/route.ts
    │   │       └── reports/route.ts
    │   ├── components/
    │   │   ├── Avatar.tsx          ← 3D avatar with lip sync
    │   │   ├── AvatarScene.tsx     ← Three.js canvas wrapper
    │   │   ├── Dashboard.tsx       ← Stats overview
    │   │   ├── PatientList.tsx
    │   │   ├── AppointmentList.tsx
    │   │   ├── MedicineInventory.tsx
    │   │   ├── ReportsPanel.tsx
    │   │   └── ChatInput.tsx       ← Voice + text input
    │   ├── hooks/
    │   │   ├── useAvatarChat.ts    ← Main AI + TTS hook
    │   │   └── useVoiceInput.ts    ← Web Speech API hook
    │   ├── lib/
    │   │   ├── mongodb.ts
    │   │   └── claude.ts
    │   └── types/
    │       └── index.ts
    ├── .env.local
    └── package.json
```

---

## ⚡ Features List (Prioritized by Impact)

### 🔴 MUST HAVE — Core Features (Hours 0–15)

#### 1. 3D AI Doctor Avatar with Lip Sync + Hand Gestures
The centerpiece of the demo. A Ready Player Me 3D character that:
- Speaks responses aloud using ElevenLabs TTS
- Animates lips in sync with speech (ARKit morph targets)
- Waves hands when greeting, points when explaining
- Plays idle breathing animation when not talking
- Nods head when confirming actions

**Files to create:**
- `src/components/Avatar.tsx`
- `src/components/AvatarScene.tsx`

---

#### 2. AI Natural Language Command Interface
Type or speak commands and the AI performs real actions:
- "Book an appointment for Rahul with Dr. Gupta tomorrow at 10am"
- "Add new patient: Priya Sharma, age 32, blood type B+"
- "Which medicines are running low?"
- "Generate a report for this week's patients"
- "Show me all critical patients"

**Files to create:**
- `src/app/api/chat/route.ts`
- `src/hooks/useAvatarChat.ts`

---

#### 3. Patient Management
- Add / view / update patient records
- Search by name, ID, or condition
- Status tracking: Active, Pending, Critical
- Blood type, age, department info

---

#### 4. Appointment Booking & Management
- View today's appointments
- Book new appointments via AI command
- Doctor-wise schedule view
- Status: Confirmed, Pending, Cancelled

---

#### 5. Medicine Inventory Tracking
- View all medicines with stock levels
- Visual stock bar (green/amber/red)
- Expiry date tracking
- Low stock alerts (auto-triggered by AI)

---

#### 6. Reports Generation
- AI generates reports automatically
- Monthly patient summary
- Medicine stock report
- Doctor performance report
- One-click download as PDF

---

### 🟡 SHOULD HAVE — Differentiators (Hours 15–24)

#### 7. AI Symptom Triage
Patient describes symptoms → AI suggests:
- Which department to visit
- Urgency level (Normal / Urgent / Emergency)
- First aid advice
- Which doctor to see

**Prompt to use:**
```
You are a medical triage AI. The patient says: "{symptoms}". 
Respond with: department, urgency (Normal/Urgent/Emergency), 
brief first-aid advice, and recommended doctor type. 
Keep response under 3 sentences.
```

---

#### 8. AI Prescription Reader (Photo Upload)
- User uploads photo of handwritten prescription
- Claude Vision reads it and extracts:
  - Medicine names
  - Dosages
  - Frequency
  - Duration
- Auto-adds medicines to patient record

---

#### 9. Voice Command Interface
- Click mic button → speak command
- Web Speech API transcribes to text
- Sent to Claude → response spoken back by avatar
- Perfect for demo on stage

**Files to create:**
- `src/hooks/useVoiceInput.ts`

---

#### 10. Smart Analytics Dashboard
- Patient flow chart (daily/weekly/monthly)
- Doctor load chart (appointments per doctor)
- Medicine usage trends
- AI auto-insight: "Dr. Gupta is overbooked — consider redistributing 3 patients"

---

### 🟢 NICE TO HAVE — Polish (Hours 24–30)

#### 11. Role-Based Login
- Admin: sees everything
- Doctor: sees only their patients
- Receptionist: manages appointments only
- Uses NextAuth.js

#### 12. WhatsApp Appointment Reminders
- Twilio sends WhatsApp message 1hr before appointment
- AI generates the message text
- "Hi Rahul, your appointment with Dr. Gupta is tomorrow at 10am at General Hospital."

#### 13. Hindi Language Support
- Staff can type in Hindi
- Claude understands and responds in Hindi
- Avatar speaks Hindi response via ElevenLabs

#### 14. Bed Availability Tracker
- Visual grid showing occupied / free / maintenance beds
- AI assigns beds on patient admission
- Real-time update

#### 15. AI Discharge Summary Generator
- One click → AI reads patient history
- Generates professional discharge summary
- Downloads as PDF

---

## 🤖 All AI Prompts

### System Prompt — Main HMS Assistant
```
You are MediAI, an intelligent hospital management AI assistant for a clinic in India.

You have access to the following hospital data:
PATIENTS: [dynamic list from database]
DOCTORS: Dr. Gupta (Cardiology), Dr. Rajan (Dermatology), Dr. Mehta (Cardiology), Dr. Iyer (Neurology)
TODAY'S APPOINTMENTS: [dynamic list from database]
MEDICINES: [dynamic list from database]
REPORTS: [dynamic list from database]

You can perform these actions by responding with structured JSON:
- book_appointment: { patient, doctor, date, time, type }
- add_patient: { name, age, gender, blood_type, department }
- update_patient_status: { id, status }
- check_medicines: { filter: "low_stock" | "expiring" | "all" }
- generate_report: { type: "patients" | "medicines" | "doctors", period }
- answer_query: { response: string }

Always respond with a JSON object:
{
  "action": "action_name",
  "data": { ... },
  "message": "Human-friendly confirmation message in 1-2 sentences"
}

Be professional, warm, and concise. You are speaking as a medical AI assistant.
If the command is unclear, ask for clarification in the message field.
```

---

### Prompt — Symptom Triage
```
You are a medical triage AI assistant in an Indian hospital.

A patient has described their symptoms: "{USER_SYMPTOMS}"

Analyze the symptoms and respond in this exact JSON format:
{
  "department": "Department name",
  "urgency": "Normal | Urgent | Emergency",
  "urgency_reason": "One sentence why",
  "first_aid": "One simple first-aid tip",
  "recommended_doctor_type": "Type of specialist",
  "message": "Friendly 2-sentence response to tell the patient"
}

Rules:
- Emergency: chest pain, difficulty breathing, stroke symptoms, severe bleeding
- Urgent: high fever, severe pain, injury needing attention today
- Normal: routine checkup, mild symptoms, follow-ups
```

---

### Prompt — Prescription Reader (Vision)
```
You are a medical prescription reading AI.

Look at this image of a prescription and extract all medicine information.
Respond ONLY in this JSON format with no extra text:
{
  "medicines": [
    {
      "name": "Medicine name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 7 days",
      "notes": "any special instructions or empty string"
    }
  ],
  "doctor_name": "Doctor name if visible or null",
  "date": "Date if visible or null",
  "readable": true
}

If the prescription is too blurry or unreadable, set "readable": false and return empty medicines array.
```

---

### Prompt — Report Generator
```
You are a hospital report generator AI.

Generate a professional {REPORT_TYPE} report for {TIME_PERIOD} using this data:
{DATA_JSON}

Format the report as structured JSON:
{
  "title": "Report title",
  "period": "Time period",
  "generated_at": "Timestamp",
  "summary": "2-3 sentence executive summary",
  "key_metrics": [
    { "label": "Metric name", "value": "Value", "trend": "up | down | stable" }
  ],
  "insights": [
    "AI-generated insight 1",
    "AI-generated insight 2",
    "AI-generated insight 3"
  ],
  "recommendations": [
    "Action recommendation 1",
    "Action recommendation 2"
  ]
}
```

---

### Prompt — AI Analytics Insights
```
You are a hospital analytics AI.

Analyze this hospital data and generate 3 key insights:
{ANALYTICS_DATA}

Respond in JSON:
{
  "insights": [
    {
      "type": "warning | info | success",
      "title": "Short insight title",
      "description": "One sentence explanation",
      "action": "Suggested action or null"
    }
  ]
}

Focus on: overbooked doctors, low medicine stock, patient trends, appointment patterns.
Keep each insight under 15 words.
```

---

### Prompt — WhatsApp Message Generator
```
Generate a friendly WhatsApp appointment reminder in {LANGUAGE}.

Details:
- Patient name: {PATIENT_NAME}
- Doctor: {DOCTOR_NAME}
- Date: {DATE}
- Time: {TIME}
- Hospital: {HOSPITAL_NAME}
- Department: {DEPARTMENT}

Rules:
- Keep it under 50 words
- Friendly and professional tone
- Include a reminder to bring previous reports
- End with hospital contact if available
- For Hindi, use simple conversational Hindi, not formal

Respond with only the message text, nothing else.
```

---

### Prompt — Discharge Summary Generator
```
You are a medical documentation AI. Generate a professional hospital discharge summary.

Patient Data:
{PATIENT_JSON}

Visit Data:
{VISIT_JSON}

Generate a structured discharge summary in JSON:
{
  "patient_info": { "name", "age", "gender", "blood_type", "id" },
  "admission_date": "",
  "discharge_date": "",
  "primary_diagnosis": "",
  "secondary_diagnosis": [],
  "treatment_given": [],
  "medicines_prescribed": [{ "name", "dosage", "frequency", "duration" }],
  "follow_up_date": "",
  "instructions": [],
  "doctor_name": "",
  "summary": "3-4 sentence clinical summary"
}

Use formal medical language. Be accurate and concise.
```

---

## 🤖 3D Avatar — Full Integration Code

### Step 1 — Install packages
```bash
cd JIT-Hackathon/my-app
npm install @react-three/fiber @react-three/drei three
npm install @elevenlabs/elevenlabs-js
npm install leva
npm install @types/three --save-dev
```

### Step 2 — Get avatar.glb
Go to https://readyplayer.me → Create doctor avatar → Download with this URL format:
```
https://models.readyplayer.me/YOUR_AVATAR_ID.glb?morphTargets=ARKit&textureAtlas=1024
```
Place at: `public/avatar.glb`

### Step 3 — src/components/Avatar.tsx
```tsx
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AvatarProps {
  isTalking: boolean;
}

export function Avatar({ isTalking }: AvatarProps) {
  const { scene, animations } = useGLTF("/avatar.glb");
  const { actions } = useAnimations(animations, scene);
  const morphRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetDictionary) {
        morphRef.current = obj;
      }
    });
    if (actions["Idle"]) actions["Idle"].play();
  }, [scene, actions]);

  useEffect(() => {
    if (isTalking) {
      actions["Talking"]?.reset().play();
    } else {
      actions["Talking"]?.stop();
      actions["Idle"]?.play();
    }
  }, [isTalking, actions]);

  useFrame((state) => {
    const mesh = morphRef.current;
    if (!mesh?.morphTargetInfluences || !mesh.morphTargetDictionary) return;

    if (isTalking) {
      const t = state.clock.elapsedTime;
      const cycle = Math.floor(t * 8) % 4;
      const vowels = ["viseme_aa", "viseme_E", "viseme_O", "viseme_U"];
      const dict = mesh.morphTargetDictionary;

      Object.values(dict).forEach((idx) => {
        if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[idx] = 0;
      });

      const target = vowels[cycle] ?? "viseme_aa";
      if (dict[target] !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[dict[target]] =
          0.4 + Math.sin(t * 12) * 0.2;
      }
    } else {
      const dict = mesh.morphTargetDictionary;
      Object.values(dict).forEach((idx) => {
        if (mesh.morphTargetInfluences)
          mesh.morphTargetInfluences[idx] *= 0.85;
      });
    }
  });

  return (
    <group position={[0, -1.6, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/avatar.glb");
```

### Step 4 — src/components/AvatarScene.tsx
```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Avatar } from "./Avatar";

export function AvatarScene({ isTalking }: { isTalking: boolean }) {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4fc3f7" />
        <Suspense fallback={null}>
          <Avatar isTalking={isTalking} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
```

### Step 5 — src/hooks/useAvatarChat.ts
```ts
"use client";
import { useState, useCallback } from "react";

export function useAvatarChat() {
  const [isTalking, setIsTalking] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    setLoading(true);
    try {
      const aiRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const { text } = await aiRes.json() as { text: string };
      setResponse(text);

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setIsTalking(true);
      await audio.play();
      audio.onended = () => {
        setIsTalking(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isTalking, response, loading, sendMessage };
}
```

### Step 6 — src/hooks/useVoiceInput.ts
```ts
"use client";
import { useState, useCallback } from "react";

export function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // Indian English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      onResult(transcript);
    };
    recognition.start();
  }, [onResult]);

  return { isListening, startListening };
}
```

### Step 7 — src/app/api/chat/route.ts
```ts
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are MediAI, an intelligent hospital management AI assistant for a clinic in India.

You can: book appointments, add patients, check medicines, generate reports, answer health queries.
Always respond concisely in 2-3 sentences. Be professional and warm.
When confirming an action, say clearly what was done.`;

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await res.json();
  const text = (data.content?.[0] as { text: string })?.text ?? "Sorry, I could not process that.";
  return NextResponse.json({ text });
}
```

### Step 8 — src/app/api/tts/route.ts
```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };

  const res = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
```

### Step 9 — .env.local
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=your-mongodb-atlas-uri
```

### Step 10 — next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: { loader: "file-loader" },
    });
    return config;
  },
};
export default nextConfig;
```

---

## ⏱️ 30-Hour Sprint Timeline

| Time | Task | Who |
|---|---|---|
| 00:00 – 02:00 | Project setup, Next.js init, Vercel deploy | Dev 1 |
| 00:00 – 02:00 | Ready Player Me avatar download + MongoDB setup | Dev 2 |
| 02:00 – 06:00 | 3D Avatar component + AvatarScene + lip sync | Dev 1 |
| 02:00 – 06:00 | Claude API + ElevenLabs TTS API routes | Dev 2 |
| 06:00 – 10:00 | Dashboard UI + Patient list + Appointments | Dev 1 |
| 06:00 – 10:00 | useAvatarChat hook + useVoiceInput hook | Dev 2 |
| 10:00 – 14:00 | Medicine inventory + Reports panel | Dev 1 |
| 10:00 – 14:00 | Symptom triage feature + Prescription reader | Dev 2 |
| 14:00 – 18:00 | Analytics dashboard + Recharts integration | Dev 1 |
| 14:00 – 18:00 | Role-based auth (NextAuth) | Dev 2 |
| 18:00 – 22:00 | Hindi language support + WhatsApp notifications | Dev 1 |
| 18:00 – 22:00 | AI discharge summary + PDF export | Dev 2 |
| 22:00 – 26:00 | Bug fixes, polish, mobile responsiveness | Both |
| 26:00 – 28:00 | README, demo script, Vercel environment variables | Dev 1 |
| 28:00 – 30:00 | Rehearse demo, final testing | Both |

---

## 🎤 Demo Script (For Judges)

1. Open the app — show the 3D AI doctor avatar standing on screen
2. Type: *"Hello MediAI"* → avatar speaks and waves
3. Type: *"Show me today's appointments"* → dashboard updates
4. Type: *"Book an appointment for Rahul Kumar with Dr. Gupta tomorrow at 10am"* → avatar confirms
5. Click mic → speak: *"Which medicines are running low?"* → avatar speaks the answer
6. Upload prescription photo → AI reads it → medicines extracted
7. Type: *"Generate a report for this month"* → report appears
8. Show analytics dashboard with AI insights

**Opening line for presentation:**
> "Indian hospitals waste thousands of hours on paperwork every year. MediAI eliminates that — you just talk to your AI doctor, and everything gets done."

---

## 🏆 Why This Will Win

- **Visual WOW**: Talking 3D avatar is unforgettable — judges will remember it
- **Real Problem**: Every Indian clinic faces this exact problem
- **Full Stack**: Frontend + Backend + AI + 3D + Voice — technically impressive
- **Microsoft Aligned**: Uses Azure-friendly Next.js stack, AI-first approach
- **Live Demo Ready**: Deployed on Vercel with a real URL
- **Multilingual**: Hindi support shows India-first thinking

---

## 📦 Key Dependencies (package.json additions)

```json
{
  "dependencies": {
    "@react-three/fiber": "^8.13.7",
    "@react-three/drei": "^9.80.6",
    "three": "^0.156.1",
    "@elevenlabs/elevenlabs-js": "^2.42.0",
    "leva": "^0.9.35",
    "recharts": "^2.8.0",
    "next-auth": "^4.22.4",
    "mongoose": "^7.4.3",
    "twilio": "^4.16.0",
    "jspdf": "^2.5.1"
  },
  "devDependencies": {
    "@types/three": "^0.156.0"
  }
}
```

---

## 🔗 Useful Links

- Ready Player Me (avatar): https://readyplayer.me
- ElevenLabs (TTS + voices): https://elevenlabs.io
- Claude API docs: https://docs.anthropic.com
- MongoDB Atlas (free DB): https://cloud.mongodb.com
- Vercel deploy: https://vercel.com
- Three.js examples: https://threejs.org/examples
- React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber

---

*Built with ❤️ by Team MohitKumawat22 for JIT Hackathon 2026*
