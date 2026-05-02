import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/patient/ChatbotWidget";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "AmritCare AI — Smart Healthcare Platform",
  description:
    "AI-powered healthcare platform — find doctors, book appointments, and get home remedy recommendations.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col gradient-bg">
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
