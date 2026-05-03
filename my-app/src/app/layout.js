import { Inter } from "next/font/google";
import "./globals.css";

const interFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
 title:"AmritCare AI — Smart Healthcare Platform",
 description:"AI-powered healthcare platform — find doctors, book appointments, and get home remedy recommendations.",
};

import MedicineAlarmService from"@/components/reminders/MedicineAlarmService";

export default function RootLayout({ children }) {
 return (
 <html
 lang="en"
 className={`${interFont.variable} h-full antialiased text-gray-800`}
 >
 <body className="min-h-full flex flex-col gradient-bg text-[15px] leading-relaxed">
 <MedicineAlarmService />
 {children}
 </body>
 </html>
 );
}
