import React, { useState } from 'react';
import { AlertCircle, Clock, MapPin, Hospital, Phone, CheckCircle2, ChevronRight, Droplet, User, Navigation } from 'lucide-react';
import { BloodGroup } from '../server/compatibility';

interface RequestItem {
  id: string;
  recipientName: string;
  patientName: string;
  bloodGroup: BloodGroup;
  component: string;
  unitsRequired: number;
  urgency: 'CRITICAL' | 'URGENT' | 'STANDARD';
  hospitalName: string;
  hospitalAddress: string;
  lat: number;
  lng: number;
  contactPhone: string;
  status: 'OPEN' | 'MATCHED' | 'IN_TRANSIT' | 'FULFILLED' | 'CANCELLED';
  matchedDonorCount: number;
  responses: Array<{
    id: string;
    donorId: string;
    donorName: string;
    bloodGroup: BloodGroup;
    status: string;
    responseTime: string;
    etaMinutes?: number;
    phone: string;
  }>;
  createdAt: string;
}

interface RecipientViewProps {
  requests: RequestItem[];
  onRequestBlood: () => void;
  onRefresh: () => void;
}

export const RecipientView: React.FC<RecipientViewProps> = ({
  requests,
  onRequestBlood,
  onRefresh,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    requests.length > 0 ? requests[0] : null
  );

  const activeRequests = requests.filter((r) => r.status !== 'FULFILLED' && r.status !== 'CANCELLED');
  const pastRequests = requests.filter((r) => r.status === 'FULFILLED' || r.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="clay-card p-6 border border-orange-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            Recipient Dispatch Dashboard
          </span>
          <h2 className="text-2xl font-black text-neutral-900">
            Monitor Blood Requests & Live Donor En Route
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time tracking of matched voluntary donors, hospital verification, and fulfillment progress.
          </p>
        </div>

        <button
          onClick={onRequestBlood}
          className="clay-btn-orange px-6 py-3 font-bold text-xs text-white flex items-center gap-2 shadow-lg"
        >
          <Droplet className="w-4 h-4 fill-white" />
          <span>New Emergency Blood Request</span>
        </button>
      </div>

      {/* Grid of Active Requests & Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active and Past Requests List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center justify-between px-1">
            <span>Active Broadcasts ({activeRequests.length})</span>
            <button onClick={onRefresh} className="text-orange-600 hover:underline">
              Refresh
            </button>
          </div>

          {activeRequests.length === 0 ? (
            <div className="clay-card p-6 text-center text-neutral-500 text-xs">
              No active blood requests. Need emergency blood? Broadcast an alert now.
            </div>
          ) : (
            activeRequests.map((req) => {
              const isSelected = selectedRequest?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`clay-card p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
                      : 'border-orange-100 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        req.urgency === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 animate-pulse'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {req.urgency}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-500">
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 leading-tight">
                        {req.patientName}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {req.unitsRequired} Units ({req.component})
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-orange-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1 truncate max-w-[170px]">
                      <Hospital className="w-3 h-3 text-neutral-400 shrink-0" />
                      {req.hospitalName}
                    </span>
                    <span className="font-bold text-orange-600">
                      {req.responses.length > 0 ? `${req.responses.length} en route` : 'Finding donors...'}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Past Requests Section */}
          {pastRequests.length > 0 && (
            <div className="mt-6 pt-4 border-t border-orange-100">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-3 px-1">
                Completed & Fulfilled ({pastRequests.length})
              </div>
              {pastRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="p-3 bg-neutral-100/80 hover:bg-neutral-100 rounded-2xl mb-2 cursor-pointer transition text-xs flex items-center justify-between text-neutral-600"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-neutral-800">{req.patientName}</span>
                    <span className="px-1.5 py-0.2 bg-white rounded text-[10px] font-bold">
                      {req.bloodGroup}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Fulfilled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Request Deep Dive & Live Dispatch Tracker */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <div className="clay-card p-6 border border-orange-100 space-y-6">
              {/* Request Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    {selectedRequest.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-neutral-900">
                        {selectedRequest.patientName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          selectedRequest.urgency === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {selectedRequest.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Request ID: #{selectedRequest.id} • Registered{' '}
                      {new Date(selectedRequest.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-neutral-500 font-medium">Quantity Needed:</div>
                  <div className="text-lg font-black text-neutral-900">
                    {selectedRequest.unitsRequired} Units ({selectedRequest.component})
                  </div>
                </div>
              </div>

              {/* Hospital & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/50">
                  <div className="font-bold text-neutral-700 flex items-center gap-1.5 mb-1">
                    <Hospital className="w-4 h-4 text-orange-600" /> Transfusion Facility
                  </div>
                  <div className="font-extrabold text-neutral-900 text-sm">
                    {selectedRequest.hospitalName}
                  </div>
                  <div className="text-neutral-500 mt-0.5">
                    {selectedRequest.hospitalAddress}
                  </div>
                </div>

                <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/50">
                  <div className="font-bold text-neutral-700 flex items-center gap-1.5 mb-1">
                    <Phone className="w-4 h-4 text-orange-600" /> Emergency Contact
                  </div>
                  <div className="font-extrabold text-neutral-900 text-sm">
                    {selectedRequest.contactPhone}
                  </div>
                  <div className="text-neutral-500 mt-0.5">
                    Coordinator on Duty
                  </div>
                </div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="neu-inset p-5 rounded-2xl">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 mb-4">
                  Live Dispatch Milestone Pipeline
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      ✓
                    </div>
                    <div className="font-bold text-neutral-800 text-[11px]">Alert Broadcast</div>
                    <div className="text-[10px] text-neutral-400">Complete</div>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                        selectedRequest.responses.length > 0
                          ? 'bg-emerald-500 text-white'
                          : 'bg-orange-500 text-white animate-pulse'
                      }`}
                    >
                      {selectedRequest.responses.length > 0 ? '✓' : '2'}
                    </div>
                    <div className="font-bold text-neutral-800 text-[11px]">Donor Accepted</div>
                    <div className="text-[10px] text-neutral-400">
                      {selectedRequest.responses.length > 0 ? 'Matched' : 'Searching...'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                        selectedRequest.status === 'IN_TRANSIT' || selectedRequest.status === 'FULFILLED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      3
                    </div>
                    <div className="font-bold text-neutral-800 text-[11px]">En Route</div>
                    <div className="text-[10px] text-neutral-400">Transit to Center</div>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                        selectedRequest.status === 'FULFILLED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      4
                    </div>
                    <div className="font-bold text-neutral-800 text-[11px]">Transfusion Complete</div>
                    <div className="text-[10px] text-neutral-400">Life Saved</div>
                  </div>
                </div>
              </div>

              {/* Active Responders (Donors En Route) */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 mb-3 flex items-center justify-between">
                  <span>Voluntary Donors Responding ({selectedRequest.responses.length})</span>
                  <span className="text-[11px] font-normal text-neutral-500">
                    {selectedRequest.matchedDonorCount} eligible donors alerted in radius
                  </span>
                </h4>

                {selectedRequest.responses.length === 0 ? (
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/40 text-center text-xs text-neutral-500">
                    Emergency alerts have been pushed to {selectedRequest.matchedDonorCount} nearby compatible voluntary donors.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedRequest.responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-3.5 bg-white border border-emerald-200 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center">
                            {resp.bloodGroup}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              <span>{resp.donorName}</span>
                              <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                                En Route (ETA ~{resp.etaMinutes || 15} min)
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              Accepted at {new Date(resp.responseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <a
                          href={`tel:${resp.phone}`}
                          className="clay-btn-orange px-3.5 py-1.5 text-xs text-white flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Donor
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="clay-card p-12 text-center text-neutral-400 text-xs">
              Select a blood request from the left column to monitor details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
