import React from 'react';
import { 
  Activity, 
  Code2, 
  Radar, 
  Layers, 
  Presentation, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles,
  Sliders,
  Award
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'command' | 'code-studio' | 'radar' | 'simulator' | 'deck' | 'mentor-defense';
  setActiveTab: (tab: 'command' | 'code-studio' | 'radar' | 'simulator' | 'deck' | 'mentor-defense') => void;
  isPlayingAudio: boolean;
  onPlayTTS: () => void;
  confidenceScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPlayingAudio,
  onPlayTTS,
  confidenceScore,
}) => {
  return (
    <header className="relative w-full mb-6 select-none">
      <div className="clay-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6B8E23] to-[#3B4D14] text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-[#1F271B] tracking-tight">
                IncidentPulse AI
              </h1>
              <span className="hidden sm:inline-block neu-badge text-[10px] px-2 py-0.5 text-[#556B2F]">
                HackIIITD &bull; TinyFish
              </span>
            </div>
            <p className="text-xs font-semibold text-[#556B2F]">
              Is it your code or their cloud? Answered in seconds.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5 bg-[#EDF0E6] p-1 rounded-2xl text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('command')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'command'
                ? 'bg-[#556B2F] text-white shadow-xs'
                : 'text-[#3B4D14] hover:bg-white/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => setActiveTab('code-studio')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'code-studio'
                ? 'bg-[#556B2F] text-white shadow-xs'
                : 'text-[#3B4D14] hover:bg-white/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Correction Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-[#556B2F] text-white shadow-xs'
                : 'text-[#3B4D14] hover:bg-white/60'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>TinyFish Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-[#556B2F] text-white shadow-xs'
                : 'text-[#3B4D14] hover:bg-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Demo Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('deck')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deck'
                ? 'bg-[#556B2F] text-white shadow-xs'
                : 'text-[#3B4D14] hover:bg-white/60'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Project Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('mentor-defense')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mentor-defense'
                ? 'bg-gradient-to-r from-[#556B2F] to-[#3B4D14] text-white shadow-xs ring-2 ring-[#87A93A]'
                : 'bg-white text-[#556B2F] border border-[#556B2F]/20 hover:bg-[#FAFBF7]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#87A93A]" />
            <span>Mentor Round 2 War Room</span>
          </button>
        </nav>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2.5">
          {/* Audio TTS debrief button */}
          <button
            onClick={onPlayTTS}
            className={`clay-btn px-3 py-2 text-xs font-semibold gap-1.5 ${
              isPlayingAudio ? 'bg-[#556B2F] text-white' : 'text-[#3B4D14]'
            }`}
            title="Listen to Incident Brief with Gemini 3.8 TTS"
          >
            {isPlayingAudio ? (
              <VolumeX className="w-3.5 h-3.5 text-white" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#556B2F]" />
            )}
            <span className="hidden md:inline">
              {isPlayingAudio ? 'Stop Speech' : 'Audio Debrief'}
            </span>
          </button>

          {/* Real-time confidence badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#556B2F]/20 shadow-xs text-xs">
            <span className="w-2 h-2 rounded-full bg-[#556B2F]" />
            <span className="text-[#3B4D14] font-bold font-mono">{confidenceScore}%</span>
            <span className="text-[#6B8E23] text-[11px]">Verdict</span>
          </div>
        </div>
      </div>
    </header>
  );
};
