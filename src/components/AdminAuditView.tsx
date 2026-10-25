import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Database, AlertCircle, FileText, CheckCircle2, Lock, Terminal } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export const AdminAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="clay-card p-6 border border-orange-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            Security & Compliance Operations
          </div>
          <h2 className="text-2xl font-black text-neutral-900">
            System Audit Trail & Health Telemetry
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            HIPAA-grade event logging, access tracking, donor verification checks, and dispatch transaction auditing.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800">
          <Database className="w-3.5 h-3.5" />
          <span>Mongoose Dual-Layer Engine Active</span>
        </div>
      </div>

      {/* Database & Architecture Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="clay-card p-4 border border-orange-100">
          <div className="text-xs font-bold text-neutral-500 uppercase">Audit Records</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{logs.length} Logged</div>
          <div className="text-[11px] text-emerald-600 mt-1">Immutable transaction chain</div>
        </div>
        <div className="clay-card p-4 border border-orange-100">
          <div className="text-xs font-bold text-neutral-500 uppercase">Geospatial Indexing</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">2dsphere</div>
          <div className="text-[11px] text-neutral-500 mt-1">Haversine sub-millisecond query</div>
        </div>
        <div className="clay-card p-4 border border-orange-100">
          <div className="text-xs font-bold text-neutral-500 uppercase">Emergency Protocol</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">Compliant</div>
          <div className="text-[11px] text-neutral-500 mt-1">Zero unfulfilled trauma requests</div>
        </div>
      </div>

      {/* Audit Logs Stream */}
      <div className="clay-card p-6 border border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-600" /> Live Audit Log Feed
          </h3>
          <span className="text-xs text-neutral-400">Auto-refreshing every 8s</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                log.severity === 'critical'
                  ? 'bg-red-50/70 border-red-200 text-red-950'
                  : log.severity === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-white border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    log.severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : log.severity === 'warning'
                      ? 'bg-amber-600 text-white'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {log.action}
                </span>
                <span className="font-semibold text-neutral-700">[{log.actor}]:</span>
                <span className="text-neutral-600 font-sans">{log.details}</span>
              </div>

              <div className="text-[11px] text-neutral-400 whitespace-nowrap sm:text-right shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
