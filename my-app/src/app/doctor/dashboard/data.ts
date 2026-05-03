export interface PatientCase {
 id: string;
 name: string;
 age: number;
 gender: string;
 severity:"critical" |"high" |"medium" |"low";
 triageScore: number;
 primarySymptoms: string[];
 originalLanguage: string;
 originalSymptoms: string[];
 translatedSymptoms: string[];
 aiSummary: string;
 timestamp: string;
 vitalSigns: { label: string; value: string; status:"normal" |"warning" |"danger" };
 location: string;
}

export const MOCK_CASES: PatientCase[] = [
 {
 id:"PT-2026-0847",
 name:"Ananya Sharma",
 age: 34,
 gender:"Female",
 severity:"critical",
 triageScore: 92,
 primarySymptoms: ["Severe chest pain","Shortness of breath","Dizziness"],
 originalLanguage:"Hindi",
 originalSymptoms: ["सीने में तेज दर्द हो रहा है","सांस लेने में बहुत तकलीफ","बहुत चक्कर आ रहे हैं",
 ],
 translatedSymptoms: ["Experiencing severe chest pain","Extreme difficulty breathing","Feeling very dizzy",
 ],
 aiSummary:"AI triage indicates potential acute coronary syndrome. Immediate cardiology consult recommended. ECG & troponin prioritised.",
 timestamp:"2 min ago",
 vitalSigns: { label:"HR", value:"118 bpm", status:"danger" },
 location:"Emergency — Bed 3",
 },
 {
 id:"PT-2026-0846",
 name:"Mohammed Al-Rashid",
 age: 58,
 gender:"Male",
 severity:"high",
 triageScore: 78,
 primarySymptoms: ["Persistent high fever","Abdominal pain","Nausea"],
 originalLanguage:"Arabic",
 originalSymptoms: ["حرارتي مرتفعة منذ ثلاثة أيام","ألم شديد في البطن","أشعر بالغثيان المستمر",
 ],
 translatedSymptoms: ["Fever persisting for three days","Severe abdominal pain","Constant nausea",
 ],
 aiSummary:"Suspected acute appendicitis or cholecystitis. Recommend urgent abdominal ultrasound and CBC with differential.",
 timestamp:"8 min ago",
 vitalSigns: { label:"Temp", value:"39.4°C", status:"danger" },
 location:"Triage Bay — 5A",
 },
 {
 id:"PT-2026-0845",
 name:"Liu Wei",
 age: 42,
 gender:"Male",
 severity:"medium",
 triageScore: 55,
 primarySymptoms: ["Recurring headaches","Blurred vision","Neck stiffness"],
 originalLanguage:"Mandarin",
 originalSymptoms: ["反复头痛已经两周了","视力变模糊","脖子很僵硬"],
 translatedSymptoms: ["Recurring headaches for two weeks","Vision becoming blurred","Neck is very stiff",
 ],
 aiSummary:"Pattern suggests tension-type headache with possible cervicogenic component. Rule out elevated ICP — recommend fundoscopy and BP monitoring.",
 timestamp:"22 min ago",
 vitalSigns: { label:"BP", value:"148/92", status:"warning" },
 location:"Outpatient — Room 12",
 },
 {
 id:"PT-2026-0844",
 name:"Priya Patel",
 age: 27,
 gender:"Female",
 severity:"low",
 triageScore: 28,
 primarySymptoms: ["Mild cough","Runny nose","Low-grade fever"],
 originalLanguage:"Gujarati",
 originalSymptoms: ["હળવી ઉધરસ છે","નાક વહે છે","થોડો તાવ છે"],
 translatedSymptoms: ["Having a mild cough","Runny nose","Slight fever"],
 aiSummary:"Likely viral upper respiratory infection. Symptomatic treatment recommended. No urgent intervention needed.",
 timestamp:"45 min ago",
 vitalSigns: { label:"SpO2", value:"98%", status:"normal" },
 location:"Walk-in Clinic — Queue B",
 },
 {
 id:"PT-2026-0843",
 name:"Fatima Zahra",
 age: 65,
 gender:"Female",
 severity:"high",
 triageScore: 82,
 primarySymptoms: ["Sudden weakness in left arm","Slurred speech","Confusion"],
 originalLanguage:"French",
 originalSymptoms: ["Mon bras gauche est devenu faible soudainement","Je n'arrive plus à parler correctement","Je suis très confuse",
 ],
 translatedSymptoms: ["My left arm suddenly became weak","I can no longer speak properly","I am very confused",
 ],
 aiSummary:"FAST-positive presentation. Suspected cerebrovascular accident. Code stroke activation recommended. CT-head STAT.",
 timestamp:"5 min ago",
 vitalSigns: { label:"BP", value:"182/96", status:"danger" },
 location:"Emergency — Bed 1",
 },
 {
 id:"PT-2026-0842",
 name:"Kenji Tanaka",
 age: 19,
 gender:"Male",
 severity:"medium",
 triageScore: 47,
 primarySymptoms: ["Ankle swelling","Pain on weight bearing","Bruising"],
 originalLanguage:"Japanese",
 originalSymptoms: ["足首がすごく腫れています","体重をかけると痛いです","あざができています"],
 translatedSymptoms: ["Ankle is very swollen","Pain when bearing weight","Bruising present"],
 aiSummary:"Likely lateral ankle sprain, possible fracture. X-ray recommended. RICE protocol initiated.",
 timestamp:"1 hr ago",
 vitalSigns: { label:"Pain", value:"6/10", status:"warning" },
 location:"Ortho Clinic — Bay 2",
 },
];

export const severityConfig = {
 critical: {
 bg:"bg-red-500/10",
 border:"border-red-500/30",
 text:"text-red-400",
 badge:"bg-red-500/20 text-red-300 border border-red-500/30",
 glow:"shadow-red-500/20",
 dot:"bg-red-500",
 label:"CRITICAL",
 },
 high: {
 bg:"bg-orange-500/10",
 border:"border-orange-500/30",
 text:"text-orange-400",
 badge:"bg-orange-500/20 text-orange-300 border border-orange-500/30",
 glow:"shadow-orange-500/20",
 dot:"bg-orange-500",
 label:"HIGH",
 },
 medium: {
 bg:"bg-yellow-500/10",
 border:"border-yellow-500/30",
 text:"text-yellow-400",
 badge:"bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
 glow:"shadow-yellow-500/20",
 dot:"bg-yellow-500",
 label:"MEDIUM",
 },
 low: {
 bg:"bg-emerald-500/10",
 border:"border-emerald-500/30",
 text:"text-emerald-400",
 badge:"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
 glow:"shadow-emerald-500",
 dot:"bg-emerald-500",
 label:"LOW",
 },
};
