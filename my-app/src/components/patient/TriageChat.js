"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ────────────────────────────────────────────────────────────
   Supported languages
   ──────────────────────────────────────────────────────────── */
const LANGUAGES = [
  { code: "en", label: "English", greeting: "Hello! I'm your AI health assistant." },
  { code: "hi", label: "हिन्दी", greeting: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ।" },
  { code: "es", label: "Español", greeting: "¡Hola! Soy tu asistente de salud con IA." },
  { code: "fr", label: "Français", greeting: "Bonjour ! Je suis votre assistant santé IA." },
  { code: "ta", label: "தமிழ்", greeting: "வணக்கம்! நான் உங்கள் AI சுகாதார உதவியாளர்." },
  { code: "bn", label: "বাংলা", greeting: "হ্যালো! আমি আপনার AI স্বাস্থ্য সহায়ক।" },
  { code: "te", label: "తెలుగు", greeting: "హలో! నేను మీ AI ఆరోగ్య సహాయకుడిని." },
  { code: "ar", label: "العربية", greeting: "مرحبًا! أنا مساعدك الصحي بالذكاء الاصطناعي." },
];

/* ────────────────────────────────────────────────────────────
   Symptom → Triage knowledge base (mock)
   ──────────────────────────────────────────────────────────── */
const SYMPTOM_DB = [
  {
    keywords: ["chest pain", "chest tightness", "heart", "breathing difficulty", "breathless"],
    severity: "critical",
    response: {
      en: "⚠️ **URGENT:** Chest pain and breathing difficulty can indicate a cardiac emergency.\n\n**Immediate steps:**\n1. Call emergency services (112 / 911) immediately\n2. Sit upright and try to stay calm\n3. If you have aspirin, chew one tablet (unless allergic)\n4. Do NOT drive yourself to the hospital\n\n🏥 **Recommendation:** Visit the nearest hospital emergency department immediately.",
      hi: "⚠️ **तत्काल:** छाती में दर्द और सांस लेने में कठिनाई हृदय आपातकाल का संकेत हो सकता है।\n\n**तुरंत कदम:**\n1. तुरंत आपातकालीन सेवाओं (112) को कॉल करें\n2. सीधे बैठें और शांत रहने की कोशिश करें\n3. यदि आपके पास एस्पिरिन है, तो एक गोली चबाएं\n\n🏥 **सिफारिश:** तुरंत निकटतम अस्पताल के आपातकालीन विभाग में जाएं।",
      es: "⚠️ **URGENTE:** El dolor en el pecho puede indicar una emergencia cardíaca.\n\n🏥 **Recomendación:** Visite la sala de emergencias del hospital más cercano de inmediato.",
    },
  },
  {
    keywords: ["fever", "temperature", "hot", "chills", "sweating"],
    severity: "moderate",
    response: {
      en: "🌡️ **Fever Assessment:**\n\nBased on your symptoms, here's what I recommend:\n\n**Home care steps:**\n1. Take paracetamol (500mg) every 6 hours\n2. Stay well hydrated — drink water, ORS, or clear broths\n3. Rest in a cool, ventilated room\n4. Use a damp cloth on your forehead\n\n**Visit a doctor if:**\n- Fever exceeds 103°F (39.4°C)\n- Symptoms persist beyond 3 days\n- You experience rash, stiff neck, or confusion\n\n💊 **Recommendation:** Rest and take fluids. Monitor for 24–48 hours.",
      hi: "🌡️ **बुखार मूल्यांकन:**\n\n**घरेलू देखभाल:**\n1. हर 6 घंटे में पैरासिटामोल (500mg) लें\n2. पर्याप्त पानी पिएं — ORS या साफ शोरबा\n3. ठंडे, हवादार कमरे में आराम करें\n\n💊 **सिफारिश:** आराम करें और तरल पदार्थ लें। 24-48 घंटे तक निगरानी करें।",
      es: "🌡️ **Evaluación de fiebre:**\n\n💊 **Recomendación:** Descanse y tome líquidos. Monitoree durante 24–48 horas.",
    },
  },
  {
    keywords: ["headache", "head pain", "migraine", "head hurts"],
    severity: "low",
    response: {
      en: "🧠 **Headache Assessment:**\n\n**Home care steps:**\n1. Take ibuprofen (400mg) or paracetamol (500mg)\n2. Rest in a dark, quiet room\n3. Stay hydrated — dehydration is a common trigger\n4. Apply a cold compress to your forehead\n5. Avoid screens for at least 30 minutes\n\n**Visit a doctor if:**\n- Headache is sudden and extremely severe ('thunderclap')\n- Accompanied by fever, stiff neck, or vision changes\n- Persists for more than 72 hours\n\n💊 **Recommendation:** Rest and take fluids. Likely tension headache — should resolve within hours.",
      hi: "🧠 **सिरदर्द मूल्यांकन:**\n\n**घरेलू देखभाल:**\n1. इबुप्रोफेन (400mg) या पैरासिटामोल लें\n2. अंधेरे, शांत कमरे में आराम करें\n3. पर्याप्त पानी पिएं\n\n💊 **सिफारिश:** आराम करें और तरल पदार्थ लें।",
      es: "🧠 **Evaluación de dolor de cabeza:**\n\n💊 **Recomendación:** Descanse y tome líquidos.",
    },
  },
  {
    keywords: ["cough", "cold", "sore throat", "runny nose", "sneezing", "congestion"],
    severity: "low",
    response: {
      en: "🤧 **Cold & Cough Assessment:**\n\n**Home care steps:**\n1. Gargle with warm salt water (3–4 times/day)\n2. Drink warm fluids — ginger tea, honey-lemon water\n3. Use steam inhalation for 10 minutes\n4. Take an antihistamine for runny nose if needed\n5. Get plenty of rest\n\n**Visit a doctor if:**\n- Cough produces blood or green/yellow mucus\n- Symptoms worsen after 7 days\n- You have difficulty breathing\n\n💊 **Recommendation:** Rest and take fluids. Typical cold resolves in 5–7 days.",
      hi: "🤧 **सर्दी-खांसी मूल्यांकन:**\n\n**घरेलू देखभाल:**\n1. गर्म नमक के पानी से गरारे करें\n2. गर्म तरल पदार्थ पिएं — अदरक की चाय\n3. भाप लें\n\n💊 **सिफारिश:** आराम करें और तरल पदार्थ लें।",
      es: "🤧 **Evaluación de resfriado y tos:**\n\n💊 **Recomendación:** Descanse y tome líquidos.",
    },
  },
  {
    keywords: ["stomach", "vomit", "nausea", "diarrhea", "abdomen", "belly", "cramp"],
    severity: "moderate",
    response: {
      en: "🤢 **Gastrointestinal Assessment:**\n\n**Home care steps:**\n1. Sip ORS (Oral Rehydration Solution) frequently\n2. Follow the BRAT diet — Bananas, Rice, Applesauce, Toast\n3. Avoid dairy, spicy, and fatty foods for 24 hours\n4. Take an anti-emetic if vomiting is severe\n\n**Visit a doctor if:**\n- Blood in vomit or stool\n- Severe abdominal pain that doesn't subside\n- Signs of dehydration (dark urine, dizziness)\n- Symptoms persist beyond 48 hours\n\n💊 **Recommendation:** Rest, hydrate with ORS, and follow a bland diet. Monitor for 24 hours.",
      hi: "🤢 **पेट संबंधी मूल्यांकन:**\n\n💊 **सिफारिश:** आराम करें, ORS से हाइड्रेट करें, और हल्का आहार लें।",
      es: "🤢 **Evaluación gastrointestinal:**\n\n💊 **Recomendación:** Descanse, hidrátese con SRO y siga una dieta blanda.",
    },
  },
  {
    keywords: ["injury", "cut", "wound", "bleeding", "broken", "fracture", "sprain", "fall"],
    severity: "high",
    response: {
      en: "🩹 **Injury Assessment:**\n\n**Immediate steps:**\n1. Apply firm pressure to any bleeding wound with a clean cloth\n2. Elevate the injured limb above heart level\n3. Apply ice wrapped in a towel for swelling (20 min on, 20 min off)\n4. Do NOT move the limb if you suspect a fracture\n\n**Visit a hospital if:**\n- Bleeding doesn't stop after 10 minutes of pressure\n- Visible bone or deep wound\n- Unable to move the injured area\n- Numbness or tingling below the injury\n\n🏥 **Recommendation:** Visit nearest hospital immediately for proper examination and possible imaging.",
      hi: "🩹 **चोट मूल्यांकन:**\n\n🏥 **सिफारिश:** उचित जांच के लिए तुरंत निकटतम अस्पताल जाएं।",
      es: "🩹 **Evaluación de lesión:**\n\n🏥 **Recomendación:** Visite el hospital más cercano inmediatamente.",
    },
  },
  {
    keywords: ["anxiety", "stress", "panic", "depressed", "sad", "mental", "sleep", "insomnia"],
    severity: "moderate",
    response: {
      en: "🧘 **Mental Health Assessment:**\n\nYour mental health matters just as much as your physical health.\n\n**Immediate coping steps:**\n1. Try box breathing: Inhale 4s → Hold 4s → Exhale 4s → Hold 4s\n2. Ground yourself: Name 5 things you see, 4 you feel, 3 you hear\n3. Step away from screens and take a 10-minute walk\n4. Talk to someone you trust about how you're feeling\n\n**Professional support:**\n- NIMHANS Helpline: 080-46110007\n- iCall: 9152987821\n- Vandrevala Foundation: 1860-2662-345\n\n💚 **Recommendation:** Practice the breathing exercises and consider scheduling a teleconsultation with a counselor.",
      hi: "🧘 **मानसिक स्वास्थ्य मूल्यांकन:**\n\n💚 **सिफारिश:** श्वास व्यायाम का अभ्यास करें और एक परामर्शदाता के साथ टेलीकंसल्टेशन पर विचार करें।",
      es: "🧘 **Evaluación de salud mental:**\n\n💚 **Recomendación:** Practique ejercicios de respiración y considere una teleconsulta con un consejero.",
    },
  },
];

/* ────────────────────────────────────────────────────────────
   Mock Triage Workflow
   ──────────────────────────────────────────────────────────── */
function triageWorkflow(userInput, langCode) {
  const input = userInput.toLowerCase();

  for (const entry of SYMPTOM_DB) {
    const matched = entry.keywords.some((kw) => input.includes(kw));
    if (matched) {
      const text = entry.response[langCode] || entry.response["en"];
      return { text, severity: entry.severity, matchedKeywords: entry.keywords.filter((kw) => input.includes(kw)) };
    }
  }

  const fallbacks = {
    en: "I didn't detect a specific symptom in your message. Could you describe your symptoms in more detail? For example:\n- 'I have a fever and chills'\n- 'I am experiencing chest pain'\n- 'I have a bad headache'\n\nThe more detail you provide, the better I can help you.",
    hi: "मुझे आपके संदेश में कोई विशिष्ट लक्षण नहीं मिला। क्या आप अपने लक्षणों का विस्तार से वर्णन कर सकते हैं?",
    es: "No detecté un síntoma específico. ¿Podría describir sus síntomas con más detalle?",
    fr: "Je n'ai pas détecté de symptôme spécifique. Pourriez-vous décrire vos symptômes plus en détail ?",
  };

  return { text: fallbacks[langCode] || fallbacks["en"], severity: "info", matchedKeywords: [] };
}

/* ────────────────────────────────────────────────────────────
   Save triage session to MongoDB via API
   ──────────────────────────────────────────────────────────── */
async function saveTriageSession(session) {
  try {
    const patient = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
    if (!patient?.id) return;

    await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.id,
        title: `AI Triage — ${session.symptoms.length > 0 ? session.symptoms.join(", ") : "General"}`,
        severity: session.severity,
        symptoms: session.symptoms,
        transcript: session.transcript,
        recommendation: session.recommendation,
        lang: session.lang,
      }),
    });
  } catch (e) {
    console.error("Failed to save triage session:", e);
  }
}

