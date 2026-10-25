import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Play, 
  Layers, 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/mockData';
import { IncidentState } from '../types';

interface DemoFlowSimulatorProps {
  currentIncident: IncidentState;
  onSelectScenario: (scenario: (typeof PRESET_SCENARIOS)[0]) => void;
  onTriggerSpikeSimulation: () => void;
  isSimulating: boolean;
}

export const DemoFlowSimulator: React.FC<DemoFlowSimulatorProps> = ({
  currentIncident,
  onSelectScenario,
  onTriggerSpikeSimulation,
  isSimulating,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(3); // 1, 2, 3, or 4

  const steps = [
    {
      num: '01',
      title: 'Connect app and pick vendors',
      desc: 'Bring data and define your service map (Auth0, Stripe, AWS, OpenAI).',
      status: 'Completed',
    },
    {
      num: '02',
      title: 'Simulate error spike',
      desc: 'Inject realistic vendor latency or breaking JWKS signature change.',
      status: 'Active',
    },
    {
      num: '03',
      title: 'Agents sweep and engine correlates',
      desc: 'TinyFish auto-discovers, scrapes changelogs, and joins app telemetry.',
      status: 'Processing',
    },
    {
      num: '04',
      title: 'Verdict with evidence and generate brief',
      desc: 'Instant blame detection (86% confidence) and resilient code correction.',
      status: 'Ready',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Steps Timeline Bar from Slide 8 */}
      <div className="clay-card p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDF0E6] pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
              Demo Flow Walkthrough (Slide 8)
            </span>
            <h2 className="text-2xl font-bold text-[#1F271B] tracking-tight">
              From Setup to Actionable Verdict in Four Steps
            </h2>
          </div>

          <button
            onClick={onTriggerSpikeSimulation}
            disabled={isSimulating}
            className="clay-btn-olive px-5 py-2.5 text-xs font-bold gap-2 cursor-pointer shadow-md"
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Latency Spike...' : 'Simulate Live Error Spike'}</span>
          </button>
        </div>

        {/* 4-Step Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, i) => {
            const stepNum = i + 1;
            const isCurrent = currentStep === stepNum;
            const isPast = currentStep > stepNum;

            return (
              <div
                key={st.num}
                onClick={() => setCurrentStep(stepNum)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-br from-[#FAFBF7] to-[#FFFFFF] border-[#556B2F] shadow-md ring-2 ring-[#556B2F]/20'
                    : isPast
                    ? 'bg-white border-[#DDE5D1]'
                    : 'bg-[#F9FAF6] border-[#EDF0E6] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-2xl font-extrabold text-[#556B2F]">
                    {st.num}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-[#556B2F] text-white'
                        : isPast
                        ? 'bg-[#EBF1E3] text-[#3B4D14]'
                        : 'bg-[#EDF0E6] text-[#718063]'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1F271B] mb-1">{st.title}</h3>
                <p className="text-xs text-[#4A5D29] leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Scenario Injector */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDF0E6] pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#556B2F]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F271B]">
              Select Production Incident Scenario (Slide 3, 7 & 8)
            </h3>
          </div>
          <span className="text-xs text-[#556B2F] font-semibold">
            Recreate outages in seconds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_SCENARIOS.map((scenario) => {
            const isSelected = currentIncident.id === scenario.incident.id;

            return (
              <div
                key={scenario.name}
                onClick={() => onSelectScenario(scenario)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#FAFBF7] border-[#556B2F] shadow-sm ring-1 ring-[#556B2F]'
                    : 'bg-white border-[#EDF0E6] hover:bg-[#F9FAF6]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EBF1E3] text-[#3B4D14]">
                    {scenario.vendor}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#556B2F]">
                    {scenario.incident.confidenceScore}% Conf
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1F271B] mb-1">{scenario.name}</h4>
                <p className="text-xs text-[#4A5D29] leading-relaxed mb-3">
                  {scenario.description}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#EDF0E6]">
                  <span className="text-[#6B8E23] font-medium">Verdict:</span>
                  <span className="font-bold text-[#1F271B]">{scenario.incident.blameEntity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
