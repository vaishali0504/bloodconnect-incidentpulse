import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Volume2, ShieldAlert, Heart, User, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  engine?: string;
  timestamp: string;
}

interface PulseAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userBloodGroup?: string;
  userRole?: string;
}

export const PulseAIAssistant: React.FC<PulseAIAssistantProps> = ({
  isOpen,
  onClose,
  userBloodGroup,
  userRole,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am **PulseAI**, your clinical coordinator assistant on **BloodConnect** powered by Gemini AI.\n\nI can verify blood compatibility, check donor health eligibility, guide you through emergency protocols, or explain donation recovery. How can I assist you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            userBloodGroup,
            userRole,
          },
        }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'I am currently reviewing network telemetry. Please try again in a moment.',
        engine: data.engine || 'gemini-2.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'Network communication interrupted. Blood compatibility and emergency requests remain accessible in offline mode.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown stars/hashes before speaking
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'Who can O- Negative donate to?',
    'What are the eligibility requirements to donate blood?',
    'How should I prepare the night before donating?',
    'What is the difference between Whole Blood and Platelet donation?',
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[440px] max-w-[calc(100vw-32px)] bg-white rounded-3xl clay-card border border-orange-200 shadow-2xl flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-orange-600 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm">
              <span>PulseAI Clinical Assistant</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Gemini
              </span>
            </div>
            <div className="text-[11px] text-orange-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> Live Triage & Decision Support
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFBF8]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'clay-btn-orange text-white rounded-tr-none'
                  : 'bg-white border border-orange-100 shadow-sm text-neutral-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              <div className="mt-1.5 pt-1 border-t border-black/5 flex items-center justify-between text-[10px] opacity-75">
                <span>{m.timestamp}</span>
                {m.sender === 'assistant' && (
                  <button
                    onClick={() => handleSpeak(m.text)}
                    className="p-1 hover:text-orange-600 transition ml-2"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-orange-100 shadow-sm text-xs text-neutral-500 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
            <span>PulseAI is consulting clinical guidelines...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-3 py-2 bg-orange-50/70 border-t border-orange-100/80 overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="shrink-0 px-2.5 py-1 bg-white hover:bg-orange-100/60 border border-orange-200/50 rounded-full text-[11px] font-semibold text-neutral-700 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3 bg-white border-t border-orange-100 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask about blood compatibility, donor rules..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="clay-btn-orange w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-3 py-1.5 bg-neutral-100 text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1">
        <ShieldAlert className="w-3 h-3 text-neutral-400" />
        <span>Decision support assistant. In immediate life-threats, dial 911 or alert emergency surgery staff.</span>
      </div>
    </div>
  );
};
