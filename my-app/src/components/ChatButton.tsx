"use client";

import { useState } from "react";
import ChatBot from "./ChatBot";

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHasNotification(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-49 flex flex-col items-end gap-3">
        {/* Tooltip */}
        {isHovered && !isOpen && (
          <div className="bg-[#0F1C2E] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 uppercase tracking-wider mb-1">
            Chat with MediAI
          </div>
        )}

        {/* Button */}
        <button
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative
          ${isOpen ? "bg-red-500 rotate-90 scale-90" : "bg-[#0F1C2E] hover:scale-110 active:scale-95"}`}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-2xl drop-shadow-md">🤖</span>
          )}

          {/* Notification Dot */}
          {hasNotification && !isOpen && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0F1C2E] flex items-center justify-center">
              <div className="w-full h-full bg-red-500 rounded-full animate-ping absolute" />
            </div>
          )}
        </button>
      </div>

      <ChatBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
