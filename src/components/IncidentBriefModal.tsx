import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Mail, 
  MessageSquare, 
  FileText, 
  Volume2, 
  Sparkles,
  Download
} from 'lucide-react';
import { IncidentState } from '../types';

interface IncidentBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentState;
  onPlayTTS: () => void;
  isPlayingAudio: boolean;
}

export const IncidentBriefModal: React.FC<IncidentBriefModalProps> = ({
  isOpen,
  onClose,
  incident,
  onPlayTTS,
  isPlayingAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'slack' | 'email' | 'postmortem'>('slack');
  const [briefData, setBriefData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchBrief();
    }
  }, [isOpen, incident]);

  const fetchBrief = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/incident-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentTitle: incident.title,
          vendor: incident.affectedService,
          confidence: incident.confidenceScore,
          duration: incident.duration,
          rootCause: incident.rootCause,
          affectedUsers: '2,840 active client sessions',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBriefData(data.data);
      }
    } catch (err) {
      console.error('Failed to generate brief:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCopyContent = () => {
    if (!briefData) return '';
    if (activeTab === 'slack') return briefData.slackMarkdown;
    if (activeTab === 'email') return briefData.emailHtml;
    return briefData.postmortemMarkdown;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="clay-card w-full max-w-2xl bg-white p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDF0E6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#556B2F] text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F271B]">
                Auto Incident Brief (Slide 3)
              </h3>
              <p className="text-xs text-[#556B2F] font-medium">
                One-Click Stakeholder Dispatch for Slack, Email & Docs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EDF0E6] hover:bg-[#DDE5D1] text-[#3B4D14] flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between">
          <div className="bg-[#EDF0E6] p-1 rounded-xl flex gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('slack')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'slack' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Slack Format</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'email' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email HTML</span>
            </button>
            <button
              onClick={() => setActiveTab('postmortem')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'postmortem' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Postmortem Doc</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPlayTTS}
              className={`clay-btn px-3 py-1.5 text-xs gap-1.5 text-[#3B4D14] ${
                isPlayingAudio ? 'bg-[#556B2F] text-white' : ''
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Speaking...' : 'Audio Brief'}</span>
            </button>
            <button
              onClick={() => handleCopy(getCopyContent())}
              className="clay-btn-olive px-3.5 py-1.5 text-xs font-bold gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Brief'}</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="neu-inset p-4 rounded-xl min-h-[220px]">
          {isLoading ? (
            <div className="h-44 flex flex-col items-center justify-center space-y-2 text-[#556B2F]">
              <Sparkles className="w-6 h-6 animate-spin" />
              <span className="text-xs font-semibold">Gemini 3.8 Generating Structured Executive Brief...</span>
            </div>
          ) : briefData ? (
            <div className="font-mono text-xs text-[#2F3E1A] whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
              {activeTab === 'slack' && briefData.slackMarkdown}
              {activeTab === 'email' && briefData.emailHtml}
              {activeTab === 'postmortem' && briefData.postmortemMarkdown}
            </div>
          ) : (
            <div className="text-xs text-[#6B8E23]">No brief available.</div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between text-xs text-[#4A5D29] pt-2 border-t border-[#EDF0E6]">
          <span>Confidence: <strong className="text-[#1F271B]">{incident.confidenceScore}%</strong></span>
          <span>Verdict: <strong className="text-[#556B2F]">{incident.blameEntity}</strong></span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#556B2F] hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