/* ────────────────────────────────────────────────────────────
   Severity badge component
   ──────────────────────────────────────────────────────────── */
function SeverityBadge({ severity }) {
  const config = {
    critical: { label: "Critical", bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
    high: { label: "High", bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-400" },
    moderate: { label: "Moderate", bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
    low: { label: "Low", bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400" },
    info: { label: "Info", bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" },
  };
  const c = config[severity] || config.info;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Main TriageChat component
   ──────────────────────────────────────────────────────────── */
export default function TriageChat() {
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const l = LANGUAGES.find((lg) => lg.code === lang) || LANGUAGES[0];
    setMessages([
      {
        role: "assistant",
        text: `${l.greeting}\n\nDescribe your symptoms and I'll help assess your situation and recommend next steps.`,
        severity: "info",
        time: new Date(),
      },
    ]);
  }, [lang]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = triageWorkflow(trimmed, lang);
      const botMsg = {
        role: "assistant",
        text: result.text,
        severity: result.severity,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // Save to MongoDB if severity is not just info
      if (result.severity !== "info") {
        saveTriageSession({
          symptoms: result.matchedKeywords,
          severity: result.severity,
          transcript: [
            { role: "user", text: trimmed },
            { role: "assistant", text: result.text },
          ],
          recommendation: result.text.split("**Recommendation:**")[1]?.trim().split("\n")[0] || result.text.slice(0, 120),
          lang,
        });
      }
    }, 1200 + Math.random() * 800);
  }, [input, lang]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)] w-full max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="glass rounded-t-2xl px-5 py-4 flex items-center justify-between border-b-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-[#0a0f1a] text-lg">🤖</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Health Triage</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-text-muted">Online</span>
            </div>
          </div>
        </div>

        {/* Language dropdown */}
        <div className="relative">
          <button
            id="lang-selector"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border hover:border-border-hover transition-all text-sm"
          >
            <span>🌐</span>
            <span className="text-text-secondary">{currentLang.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-text-muted transition-transform ${langOpen ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 glass rounded-xl py-1 z-50 animate-fade-in">
              {LANGUAGES.map((l) => (
                <button key={l.code} id={`lang-${l.code}`}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover ${
                    lang === l.code ? "text-primary font-medium" : "text-text-secondary"
                  }`}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 glass border-t-0 border-b-0 rounded-none bg-[rgba(0,0,0,0.15)]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-primary/15 border border-primary/20 text-foreground"
                : "bg-surface border border-border text-foreground"
            }`}>
              {msg.role === "assistant" && msg.severity && msg.severity !== "info" && (
                <div className="mb-2"><SeverityBadge severity={msg.severity} /></div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
              <p className={`text-xs mt-2 ${msg.role === "user" ? "text-primary/50" : "text-text-muted"}`}>
                {formatTime(msg.time)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted mr-1">Analyzing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="glass rounded-b-2xl px-4 py-3 border-t-0">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === "hi" ? "अपने लक्षण यहाँ बताएं..."
                : lang === "es" ? "Describe sus síntomas aquí..."
                : "Describe your symptoms here..."
            }
            rows={1}
            className="flex-1 input-field resize-none min-h-[44px] max-h-[120px] py-3"
            style={{ fieldSizing: "content" }}
          />
          <button
            id="chat-send"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="btn-primary px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2 text-center">
          ⚕️ This is an AI-assisted triage tool — not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
