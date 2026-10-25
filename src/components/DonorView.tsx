import React, { useState } from 'react';
import { ShieldCheck, Award, Heart, CheckCircle2, Clock, Phone, Navigation, AlertCircle, Droplet, Sparkles, Hospital } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BloodGroup } from '../server/compatibility';

interface RequestItem {
  id: string;
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
  status: string;
  notes: string;
}

interface DonorViewProps {
  donorProfile: {
    id: string;
    name: string;
    bloodGroup: BloodGroup;
    phone: string;
    email: string;
    isAvailable: boolean;
    totalDonations: number;
    badge: string;
  };
  requests: RequestItem[];
  onToggleAvailability: (isAvailable: boolean) => void;
  onRespondToRequest: (requestId: string) => void;
}

export const DonorView: React.FC<DonorViewProps> = ({
  donorProfile,
  requests,
  onToggleAvailability,
  onRespondToRequest,
}) => {
  const [isAvailable, setIsAvailable] = useState(donorProfile.isAvailable);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const handleToggle = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    onToggleAvailability(next);
  };

  const handleAccept = (reqId: string) => {
    setRespondingId(reqId);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#F97316', '#10B981', '#FFFFFF'],
    });
    onRespondToRequest(reqId);
    setTimeout(() => setRespondingId(null), 1000);
  };

  // Find incoming requests matching this donor (compatible with O- or donor's bloodGroup)
  const incomingEmergencyRequests = requests.filter(
    (r) => r.status === 'OPEN' || r.status === 'MATCHED'
  );

  return (
    <div className="space-y-6">
      {/* Donor Profile Spotlight Card */}
      <div className="clay-card p-6 border border-orange-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-red-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            {donorProfile.bloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-neutral-900">{donorProfile.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold flex items-center gap-1">
                <Award className="w-3 h-3 text-orange-600" /> {donorProfile.badge}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Voluntary Donor • Universal Red Cell Match (O-)
            </p>
          </div>
        </div>

        {/* Live Availability Toggle Button */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-neutral-800">
              {isAvailable ? 'Status: On-Call (Ready)' : 'Status: Offline (Paused)'}
            </div>
            <div className="text-[10px] text-neutral-400">
              {isAvailable ? 'Receiving emergency broadcasts' : 'Alert notifications muted'}
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-ping' : 'bg-neutral-500'}`}
            ></span>
            {isAvailable ? 'Available Now' : 'Go On-Call'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clay-card p-4 border border-orange-100 text-center">
          <div className="text-2xl font-black text-neutral-900">{donorProfile.totalDonations}</div>
          <div className="text-xs text-neutral-500 font-medium mt-0.5">Verified Donations</div>
        </div>
        <div className="clay-card p-4 border border-orange-100 text-center">
          <div className="text-2xl font-black text-orange-600">{donorProfile.totalDonations * 3}</div>
          <div className="text-xs text-neutral-500 font-medium mt-0.5">Estimated Lives Saved</div>
        </div>
        <div className="clay-card p-4 border border-orange-100 text-center">
          <div className="text-2xl font-black text-emerald-600">56 Days</div>
          <div className="text-xs text-neutral-500 font-medium mt-0.5">Interval Gap Clear</div>
        </div>
        <div className="clay-card p-4 border border-orange-100 text-center">
          <div className="text-2xl font-black text-neutral-900">4.9 ★</div>
          <div className="text-xs text-neutral-500 font-medium mt-0.5">Reliability Rating</div>
        </div>
      </div>

      {/* Incoming Emergency Requests in Radius */}
      <div className="clay-card p-6 border border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              Live Dispatch Radar
            </div>
            <h3 className="text-lg font-black text-neutral-900">
              Emergency Broadcasts Matching Your Blood Group ({incomingEmergencyRequests.length})
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Within 15 km radius</span>
        </div>

        <div className="space-y-3">
          {incomingEmergencyRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-white border border-orange-200/80 hover:border-orange-400 shadow-sm transition flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
                  {req.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-neutral-900">{req.patientName}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-black uppercase ${
                        req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {req.urgency}
                    </span>
                    <span className="text-xs text-neutral-500">
                      • {req.unitsRequired} Units ({req.component})
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5 text-orange-500" />
                    <strong>{req.hospitalName}</strong> — {req.hospitalAddress}
                  </p>
                  {req.notes && (
                    <p className="text-[11px] text-neutral-400 italic mt-0.5">"{req.notes}"</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${req.contactPhone}`}
                  className="clay-btn-white px-3.5 py-2 text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Hospital
                </a>
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={respondingId === req.id}
                  className="clay-btn-orange px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Accept & Go En Route (ETA 15m)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Donation Checklist Card */}
      <div className="clay-card p-6 border border-orange-100">
        <h4 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" /> Voluntary Donor Readiness Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/50">
            <div className="font-bold text-neutral-800 mb-1">💧 Hydrate Generously</div>
            <div className="text-neutral-500">
              Drink 16-24 oz (500-750 ml) of water 2-3 hours before visiting the center to promote vascular volume.
            </div>
          </div>
          <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/50">
            <div className="font-bold text-neutral-800 mb-1">🥗 Iron-Rich Meal</div>
            <div className="text-neutral-500">
              Enjoy a healthy meal with spinach, beans, or lean protein. Avoid fatty fried foods right before screening.
            </div>
          </div>
          <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/50">
            <div className="font-bold text-neutral-800 mb-1">🪪 Government Photo ID</div>
            <div className="text-neutral-500">
              Bring your driver’s license or passport and your digital BloodConnect verification badge.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
