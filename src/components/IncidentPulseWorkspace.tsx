import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Activity, AlertCircle, Code2, Radar, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { BlameVerdictCard } from './BlameVerdictCard';
import { CodeCorrectionStudio } from './CodeCorrectionStudio';
import { DemoFlowSimulator } from './DemoFlowSimulator';
import { IncidentBriefModal } from './IncidentBriefModal';
import { MentorDefenseView } from './MentorDefenseView';
import { Navbar } from './Navbar';
import { ThreeScene } from './ThreeScene';
import { TinyFishRadar } from './TinyFishRadar';
import { ArchitectureDeckView } from './ArchitectureDeckView';
import { INITIAL_INCIDENT, INITIAL_VENDORS, PRESET_SCENARIOS } from '../data/mockData';
import type { AgentSignal, IncidentState, Vendor, VerdictType } from '../types';

type WorkspaceTab = 'command' | 'code-studio' | 'radar' | 'simulator' | 'deck' | 'mentor-defense';

interface DiagnosisResponse {
  verdict: VerdictType;
  confidence: number;
  headline: string;
  rootCause: string;
  blameEntity: string;
  evidenceSummary: string[];
  dominoPath: string[];
  circuitBreakerAdvice: string;
  codeCorrection?: {
    explanation: string;
    beforeSnippet: string;
    afterSnippet: string;
    diffSummary: string;
  };
}

interface VendorConfig {
  id: string;
  name: string;
  category: string;
  statusUrl: string;
  defaultStatus: Vendor['status'];
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json()) as ApiResponse<T> & T;
  if (!response.ok || body.success === false) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return body;
}

function getVendorId(service: string): string {
  const normalized = service.toLowerCase();
  if (normalized.includes('auth')) return 'auth0';
  if (normalized.includes('stripe')) return 'stripe';
  if (normalized.includes('aws')) return 'aws';
  if (normalized.includes('openai')) return 'openai';
  if (normalized.includes('cloudflare')) return 'cloudflare';
  if (normalized.includes('supabase')) return 'supabase';
  return 'auth0';
}

