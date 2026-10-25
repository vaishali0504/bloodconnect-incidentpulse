import React, { useState } from 'react';
import { 
  Award, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Play, 
  Code2, 
  Radar, 
  ShieldAlert, 
  ArrowRight, 
  TrendingUp, 
  Volume2, 
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Target
} from 'lucide-react';

interface MentorDefenseViewProps {
  onNavigateToTab: (tab: 'command' | 'code-studio' | 'radar' | 'simulator' | 'deck') => void;
  onPlayTTS: () => void;
  isPlayingAudio: boolean;
}

export const MentorDefenseView: React.FC<MentorDefenseViewProps> = ({
  onNavigateToTab,
  onPlayTTS,
  isPlayingAudio,
}) => {
  const [language, setLanguage] = useState<'hinglish' | 'english'>('hinglish');
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<number>(1);

  const criteria = [
    {
      num: 1,
      title: 'Solution Workflow',
      focus: 'End-to-End Pipeline from Incident Detection to Verdict',
      proof: 'Dual Signal Ingest: Internal App Logs + TinyFish Web Agents -> Signal Normalizer -> Correlation Engine -> Gemini 3.8 Reasoning -> 86% Confidence Verdict & Resilient Code Fix.',
      demoTab: 'command',
      demoLabel: 'Show Command Center & Workflow',
    },
    {
      num: 2,
      title: 'MVP & Execution',
      focus: 'Tangible Working Product vs Theoretical Slides',
      proof: 'Working 3D Cloud Topology Mesh, live TinyFish scrapers for 7 vendors, live error spike simulator, and real-time Gemini-powered code correction with diff output.',
      demoTab: 'simulator',
      demoLabel: 'Execute Live Error Spike',
    },
    {
      num: 3,
      title: 'Technically Sound',
      focus: 'Resilience, Self-Healing Scraping & Zero False Positives',
      proof: 'TinyFish Web Agents bypass DOM breaking changes via structured JSON extraction; Circuit Breaker state machine; strict AbortController timeouts; Three.js Studio PBR rendering with zero 404s.',
      demoTab: 'code-studio',
      demoLabel: 'Inspect Code Resilience Engine',
    },
    {
      num: 4,
      title: 'Progress',
      focus: '24-Hour Hackathon Delivery Milestones',
      proof: 'Hours 0-6: Setup & Agents | Hours 6-14: Correlation Engine & Log Ingest | Hours 14-20: Dashboard & Verdict UI | Hours 20-24: Gemini Code Correction Studio & Pitch Polish.',
      demoTab: 'deck',
      demoLabel: 'View Progress Roadmap (Slide 7)',
    },
    {
      num: 5,
      title: 'Team Contributions (3-Member Split)',
      focus: 'Clear Division of Responsibilities (Theoretical + Practical)',
      proof: 'Member 1 (Architecture & Pitch Lead), Member 2 (TinyFish Agents & Data Pipeline), Member 3 (Gemini Reasoning, Code Correction & 3D Mesh).',
      demoTab: 'command',
      demoLabel: 'See Integrated System',
    },
  ];

  const teamRoles = [
    {
      id: 1,
      member: 'Member 1: Team Leader / Systems Architect & Pitch Lead',
      subtitle: 'The Problem, Solution Workflow & Business Differentiation',
      theory: {
        hinglish: `"Sir, modern applications 10 se zyada third-party cloud services par depend karti hain. Jab koi vendor slow hota hai ya unannounced API changes roll out karta hai, toh pura application crash ho jata hai. Gartner ke mutabik downtime ki cost $5,600 per minute hai.
Sabse bada problem yeh hai ki Datadog ya New Relic jaise APM tools sirf hamara internal data dekhte hain, aur StatusPage aggregators sirf external alerts dikhate hain. Dono aapas me connect nahi hote!
IncidentPulse AI ka core differentiator hamara 'Blame Detector' aur 'Change Radar' hai. Hum developers ko alerts nahi bhejte—hum 'The Verdict' sunate hain with 86% Confidence Score, jisse 3 ghante ki manual debugging sirf 10 seconds me resolve ho jati hai."`,
        english: `"Sir, modern distributed applications rely on 10+ third-party cloud dependencies. When a vendor degrades or rolls out an unannounced change, it triggers a domino effect across worker pools. Gartner estimates downtime costs $5,600 per minute.
Existing APM tools (Datadog/New Relic) only inspect internal logs with no vendor awareness, while StatusPage aggregators only display external statuses. They never talk to each other!
IncidentPulse AI bridges this gap with our Correlation Engine. We don't just alert developers; we deliver 'The Verdict' within 10 seconds with an 86% confidence score."`,
      },
      practicalDemo: [
        'Open the Command Center and point to the 86% Confidence Gauge and Blame Verdict card.',
        'Show the Domino Effect Chain (Client -> Stripe 504 -> Worker Thread Pool -> App Crash).',
        'Click "Auto Incident Brief" to demonstrate the 1-click Slack, Email, and Postmortem generator.',
        'Play the Gemini TTS Audio Brief to show hands-free incident briefing.',
      ],
      targetTab: 'command',
    },
    {
      id: 2,
      member: 'Member 2: Data Pipeline & TinyFish Web Agents Engineer',
      subtitle: 'Self-Healing Scraping, Dynamic Sweeps & Signal Normalization',
      theory: {
        hinglish: `"Sir, mera focus data collection aur TinyFish Web Agents architecture par hai.
Mentor ka valid question hota hai ki agar vendor ne DOM ya CSS badal diya toh scraping break ho jayegi. Iska solid technical answer yeh hai ki TinyFish Web Agents hardcoded HTML parsers use nahi karte—yeh autonomous, self-healing agents hain jo dynamic JS-rendered pages ko structured JSON me normalize karte hain.
Humne 3 types ke agents build kiye hain:
1. Status Page Agents (Stripe, AWS, Auth0 ki live health track karte hain).
2. Changelog & Deprecation Agents (Unannounced API updates aur JWKS key rotations ko detect karte hain).
3. Community Signal Agents (X/Reddit aur developer forums se early outage reports catch karte hain).
Aur sabse khaas baat: Yeh na sirf scheduled sweeps (har 5 min) chalata hai, balki hamari app me error spike aate hi instant On-Demand Real-time Sweep trigger karta hai!"`,
        english: `"Sir, my domain is the ingestion layer powered by TinyFish Web Agents.
If a vendor alters their DOM or CSS, traditional scrapers fail. TinyFish Web Agents prevent this via self-healing, model-driven extraction that converts dynamic JS-rendered status pages directly into normalized JSON.
We run 3 dedicated agent types:
1. Status Page Agents for live uptime (Stripe, AWS, Auth0, Cloudflare).
2. Changelog & Deprecation Agents for silent API breaking changes.
3. Community Signal Agents scraping X, Reddit, and Downdetector sentiment.
Crucially, sweeps are event-driven: whenever an error spike occurs, TinyFish launches an instant on-demand sweep in under 200ms."`,
      },
      practicalDemo: [
        'Navigate to the TinyFish Radar tab on the screen.',
        'Show the 3 Agent categories (Status, Changelog, Community).',
        'Click "Run Sweep" on Auth0 or Stripe to demonstrate live on-demand scraping.',
        'Open the "TinyFish Structured Signal JSON" terminal box to prove normalized data schema.',
        'Run the Google Search Grounding tool to show real-time live web outage verification.',
      ],
      targetTab: 'radar',
    },
    {
      id: 3,
      member: 'Member 3: AI Correlation & Gemini Code Correction Specialist',
      subtitle: 'LLM Reasoning, 3D Dependency Mesh & Resilient Code Patches',
      theory: {
        hinglish: `"Sir, mera responsibility Gemini LLM Reasoning Layer, 3D Cloud Topology Mesh, aur Code Correction Studio par tha.
Jab internal error logs aur TinyFish external signals Correlation Engine me aate hain, toh Gemini 3.8 Flash dono ko synthesize karke root cause identify karta hai.
Lekin hum sirf 'blame' karke rukte nahi—hamari app me Code Correction Studio built-in hai!
Agar vendor ne API break ki hai, toh Gemini developer ki brittle code ko analyze karta hai aur instant resilient code patch generate karta hai:
1. Strict 3000ms AbortController timeout (taaki worker thread block na ho).
2. Circuit Breaker state machine (CLOSED -> OPEN -> HALF_OPEN).
3. Exponential backoff retry with full jitter.
4. Idempotency-Key header taaki double payments na hon.
5. Local stale cache fallback.
Saath hi, Three.js 3D Mesh par developers live dependency failure propagation visualize kar sakte hain."`,
        english: `"Sir, I architected the Gemini 3.8 Reasoning Layer, the 3D Dependency Mesh, and the Code Correction Studio.
When internal application logs and TinyFish external signals meet in the Correlation Engine, Gemini 3.8 synthesizes them to pinpoint the exact root cause.
Critically, IncidentPulse AI doesn't stop at assigning blame—it fixes the code!
Our built-in Code Correction Studio analyzes the fragile integration and generates production-hardened patches:
1. 3000ms AbortController timeouts to stop event-loop starvation.
2. Circuit Breakers with graceful degraded states.
3. Exponential backoff with jitter and Idempotency keys.
4. In-memory fallback caching for stale tokens.
All of this is backed by our procedural Three.js 3D mesh for spatial topology."`,
      },
      practicalDemo: [
        'Click the 3D Cloud Topology Mesh: show camera presets, explode mesh slider, and glowing photon pulses.',
        'Navigate to the Code Correction Studio tab.',
        'Show the before code (blocking synchronous call) vs after code.',
        'Click "Generate Resilient Code Correction" to trigger live Gemini patching with the 5 reliability patterns.',
        'Show the diff explanation and copyable resilient patch.',
      ],
      targetTab: 'code-studio',
    },
  ];

  const mentorQuestions = [
    {
      id: 1,
      q: 'Q1. Mentor Question: "Datadog, New Relic (APM) ya StatusPage aggregators pehle se hain. Tumne naya kya kiya hai? Why IncidentPulse AI?"',
      headline: 'Core Differentiator: We give The Verdict, not just alerts.',
      bulletHindi: [
        'Existing APMs sirf andar ka data dekhte hain; StatusPage aggregators sirf bahar ka status dikhate hain. Dono connect nahi hote.',
        'IncidentPulse AI dono signals ko ek saath jodta hai (Dual Signal Correlation Engine).',
        'Gemini LLM Reasoning Layer automated verdict (86% confidence score) deta hai: "Is it your code or their cloud?"',
        'Hours of manual debugging becomes seconds to verdict.',
      ],
      bulletEnglish: [
        'Traditional APMs monitor internal metrics only; status aggregators show raw vendor statuses. They do not correlate.',
        'IncidentPulse AI joins internal logs + external TinyFish signals via our Correlation Engine.',
        'Gemini AI delivers an actionable verdict with confidence scoring and domino-effect tracing.',
        'Shifts teams from alert fatigue to instantaneous root-cause resolution.',
      ],
      demoTab: 'command',
      buttonText: 'Show Blame Verdict in UI',
    },
    {
      id: 2,
      q: 'Q2. Mentor Question: "Scraping toh basic hai, agar vendor ne DOM/CSS badal diya toh toot jayega. Real-time dynamic changes kaise handle kar rahe ho?"',
      headline: 'Self-Healing TinyFish Web Agents + Event-Driven Dynamic Sweeps',
      bulletHindi: [
        'Hum hardcoded HTML regex/CSS selectors use nahi karte; TinyFish Web Agents dynamic DOM aur JS-rendered content ko understand karke structured JSON banate hain.',
        'Scheduled sweeps (5 min) ke alawa, internal error surge aane par instant On-Demand Sweeps trigger hote hain.',
        'Change Radar feature unannounced API documentation aur changelog deprecations ko proactively flag karta hai.',
      ],
      bulletEnglish: [
        'No brittle CSS selectors: TinyFish Web Agents adapt to dynamic DOM and JS hydration, outputting uniform JSON schemas.',
        'Dual polling: Scheduled background intervals + on-demand sweeps triggered by user error spikes.',
        'Change Radar monitors release notes and flags breaking endpoint shifts before runtime failure.',
      ],
      demoTab: 'radar',
      buttonText: 'Open TinyFish Radar & Sweeps',
    },
    {
      id: 3,
      q: 'Q3. Mentor Question: "Production-ready kaise banayenge? Agar AI galat data deta hai ya code break hota hai toh kya backup hai?"',
      headline: 'Deterministic Confidence Gauge + Structured Gemini Code Correction Studio',
      bulletHindi: [
        'AI ka verdict blind nahi hai: UI par 0-100% Confidence Gauge aur 4-metric Evidence Snapshot (Latency, Error Rate, Traffic, Deploy) dikhate hain.',
        'Gemini Structured Outputs aur system prompt boundaries false positives ko eliminate karte hain.',
        'Code Correction Studio developer ko Circuit Breaker, AbortController timeouts, aur fallback caching ke sath resilient patch generate karke deta hai.',
      ],
      bulletEnglish: [
        'Zero blind guessing: 0-100% Confidence Arc Gauge backed by 4-point verifiable telemetry evidence.',
        'Gemini 3.8 structured JSON schemas enforce rigorous technical verdicts.',
        'Built-in Code Correction Studio injects automated circuit breakers, timeouts, and graceful fallbacks into developer code.',
      ],
      demoTab: 'code-studio',
      buttonText: 'Open Code Correction Studio',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner with Authentic Hackathon Notebook Reference */}
      <div className="clay-card p-6 md:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1E3] text-[#3B4D14] text-xs font-bold border border-[#556B2F]/20">
              <Award className="w-4 h-4 text-[#556B2F]" />
              HackIIITD 2026 &bull; Mentor Round 2 Defense War Room
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F271B] tracking-tight">
              Mentor Round 2 Evaluation Strategy & 3-Member Role Split
            </h2>
            <p className="text-sm text-[#4A5D29]">
              Prepared from your exact handwritten mentoring criteria and simulation counter-questions. Complete practical and theoretical defense.
            </p>
          </div>

          {/* Language Toggle */}
          <div className="bg-[#EDF0E6] p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setLanguage('hinglish')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                language === 'hinglish' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#3B4D14]'
              }`}
            >
              Hinglish Script (Casual & Confident)
            </button>
            <button
              onClick={() => setLanguage('english')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                language === 'english' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#3B4D14]'
              }`}
            >
              Pure English Script (Formal Technical)
            </button>
          </div>
        </div>

        {/* Notebook Image & Criteria Banner */}
        <div className="bg-[#FAFBF7] border border-[#556B2F]/20 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-5">
          <div className="shrink-0 relative group">
            <img
              src="/public/assets/aistudio/WhatsApp_Image_2026-10-24_at_11.05.05_PM_db1bc524.jpeg"
              alt="Mentoring Criteria Notebook"
              className="w-24 h-32 object-cover rounded-xl shadow-md border-2 border-white ring-1 ring-[#556B2F]/20"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
              Criteria
            </div>
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div className="font-bold uppercase tracking-wider text-[#556B2F] flex items-center gap-2">
              <Target className="w-4 h-4" />
              Official Mentoring Criteria from your Notebook:
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#1F271B]">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EDF0E6] shadow-2xs">
                1. Solution Workflow ➔
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EDF0E6] shadow-2xs">
                2. MVP & Execution ➔
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EDF0E6] shadow-2xs">
                3. Technically Sound ➔
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EDF0E6] shadow-2xs">
                4. Progress ➔
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EDF0E6] shadow-2xs">
                5. Team Contributions
              </span>
            </div>
            <p className="text-[#4A5D29] leading-relaxed text-[11px]">
              Every single criterion has been mapped directly to live working features and practical screen demos in this applet.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: 3-Member Role Classification (Theory + Practical) */}
      <div className="clay-card p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EDF0E6] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#556B2F]" />
            <h3 className="text-base font-bold uppercase tracking-wider text-[#1F271B]">
              3-Member Team Role Classification (Practical & Theoretical)
            </h3>
          </div>
          <span className="neu-badge text-[11px] px-3 py-1 text-[#556B2F]">
            Equal Ownership & High Impact
          </span>
        </div>

        {/* Member Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {teamRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedMember(role.id)}
              className={`p-4 rounded-2xl text-left border cursor-pointer transition-all ${
                selectedMember === role.id
                  ? 'bg-gradient-to-br from-[#FAFBF7] to-white border-[#556B2F] shadow-md ring-1 ring-[#556B2F]'
                  : 'bg-white border-[#EDF0E6] hover:bg-[#F9FAF6]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-[#556B2F]">
                  MEMBER 0{role.id}
                </span>
                {selectedMember === role.id && (
                  <span className="w-2 h-2 rounded-full bg-[#556B2F]" />
                )}
              </div>
              <h4 className="text-sm font-bold text-[#1F271B] leading-tight mb-1">
                {role.member.split(':')[1]?.trim() || role.member}
              </h4>
              <p className="text-[11px] text-[#6B8E23] font-medium line-clamp-1">
                {role.subtitle}
              </p>
            </button>
          ))}
        </div>

        {/* Detailed Selected Member Script & Practical Action */}
        {(() => {
          const currentRole = teamRoles.find((r) => r.id === selectedMember)!;
          return (
            <div className="bg-[#FAFBF7] border border-[#556B2F]/20 p-5 rounded-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF0E6] pb-3">
                <div>
                  <h4 className="text-base font-bold text-[#1F271B]">
                    {currentRole.member}
                  </h4>
                  <div className="text-xs font-semibold text-[#556B2F]">
                    {currentRole.subtitle}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab(currentRole.targetTab as any)}
                  className="clay-btn-olive px-4 py-2 text-xs font-bold gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Switch to Screen Demo</span>
                </button>
              </div>

              {/* Theory Speech Section */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#3B4D14] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#556B2F]" />
                  Theoretical Explanation Script (What to tell the Mentor):
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EDF0E6] text-xs text-[#2F3E1A] leading-relaxed whitespace-pre-wrap font-sans">
                  {language === 'hinglish' ? currentRole.theory.hinglish : currentRole.theory.english}
                </div>
              </div>

              {/* Practical Live Demo Section */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#991B1B]" />
                  Practical Live Demo (What to show on screen):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentRole.practicalDemo.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-[#EDF0E6] text-xs flex items-start gap-2 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#556B2F] shrink-0 mt-0.5" />
                      <span className="text-[#1F271B] font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SECTION 2: 5 Mentoring Criteria Breakdown from Notebook */}
      <div className="clay-card p-6 md:p-8 space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
            Rubric Compliance
          </span>
          <h3 className="text-xl font-bold text-[#1F271B]">
            5 Mentoring Criteria Defense & Live Proof
          </h3>
          <p className="text-xs text-[#4A5D29]">
            Directly address the 5 points written in your notebook in sequential order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {criteria.map((crit) => (
            <div
              key={crit.num}
              className="bg-white p-4 rounded-2xl border border-[#EDF0E6] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-extrabold text-[#556B2F]">
                    0{crit.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#556B2F]" />
                </div>
                <h4 className="text-xs font-bold text-[#1F271B] leading-tight">
                  {crit.title}
                </h4>
                <div className="text-[10px] text-[#6B8E23] font-semibold">
                  {crit.focus}
                </div>
                <p className="text-[11px] text-[#4A5D29] leading-relaxed pt-1">
                  {crit.proof}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab(crit.demoTab as any)}
                className="clay-btn px-2.5 py-1.5 text-[10px] font-bold text-[#3B4D14] w-full mt-2"
              >
                {crit.demoLabel} &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Mentor Counter-Questions Simulation (Q1, Q2, Q3) */}
      <div className="clay-card p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
            Tough Question Drills
          </span>
          <h3 className="text-xl font-bold text-[#1F271B]">
            Interactive Mentor Counter-Questions Simulation
          </h3>
          <p className="text-xs text-[#4A5D29]">
            The exact sharp questions mentors ask about APMs, scraping breakdown, and production readiness.
          </p>
        </div>

        <div className="space-y-4">
          {mentorQuestions.map((mq) => {
            const isOpen = activeQuestion === mq.id;

            return (
              <div
                key={mq.id}
                className="bg-white rounded-2xl border border-[#EDF0E6] shadow-xs overflow-hidden transition-all"
              >
                <div
                  onClick={() => setActiveQuestion(isOpen ? 0 : mq.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-[#FAFBF7] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF1E3] text-[#556B2F] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F271B] leading-snug">
                        {mq.q}
                      </h4>
                      <p className="text-xs font-semibold text-[#6B8E23] mt-1">
                        Winning Core: {mq.headline}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-[#556B2F] mt-1">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#EDF0E6] bg-[#FAFBF7] space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#3B4D14] uppercase tracking-wider">
                        Bulletproof Answer Points:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {(language === 'hinglish' ? mq.bulletHindi : mq.bulletEnglish).map((bullet, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-xl border border-[#EDF0E6] text-xs flex items-start gap-2 shadow-2xs"
                          >
                            <span className="w-4 h-4 rounded-full bg-[#556B2F] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-[#2F3E1A] leading-relaxed font-medium">
                              {bullet}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono text-[#556B2F]">
                        Practical Proof Ready on Screen
                      </span>
                      <button
                        onClick={() => onNavigateToTab(mq.demoTab as any)}
                        className="clay-btn-olive px-4 py-2 text-xs font-bold gap-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{mq.buttonText}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
