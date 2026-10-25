import React, { useState } from 'react';
import { IncidentState } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  FileText, 
  Volume2, 
  Code2, 
  Share2, 
  TrendingUp, 
  Sparkles,
  Search,
  ExternalLink,
  Zap
} from 'lucide-react';

interface BlameVerdictCardProps {
  incident: IncidentState;
  onOpenCodeCorrection: () => void;
  onOpenBriefModal: () => void;
  onPlayTTS: () => void;
  isPlayingAudio: boolean;
}

export const BlameVerdictCard: React.FC<BlameVerdictCardProps> = ({
  incident,
  onOpenCodeCorrection,
  onOpenBriefModal,
  onPlayTTS,
  isPlayingAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'domino' | 'advice'>('evidence');

  const isVendorFault = incident.verdict === 'VENDOR_CLOUD' || incident.verdict === 'THIRD_PARTY_DEPRECATION';

  return (
    <div className="clay-card p-6 md:p-8 space-y-6">
      {/* Top Header: Badge & Quick Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDF0E6] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B8E23] to-[#556B2F] text-white flex items-center justify-center shadow-md">
            {isVendorFault ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">IncidentPulse AI Verdict</span>
              <span className="neu-badge text-[11px] px-2.5 py-0.5 text-[#3B4D14]">
                Started {incident.startedAt}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F271B] tracking-tight">
              {incident.headline}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio TTS button */}
          <button
            onClick={onPlayTTS}
            className={`clay-btn px-4 py-2 text-xs gap-2 ${
              isPlayingAudio ? 'bg-[#556B2F] text-white' : 'text-[#3B4D14]'
            }`}
            title="Listen to Gemini 3.8 TTS Incident Debrief"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span>{isPlayingAudio ? 'Playing Brief...' : 'Voice Debrief'}</span>
          </button>

          {/* Incident Brief Modal Trigger */}
          <button
            onClick={onOpenBriefModal}
            className="clay-btn-olive px-4 py-2 text-xs gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Auto Incident Brief</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Confidence Gauge + Top Finding & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 86% Confidence Score Arc Gauge (Slide 3 & 8) */}
        <div className="lg:col-span-4 neu-inset p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#556B2F] mb-1">
            Confidence Score
          </span>

          {/* Semicircular Gauge SVG */}
          <div className="relative w-44 h-28 flex items-center justify-center mt-1">
            <svg className="w-44 h-28" viewBox="0 0 160 90">
              {/* Background Arc */}
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#D6DEC9"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Value Arc */}
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="url(#oliveGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="204"
                strokeDashoffset={204 - (204 * incident.confidenceScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="oliveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#87A93A" />
                  <stop offset="100%" stopColor="#556B2F" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Text in Center */}
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-3xl font-extrabold text-[#1F271B] font-mono tracking-tight">
                {incident.confidenceScore}%
              </span>
              <span className="text-[11px] font-bold text-[#556B2F]">
                {incident.confidenceScore >= 80 ? 'High Confidence' : 'Moderate'}
              </span>
            </div>
          </div>

          <div className="w-full mt-3 pt-3 border-t border-[#DDE5D1] flex justify-between text-xs text-[#4A5D29]">
            <span>0</span>
            <span className="font-semibold">{incident.blameEntity}</span>
            <span>100</span>
          </div>

          <div className="mt-2 text-[11px] text-[#556B2F] bg-white/80 px-3 py-1 rounded-full border border-[#556B2F]/20 font-medium">
            Verdict: {isVendorFault ? 'Upstream Third-Party Cloud' : 'Internal App Code'}
          </div>
        </div>

        {/* Right: Top Finding, Root Cause & Evidence Snapshot (Slide 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
                Top Diagnostic Finding
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF1E3] text-[#3B4D14] border border-[#556B2F]/20">
                Strong Evidence Attached
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1F271B]">
              {incident.topFinding}
            </h3>
            <p className="text-sm text-[#4A5D29] mt-2 leading-relaxed">
              {incident.rootCause}
            </p>
          </div>

          {/* Evidence Snapshot (4 Pill Columns from Slide 8) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white p-3 rounded-xl border border-[#EDF0E6] shadow-xs">
              <div className="text-[11px] text-[#6B8E23] font-medium">Latency spike</div>
              <div className="text-sm font-bold text-[#1F271B] flex items-center justify-between mt-0.5">
                <span>{incident.evidenceSnapshot.latencySpike}</span>
                <span className={`w-2 h-2 rounded-full ${incident.evidenceSnapshot.latencySpike === 'High' ? 'bg-[#DC2626]' : 'bg-[#6B8E23]'}`} />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#EDF0E6] shadow-xs">
              <div className="text-[11px] text-[#6B8E23] font-medium">Error rate</div>
              <div className="text-sm font-bold text-[#1F271B] flex items-center justify-between mt-0.5">
                <span>{incident.evidenceSnapshot.errorRate}</span>
                <span className={`w-2 h-2 rounded-full ${incident.evidenceSnapshot.errorRate === 'High' ? 'bg-[#DC2626]' : 'bg-[#6B8E23]'}`} />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#EDF0E6] shadow-xs">
              <div className="text-[11px] text-[#6B8E23] font-medium">Traffic surge</div>
              <div className="text-sm font-bold text-[#1F271B] flex items-center justify-between mt-0.5">
                <span>{incident.evidenceSnapshot.trafficSurge}</span>
                <span className={`w-2 h-2 rounded-full ${incident.evidenceSnapshot.trafficSurge === 'High' ? 'bg-[#D97706]' : 'bg-[#6B8E23]'}`} />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#EDF0E6] shadow-xs">
              <div className="text-[11px] text-[#6B8E23] font-medium">Deploy changes</div>
              <div className="text-sm font-bold text-[#1F271B] flex items-center justify-between mt-0.5">
                <span>{incident.evidenceSnapshot.deployChanges}</span>
                <span className={`w-2 h-2 rounded-full ${incident.evidenceSnapshot.deployChanges === 'High' ? 'bg-[#DC2626]' : 'bg-[#6B8E23]'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Tabs: Evidence Proofs | Domino Chain | Circuit Breaker Advice */}
      <div className="pt-2">
        <div className="flex items-center gap-2 border-b border-[#EDF0E6] pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'evidence' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29] hover:bg-[#F4F6F0]'
            }`}
          >
            Verified Evidence List ({incident.evidenceList.length})
          </button>
          <button
            onClick={() => setActiveTab('domino')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'domino' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29] hover:bg-[#F4F6F0]'
            }`}
          >
            Domino Effect Chain (Slide 2 & 8)
          </button>
          <button
            onClick={() => setActiveTab('advice')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'advice' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29] hover:bg-[#F4F6F0]'
            }`}
          >
            Immediate Circuit Breaker Advice
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {incident.evidenceList.map((item, idx) => (
                <div key={idx} className="neu-inset p-3 rounded-xl text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#556B2F] shrink-0 mt-0.5" />
                  <span className="text-[#2F3E1A] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'domino' && (
            <div className="neu-inset p-4 rounded-2xl space-y-3">
              <div className="text-xs font-semibold text-[#556B2F] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>How one slow service crashed the whole app (Domino Effect):</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 text-xs">
                {incident.dominoPath.map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="w-full md:w-auto flex-1 bg-white p-3 rounded-xl shadow-xs border border-[#EDF0E6] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#556B2F] text-white flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="text-[#1F271B] font-medium">{step}</span>
                    </div>
                    {i < incident.dominoPath.length - 1 && (
                      <ArrowRight className="hidden md:block w-4 h-4 text-[#87A93A] shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'advice' && (
            <div className="bg-[#FAFBF7] border border-[#556B2F]/20 p-4 rounded-2xl flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#556B2F] mb-1">
                  Automated Mitigation Protocol
                </h4>
                <p className="text-sm text-[#2F3E1A] leading-relaxed">
                  {incident.circuitBreakerAdvice}
                </p>
              </div>
              <button
                onClick={onOpenCodeCorrection}
                className="clay-btn-olive px-4 py-2 text-xs shrink-0 gap-1.5"
              >
                <Code2 className="w-4 h-4" />
                <span>Apply Code Fix</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Conversion Banner: Before vs After (Slide 3) */}
      <div className="bg-gradient-to-r from-[#F0F4E8] to-[#FFFFFF] p-4 rounded-2xl border border-[#DDE5D1] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8A967A] uppercase">Before:</span>
            <span className="text-[#556B2F] font-semibold line-through">Hours of manual debugging</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#556B2F]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#556B2F] uppercase">After:</span>
            <span className="text-[#3B4D14] font-extrabold bg-[#E2EBD5] px-2.5 py-1 rounded-lg">
              Seconds to verdict & code correction
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCodeCorrection}
          className="clay-btn px-4 py-2 text-xs font-bold gap-2 text-[#556B2F] hover:text-[#3B4D14]"
        >
          <Code2 className="w-4 h-4" />
          <span>Launch Code Correction Studio</span>
        </button>
      </div>
    </div>
  );
};
