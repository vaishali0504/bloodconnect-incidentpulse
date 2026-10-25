import React, { useState } from 'react';
import { 
  Radar, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Globe, 
  Terminal, 
  Search, 
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import { AgentSignal, Vendor } from '../types';

interface TinyFishRadarProps {
  vendors: Vendor[];
  signals: AgentSignal[];
  onTriggerSweep: (vendorId: string) => Promise<void>;
  isSweeping: boolean;
}

export const TinyFishRadar: React.FC<TinyFishRadarProps> = ({
  vendors,
  signals,
  onTriggerSweep,
  isSweeping,
}) => {
  const [selectedVendorForSweep, setSelectedVendorForSweep] = useState<string>('auth0');
  const [searchQuery, setSearchQuery] = useState<string>('Auth0 US-East API latency Downdetector reports');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [inspectSignal, setInspectSignal] = useState<AgentSignal | null>(signals[0] || null);

  const handleRunSearchGrounding = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResult(data);
      }
    } catch (err) {
      console.error('Search grounding failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Slide 6 Concept */}
      <div className="clay-card p-6 md:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B8E23]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
                TinyFish API Integration Layer (Slide 6)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1F271B] tracking-tight">
              Multi-Source Data Layer for Real-Time Incident Intelligence
            </h2>
            <p className="text-sm text-[#4A5D29]">
              Autonomous web agents scraping status pages, API documentation changelogs, developer forums, and social sentiment into normalized structured JSON.
            </p>
          </div>

          {/* Trigger On-Demand Sweep */}
          <div className="flex items-center gap-2 bg-[#EDF0E6] p-1.5 rounded-2xl border border-[#556B2F]/15">
            <select
              value={selectedVendorForSweep}
              onChange={(e) => setSelectedVendorForSweep(e.target.value)}
              className="bg-white text-xs font-bold px-3 py-2 rounded-xl text-[#3B4D14] border-0 focus:outline-none shadow-xs"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  Sweep {v.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onTriggerSweep(selectedVendorForSweep)}
              disabled={isSweeping}
              className="clay-btn-olive px-4 py-2 text-xs font-bold gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
              <span>{isSweeping ? 'Sweeping...' : 'Run Sweep'}</span>
            </button>
          </div>
        </div>

        {/* 3 Agent Pipeline Pillars from Slide 6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#EBF1E3] text-[#556B2F] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-[#1F271B]">Status Page Agents</div>
            <p className="text-xs text-[#4A5D29]">
              Stripe, AWS, Auth0, Cloudflare live service states polled continuously (every 5 min or on-demand).
            </p>
            <div className="text-[11px] font-semibold text-[#6B8E23]">Sweep Frequency: Every 5 min</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#EBF1E3] text-[#556B2F] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-[#1F271B]">Changelog & Deprecation Agents</div>
            <p className="text-xs text-[#4A5D29]">
              Detects unannounced API changes, SDK release notes, JWKS rotators, and flags impacted endpoints.
            </p>
            <div className="text-[11px] font-semibold text-[#6B8E23]">Sweep Frequency: Daily</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#EBF1E3] text-[#556B2F] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-[#1F271B]">Community Signal Agents</div>
            <p className="text-xs text-[#4A5D29]">
              Developer Forums, Reddit, X (Twitter), Downdetector sentiment for early unacknowledged outages.
            </p>
            <div className="text-[11px] font-semibold text-[#6B8E23]">Trigger: On Event Spike</div>
          </div>
        </div>
      </div>

      {/* Live Signals & Agent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Signals List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDF0E6] pb-3">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-[#556B2F]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F271B]">
                  Live Incoming Agent Signals ({signals.length})
                </h3>
              </div>
              <span className="neu-badge text-[11px] px-2.5 py-1 text-[#556B2F]">
                Normalized JSON Ready
              </span>
            </div>

            <div className="space-y-3">
              {signals.map((sig) => (
                <div
                  key={sig.id}
                  onClick={() => setInspectSignal(sig)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    inspectSignal?.id === sig.id
                      ? 'bg-[#FAFBF7] border-[#556B2F] shadow-sm'
                      : 'bg-white border-[#EDF0E6] hover:bg-[#F9FAF6]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EBF1E3] text-[#3B4D14]">
                          {sig.vendorName}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            sig.severity === 'critical'
                              ? 'bg-[#FEE2E2] text-[#991B1B]'
                              : sig.severity === 'warning'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#EBF1E3] text-[#556B2F]'
                          }`}
                        >
                          {sig.signalType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-[#6B8E23] font-mono">
                          {new Date(sig.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1F271B]">{sig.title}</h4>
                      <p className="text-xs text-[#4A5D29] line-clamp-2 leading-relaxed">
                        {sig.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#556B2F]">
                        {Math.round(sig.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Signal Inspector & Google Search Grounding */}
        <div className="lg:col-span-5 space-y-4">
          {/* Signal Detail & Raw Normalized JSON */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDF0E6] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#556B2F] flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                TinyFish Structured Signal JSON
              </span>
              {inspectSignal?.sourceUrl && (
                <a
                  href={inspectSignal.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#556B2F] hover:underline flex items-center gap-1 font-semibold"
                >
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="neu-inset-dark p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56">
              <pre className="text-[#A7C957] leading-relaxed whitespace-pre font-mono">
                {JSON.stringify(inspectSignal || signals[0], null, 2)}
              </pre>
            </div>
          </div>

          {/* Google Search Grounding for Live Outage Verification */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#556B2F]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F271B]">
                Live Search Grounding (Gemini 3.8 Flash)
              </span>
            </div>
            <p className="text-xs text-[#4A5D29]">
              Query live web data and developer social sentiment to double-verify third-party cloud degradation.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#EDF0E6] text-xs px-3 py-2 rounded-xl border border-[#556B2F]/20 text-[#1F271B] focus:outline-none font-medium"
                placeholder="Query vendor status or outage..."
              />
              <button
                onClick={handleRunSearchGrounding}
                disabled={isSearching}
                className="clay-btn-olive px-3.5 py-2 text-xs font-bold gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? 'Verifying...' : 'Search'}</span>
              </button>
            </div>

            {searchResult && (
              <div className="bg-[#FAFBF7] border border-[#556B2F]/20 p-3 rounded-xl text-xs space-y-2 mt-2">
                <div className="font-bold text-[#556B2F]">Live Grounded Web Report:</div>
                <p className="text-[#2F3E1A] leading-relaxed text-[11px]">
                  {searchResult.summary}
                </p>
                {searchResult.groundingMetadata?.groundingChunks && (
                  <div className="text-[10px] text-[#6B8E23] flex flex-wrap gap-2 pt-1 border-t border-[#EDF0E6]">
                    <span className="font-semibold">Citations:</span>
                    {searchResult.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                      <span key={i} className="underline cursor-pointer">
                        {chunk.web?.title || 'Vendor Status Source'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