export const IncidentPulseWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('command');
  const [incident, setIncident] = useState<IncidentState>(INITIAL_INCIDENT);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [vendorId, setVendorId] = useState('auth0');
  const [logs, setLogs] = useState('HTTP 504 Gateway Timeout while calling the vendor API.');
  const [stackTrace, setStackTrace] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [latency, setLatency] = useState('3000');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refreshRadar = useCallback(async () => {
    const [vendorResponse, signalResponse] = await Promise.all([
      requestJson<{ vendors: VendorConfig[] }>('/api/tinyfish/vendors'),
      requestJson<{ signals: AgentSignal[] }>('/api/tinyfish/signals'),
    ]);
    setVendors(
      vendorResponse.vendors.map((vendor) => ({
        ...vendor,
        status: vendor.defaultStatus,
        latencyMs: 0,
        errorRate: 0,
        iconName: 'Globe',
        lastChecked: 'Demo feed',
      }))
    );
    setSignals(signalResponse.signals);
  }, []);

  useEffect(() => {
    refreshRadar().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load vendor signals.');
    });
  }, [refreshRadar]);

  const updateIncident = (result: DiagnosisResponse, affectedService: string) => {
    const confidenceScore = Math.max(0, Math.min(100, Math.round(result.confidence)));
    setIncident((current) => ({
      ...current,
      id: `incident-${Date.now()}`,
      title: result.headline,
      affectedService,
      status: 'Verdict Reached',
      confidenceScore,
      verdict: result.verdict,
      blameEntity: result.blameEntity,
      headline: result.headline,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
      duration: 'Just now',
      topFinding: result.headline,
      rootCause: result.rootCause,
      evidenceSnapshot: {
        latencySpike: Number(latency) >= 2000 ? 'High' : Number(latency) >= 1000 ? 'Medium' : 'Low',
        errorRate: result.verdict === 'YOUR_CODE' ? 'Medium' : 'High',
        trafficSurge: 'Medium',
        deployChanges: stackTrace.toLowerCase().includes('deploy') ? 'High' : 'Low',
      },
      dominoPath: result.dominoPath,
      evidenceList: result.evidenceSummary,
      circuitBreakerAdvice: result.circuitBreakerAdvice,
      codeSnippet: result.codeCorrection
        ? {
            beforeSnippet: result.codeCorrection.beforeSnippet || codeSnippet,
            afterSnippet: result.codeCorrection.afterSnippet,
            explanation: result.codeCorrection.explanation,
            diffSummary: result.codeCorrection.diffSummary,
          }
        : undefined,
    }));
  };

  const diagnose = async (event?: FormEvent) => {
    event?.preventDefault();
    setIsDiagnosing(true);
    setError(null);
    try {
      const vendor = vendors.find((item) => item.id === vendorId);
      const body = await requestJson<{ data: DiagnosisResponse }>('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          stackTrace,
          affectedService: vendor?.name ?? vendorId,
          latency: `${latency} ms`,
          codeSnippet,
        }),
      });
      if (!body.data?.headline || !body.data.rootCause) {
        throw new Error('The diagnosis response was incomplete. Please try again.');
      }
      updateIncident(body.data, vendor?.name ?? vendorId);
      setActiveTab('command');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incident diagnosis failed.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const triggerSweep = async (targetVendorId: string) => {
    setIsSweeping(true);
    setError(null);
    try {
      const result = await requestJson<{
        allSignals: AgentSignal[];
        sweptVendor: { id: string; defaultStatus: Vendor['status'] };
      }>('/api/tinyfish/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: targetVendorId }),
      });
      setSignals(result.allSignals);
      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === result.sweptVendor.id
            ? { ...vendor, status: result.sweptVendor.defaultStatus, lastChecked: 'Just now' }
            : vendor
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vendor sweep failed.');
    } finally {
      setIsSweeping(false);
    }
  };

  const playAudioBrief = async () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setError(null);
    try {
      const result = await requestJson<{
        audioBase64?: string | null;
        useWebSpeech?: boolean;
        text?: string;
      }>('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${incident.headline}. ${incident.rootCause}` }),
      });

      if (result.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setError('Could not play the generated audio brief.');
        };
        await audio.play();
        setIsPlayingAudio(true);
        return;
      }

      if (!('speechSynthesis' in window)) {
        throw new Error('Audio playback is not supported in this browser.');
      }
      const utterance = new SpeechSynthesisUtterance(result.text || incident.rootCause);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setError('Could not play the spoken incident brief.');
      };
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio brief failed.');
    }
  };

  const runSpikeSimulation = () => {
    setLogs('Elevated vendor API latency; repeated HTTP 504 Gateway Timeout and ETIMEDOUT errors.');
    setStackTrace('Vendor client request timed out while waiting for upstream response.');
    setLatency('4800');
    void diagnose();
  };

  const selectScenario = (scenario: (typeof PRESET_SCENARIOS)[number]) => {
    setIncident(scenario.incident);
    setVendorId(getVendorId(scenario.vendor));
    setLogs(`${scenario.description}\n${scenario.incident.rootCause}`);
    setLatency(String(scenario.incident.evidenceSnapshot.latencySpike === 'High' ? 4800 : 1200));
    setError(null);
  };

  const selectedVendorId = getVendorId(incident.affectedService);

  return (
    <div className="space-y-6">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlayingAudio={isPlayingAudio}
        onPlayTTS={() => void playAudioBrief()}
        confidenceScore={incident.confidenceScore}
      />

      {error && (
        <div role="alert" className="clay-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {activeTab === 'command' && (
        <div className="space-y-6">
          <form onSubmit={(event) => void diagnose(event)} className="clay-card p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#556B2F]" />
              <div>
                <h2 className="text-lg font-bold text-[#1F271B]">Analyze an incident</h2>
                <p className="text-xs text-[#4A5D29]">Correlate your app logs with vendor signals to get a verdict and mitigation advice.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-semibold text-[#3B4D14]">
                Affected vendor
                <select value={vendorId} onChange={(event) => setVendorId(event.target.value)} className="w-full rounded-xl border border-[#DDE5D1] bg-white p-2.5">
                  {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-[#3B4D14]">
                Observed latency (ms)
                <input value={latency} onChange={(event) => setLatency(event.target.value)} inputMode="numeric" className="w-full rounded-xl border border-[#DDE5D1] bg-white p-2.5" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-[#3B4D14] md:col-span-2">
                Error logs
                <textarea value={logs} onChange={(event) => setLogs(event.target.value)} rows={3} className="w-full rounded-xl border border-[#DDE5D1] bg-white p-2.5 font-mono text-xs" required />
              </label>
              <label className="space-y-1 text-xs font-semibold text-[#3B4D14]">
                Stack trace (optional)
                <textarea value={stackTrace} onChange={(event) => setStackTrace(event.target.value)} rows={3} className="w-full rounded-xl border border-[#DDE5D1] bg-white p-2.5 font-mono text-xs" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-[#3B4D14]">
                Integration code (optional)
                <textarea value={codeSnippet} onChange={(event) => setCodeSnippet(event.target.value)} rows={3} className="w-full rounded-xl border border-[#DDE5D1] bg-white p-2.5 font-mono text-xs" />
              </label>
            </div>
            <button type="submit" disabled={isDiagnosing} className="clay-btn-olive px-5 py-2.5 text-xs font-bold gap-2 disabled:opacity-60">
              {isDiagnosing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isDiagnosing ? 'Correlating signals...' : 'Diagnose incident'}
            </button>
          </form>

          <BlameVerdictCard
            incident={incident}
            onOpenCodeCorrection={() => setActiveTab('code-studio')}
            onOpenBriefModal={() => setIsBriefOpen(true)}
            onPlayTTS={() => void playAudioBrief()}
            isPlayingAudio={isPlayingAudio}
          />
          <ThreeScene
            activeVendorId={selectedVendorId}
            isSimulatingSpike={isDiagnosing}
            onSelectNode={(nodeId) => setVendorId(getVendorId(nodeId))}
          />
        </div>
      )}

      {activeTab === 'code-studio' && (
        <CodeCorrectionStudio
          initialCode={incident.codeSnippet?.beforeSnippet || codeSnippet}
          initialError={logs}
          vendorName={incident.affectedService}
        />
      )}

      {activeTab === 'radar' && (
        <TinyFishRadar vendors={vendors} signals={signals} onTriggerSweep={triggerSweep} isSweeping={isSweeping} />
      )}

      {activeTab === 'simulator' && (
        <DemoFlowSimulator
          currentIncident={incident}
          onSelectScenario={selectScenario}
          onTriggerSpikeSimulation={runSpikeSimulation}
          isSimulating={isDiagnosing}
        />
      )}

      {activeTab === 'deck' && <ArchitectureDeckView />}

      {activeTab === 'mentor-defense' && (
        <MentorDefenseView
          onNavigateToTab={setActiveTab}
          onPlayTTS={() => void playAudioBrief()}
          isPlayingAudio={isPlayingAudio}
        />
      )}

      {activeTab === 'command' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="clay-card p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#556B2F]" />
            <span className="text-xs font-semibold text-[#3B4D14]">Evidence-backed vendor vs. code verdict</span>
          </div>
          <div className="clay-card p-4 flex items-center gap-3">
            <Radar className="w-5 h-5 text-[#556B2F]" />
            <span className="text-xs font-semibold text-[#3B4D14]">Status, changelog and community signal radar</span>
          </div>
          <div className="clay-card p-4 flex items-center gap-3">
            <Code2 className="w-5 h-5 text-[#556B2F]" />
            <span className="text-xs font-semibold text-[#3B4D14]">Resilient code correction and incident brief</span>
          </div>
        </div>
      )}

      <IncidentBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        incident={incident}
        onPlayTTS={() => void playAudioBrief()}
        isPlayingAudio={isPlayingAudio}
      />
    </div>
  );
};
