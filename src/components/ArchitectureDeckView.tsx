import React, { useState } from 'react';
import { 
  Layers, 
  DollarSign, 
  TrendingDown, 
  Clock, 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  ChevronRight, 
  Award,
  Sparkles,
  ArrowRight,
  Database,
  Terminal,
  Zap,
  Globe
} from 'lucide-react';
import { TEAM_MEMBERS, MATRIX_COMPARISON } from '../data/mockData';

export const ArchitectureDeckView: React.FC = () => {
  const [selectedSlide, setSelectedSlide] = useState<number>(1);
  const [downtimeMinutes, setDowntimeMinutes] = useState<number>(30);

  // Industry estimate from Slide 2: Gartner $5,600 / min
  const calculatedDowntimeCost = downtimeMinutes * 5600;

  return (
    <div className="space-y-6">
      {/* Slide Navigation Header */}
      <div className="clay-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#556B2F]" />
          <div>
            <h2 className="text-sm font-bold text-[#1F271B] uppercase tracking-wider">
              Project Deck & Architecture (HackIIITD 2026)
            </h2>
            <p className="text-[11px] text-[#556B2F]">
              Team Blaze Matrix &bull; Powered by TinyFish & Gemini API
            </p>
          </div>
        </div>

        {/* Slide Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {[
            { id: 1, label: '01 Overview' },
            { id: 2, label: '02 The Problem' },
            { id: 4, label: '04 Who Benefits' },
            { id: 5, label: '05 Architecture' },
            { id: 7, label: '07 Scalability' },
            { id: 9, label: '09 Matrix' },
            { id: 10, label: '10 Team' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSlide(s.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedSlide === s.id
                  ? 'bg-[#556B2F] text-white shadow-xs'
                  : 'bg-[#EDF0E6] text-[#3B4D14] hover:bg-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slide 1: Cover & Vision */}
      {selectedSlide === 1 && (
        <div className="clay-card p-8 md:p-12 text-center space-y-6 bg-gradient-to-b from-[#FAFBF7] to-[#FFFFFF]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF1E3] text-[#3B4D14] text-xs font-bold border border-[#556B2F]/20">
            <Sparkles className="w-4 h-4 text-[#556B2F]" />
            HackIIITD 2026 &bull; Powered by TinyFish
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F271B] tracking-tight">
            IncidentPulse AI
          </h1>

          <p className="text-xl md:text-2xl font-semibold text-[#556B2F] max-w-2xl mx-auto">
            Is it your code or their cloud? Answered in seconds.
          </p>

          <p className="text-sm text-[#4A5D29] max-w-xl mx-auto leading-relaxed">
            Eliminate wasted hours guessing third-party API breakages. Real-time blame verdict, changelog radar, and automated Gemini code correction.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#4A5D29]">
            <span className="neu-badge px-4 py-2">Team Blaze Matrix</span>
            <span className="neu-badge px-4 py-2">TinyFish Web Scraper Agents</span>
            <span className="neu-badge px-4 py-2">Gemini 3.8 Reasoning & Code Repair</span>
          </div>
        </div>
      )}

      {/* Slide 2: The Problem with modern apps & Downtime Cost Calculator */}
      {selectedSlide === 2 && (
        <div className="space-y-6">
          <div className="clay-card p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
                Slide 02 &bull; The Problem
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1F271B]">
                The Problem with Modern Distributed Apps
              </h2>
              <p className="text-sm text-[#4A5D29]">
                Modern web applications depend on 10+ third-party cloud services (Auth0, Stripe, AWS, Twilio, OpenAI, Cloudflare).
              </p>
            </div>

            {/* 4 Problem Pillars from Slide 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
                <div className="text-lg font-bold text-[#991B1B]">Domino Effect</div>
                <p className="text-xs text-[#4A5D29]">
                  One slow third-party service hangs, fills the worker connection pool, and crashes the whole app.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
                <div className="text-lg font-bold text-[#D97706]">Unannounced API Updates</div>
                <p className="text-xs text-[#4A5D29]">
                  Silent SDK breaking changes, header deprecations, or JWKS rotations break existing code unexpectedly.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
                <div className="text-lg font-bold text-[#556B2F]">Traffic Spikes</div>
                <p className="text-xs text-[#4A5D29]">
                  Sudden consumer traffic overwhelms third-party rate limits, returning 503 SlowDown and 429 Too Many Requests.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-2">
                <div className="text-lg font-bold text-[#1F271B]">Human & Deploy Errors</div>
                <p className="text-xs text-[#4A5D29]">
                  Internal commits introduce synchronous loops or missing error handlers, mimicking external downtime.
                </p>
              </div>
            </div>

            {/* Interactive Downtime Cost Calculator from Slide 2 (Gartner & ITIC stats) */}
            <div className="neu-inset p-6 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#556B2F]" />
                  <h3 className="text-sm font-bold text-[#1F271B] uppercase tracking-wider">
                    Downtime Costs More Than You Think (Industry Estimates)
                  </h3>
                </div>
                <div className="text-xs text-[#4A5D29]">
                  Gartner: <strong>$5,600 / min</strong> &bull; ITIC: <strong>&gt;$300K / hr</strong>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#3B4D14]">
                  <span>Estimate Downtime Duration:</span>
                  <span className="font-mono text-sm font-bold text-[#556B2F]">{downtimeMinutes} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={downtimeMinutes}
                  onChange={(e) => setDowntimeMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-[#556B2F] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl shadow-xs border border-[#EDF0E6] text-center">
                  <div className="text-xs text-[#6B8E23] font-medium">Estimated Financial Loss</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[#991B1B] font-mono mt-1">
                    ${calculatedDowntimeCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#718063] mt-0.5">Based on Gartner benchmark</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-xs border border-[#EDF0E6] text-center">
                  <div className="text-xs text-[#6B8E23] font-medium">Time to Verdict with IncidentPulse</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[#556B2F] font-mono mt-1">
                    ~10 Seconds
                  </div>
                  <div className="text-[11px] text-[#718063] mt-0.5">vs 3+ hours manual finger-pointing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 4: Who Benefits & Target Segments */}
      {selectedSlide === 4 && (
        <div className="clay-card p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
              Slide 04 &bull; Market Opportunity
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F271B]">
              Who Benefits from IncidentPulse AI?
            </h2>
            <p className="text-sm text-[#4A5D29]">
              Built for teams that feel downtime the most without massive dedicated SRE squads.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Segments */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
                Target User Segments
              </h3>

              {[
                { label: 'Startups without SRE teams', pct: 35, color: 'bg-[#556B2F]' },
                { label: 'Indie developers and agencies', pct: 25, color: 'bg-[#6B8E23]' },
                { label: 'Student and hackathon teams', pct: 20, color: 'bg-[#87A93A]' },
                { label: 'Small SaaS and e-commerce teams', pct: 20, color: 'bg-[#A7C957]' },
              ].map((seg) => (
                <div key={seg.label} className="bg-white p-3.5 rounded-xl border border-[#EDF0E6] space-y-1.5 shadow-xs">
                  <div className="flex justify-between text-xs font-semibold text-[#1F271B]">
                    <span>{seg.label}</span>
                    <span className="font-mono font-bold text-[#556B2F]">{seg.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#EDF0E6] overflow-hidden">
                    <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Top Pain Points */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                Top Pain Points Reported by Teams
              </h3>

              {[
                { label: 'Slow root-cause finding', pct: 78, color: 'bg-[#991B1B]' },
                { label: 'Vendor blind spots & unannounced updates', pct: 62, color: 'bg-[#D97706]' },
                { label: 'No dedicated 24/7 on-call team', pct: 45, color: 'bg-[#556B2F]' },
                { label: 'Excessive APM & observability tool cost', pct: 32, color: 'bg-[#6B8E23]' },
              ].map((pain) => (
                <div key={pain.label} className="bg-white p-3.5 rounded-xl border border-[#EDF0E6] space-y-1.5 shadow-xs">
                  <div className="flex justify-between text-xs font-semibold text-[#1F271B]">
                    <span>{pain.label}</span>
                    <span className="font-mono font-bold text-[#991B1B]">{pain.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#EDF0E6] overflow-hidden">
                    <div className={`h-full rounded-full ${pain.color}`} style={{ width: `${pain.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide 5: Technical Architecture */}
      {selectedSlide === 5 && (
        <div className="clay-card p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
              Slide 05 &bull; Technical Architecture
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F271B]">
              From Signal Collection to Actionable Incident Intelligence
            </h2>
          </div>

          {/* Architecture Pipeline Flowchart from Slide 5 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="neu-inset p-4 rounded-2xl space-y-2 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#556B2F] text-white flex items-center justify-center font-bold">
                1
              </div>
              <div className="text-sm font-bold text-[#1F271B]">TinyFish Web Agents</div>
              <p className="text-xs text-[#4A5D29]">
                Crawls status pages, changelogs, API docs, forums, and X/Reddit.
              </p>
            </div>

            <div className="neu-inset p-4 rounded-2xl space-y-2 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#6B8E23] text-white flex items-center justify-center font-bold">
                2
              </div>
              <div className="text-sm font-bold text-[#1F271B]">Signal Normalize</div>
              <p className="text-xs text-[#4A5D29]">
                Cleans and standardizes incoming multi-source signals into structured JSON.
              </p>
            </div>

            <div className="neu-inset p-4 rounded-2xl space-y-2 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#87A93A] text-white flex items-center justify-center font-bold">
                3
              </div>
              <div className="text-sm font-bold text-[#1F271B]">Correlation Engine</div>
              <p className="text-xs text-[#4A5D29]">
                Joins external signals with user App Logs + Latency ingest via webhook/SDK.
              </p>
            </div>

            <div className="neu-inset p-4 rounded-2xl space-y-2 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#3B4D14] text-white flex items-center justify-center font-bold">
                4
              </div>
              <div className="text-sm font-bold text-[#1F271B]">LLM Reasoning Layer</div>
              <p className="text-xs text-[#4A5D29]">
                Gemini 3.8 Flash understands context, pinpoints blame, and outputs code patches.
              </p>
            </div>
          </div>

          {/* Tech Stack Bar from Slide 5 */}
          <div className="bg-white p-5 rounded-2xl border border-[#EDF0E6] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
              Implemented Tech Stack
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#EDF0E6]">
                <div className="text-[#6B8E23] font-semibold text-[10px] uppercase">Frontend</div>
                <div className="font-bold text-[#1F271B] mt-0.5">React 19 & Tailwind CSS</div>
              </div>
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#EDF0E6]">
                <div className="text-[#6B8E23] font-semibold text-[10px] uppercase">3D Engine</div>
                <div className="font-bold text-[#1F271B] mt-0.5">Three.js PBR Studio</div>
              </div>
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#EDF0E6]">
                <div className="text-[#6B8E23] font-semibold text-[10px] uppercase">Backend</div>
                <div className="font-bold text-[#1F271B] mt-0.5">Node.js Express & TS</div>
              </div>
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#EDF0E6]">
                <div className="text-[#6B8E23] font-semibold text-[10px] uppercase">Agents Layer</div>
                <div className="font-bold text-[#1F271B] mt-0.5">TinyFish Scraper API</div>
              </div>
              <div className="bg-[#FAFBF7] p-3 rounded-xl border border-[#EDF0E6]">
                <div className="text-[#6B8E23] font-semibold text-[10px] uppercase">AI & Voice</div>
                <div className="font-bold text-[#1F271B] mt-0.5">Gemini 3.8 + TTS</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 7: Scalability & Use Case */}
      {selectedSlide === 7 && (
        <div className="clay-card p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
              Slide 07 &bull; Scalability & Use Case
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F271B]">
              From Incident to Verdict in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="neu-inset p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
                The Friday 2 AM Checkout Outage
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-[11px]">
                    2:00
                  </div>
                  <span className="font-semibold text-[#1F271B]">User checkout falls on Friday 2 AM</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-[11px]">
                    2:01
                  </div>
                  <span className="font-semibold text-[#1F271B]">Spike detected by Ingest Engine</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#556B2F] text-white flex items-center justify-center font-bold text-[11px]">
                    2:01
                  </div>
                  <span className="font-semibold text-[#1F271B]">TinyFish agents sweep and correlate status pages</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6B8E23] text-white flex items-center justify-center font-bold text-[11px]">
                    2:02
                  </div>
                  <span className="font-bold text-[#3B4D14]">Verdict: "Stripe degraded" in ~10 seconds vs 3 hours manual debugging</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EDF0E6] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
                Scales With Ease
              </h3>
              <p className="text-xs text-[#4A5D29]">
                Add any vendor in minutes via declarative JSON config file. Stateless, parallelized TinyFish agents handle 100+ third-party APIs simultaneously.
              </p>
              <div className="flex items-end gap-3 h-32 pt-4 px-2">
                <div className="flex-1 bg-[#DDE5D1] h-[25%] rounded-t-lg flex flex-col items-center justify-end pb-1 text-[10px] font-bold">
                  3
                </div>
                <div className="flex-1 bg-[#87A93A] h-[50%] rounded-t-lg flex flex-col items-center justify-end pb-1 text-[10px] font-bold text-white">
                  10+
                </div>
                <div className="flex-1 bg-[#6B8E23] h-[75%] rounded-t-lg flex flex-col items-center justify-end pb-1 text-[10px] font-bold text-white">
                  50+
                </div>
                <div className="flex-1 bg-[#556B2F] h-[100%] rounded-t-lg flex flex-col items-center justify-end pb-1 text-[10px] font-bold text-white">
                  100+
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[#556B2F] font-bold px-1">
                <span>MVP</span>
                <span>Seed</span>
                <span>Growth</span>
                <span>Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 9: Comparison Matrix */}
      {selectedSlide === 9 && (
        <div className="clay-card p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
              Slide 09 &bull; Competitive Edge
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1F271B]">
              How IncidentPulse AI Stands Out
            </h2>
            <p className="text-sm text-[#4A5D29]">
              Neither traditional status page aggregators nor internal APM tools can deliver an automated verdict of "you vs them".
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EDF0E6] text-[#556B2F]">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Capability</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status Aggregators</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">APM Tools</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-center text-[#3B4D14] bg-[#EBF1E3]/60 rounded-t-xl">
                    IncidentPulse AI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF0E6]">
                {MATRIX_COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-[#FAFBF7]">
                    <td className="py-3 px-4 font-semibold text-[#1F271B]">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.statusAggregators ? (
                        <Check className="w-4 h-4 text-[#556B2F] mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-[#991B1B] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.apmTools ? (
                        <Check className="w-4 h-4 text-[#556B2F] mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-[#991B1B] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-[#EBF1E3]/30 font-bold text-[#556B2F]">
                      <Check className="w-5 h-5 text-[#556B2F] mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide 10: Team Blaze Matrix */}
      {selectedSlide === 10 && (
        <div className="clay-card p-6 md:p-10 space-y-8 text-center">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
              Slide 10 &bull; Team
            </span>
            <h2 className="text-3xl font-extrabold text-[#1F271B]">
              Team Blaze Matrix
            </h2>
            <p className="text-sm text-[#4A5D29]">
              HackIIITD 2026 &bull; Powered by TinyFish & Google AI Studio
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="clay-card p-6 text-center space-y-3">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${member.color} text-white flex items-center justify-center font-extrabold text-xl shadow-md`}
                >
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-[#1F271B] text-base">{member.name}</h3>
                  <div className="text-xs font-semibold text-[#556B2F] mt-0.5">{member.role}</div>
                </div>
                <p className="text-[11px] text-[#4A5D29] leading-relaxed pt-2 border-t border-[#EDF0E6]">
                  {member.focus}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-extrabold text-[#991B1B]">
              Don’t debug blind.
            </h3>
            <p className="text-3xl font-extrabold text-[#556B2F]">
              Know who broke it.
            </p>
            <div className="text-xs font-bold text-[#4A5D29] pt-2">Thank you!</div>
          </div>
        </div>
      )}
    </div>
  );
};
