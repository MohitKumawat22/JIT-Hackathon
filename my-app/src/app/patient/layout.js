import ChatbotWidget from"@/components/patient/ChatbotWidget";

export default function PatientLayout({ children }) {
 return (
 <>
 {children}
 <ChatbotWidget />
 </>
 );
}
