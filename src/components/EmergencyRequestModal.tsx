import React, { useState } from 'react';
import { X, AlertCircle, Heart, Hospital, Phone, User, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BloodGroup, BloodComponent, getCompatibleDonorGroups } from '../server/compatibility';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newRequest: any) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS: BloodComponent[] = [
  'Whole Blood',
  'Packed Red Cells',
  'Platelets',
  'Fresh Frozen Plasma',
];

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('32');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('Packed Red Cells');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [urgency, setUrgency] = useState<'CRITICAL' | 'URGENT' | 'STANDARD'>('CRITICAL');
  const [hospitalName, setHospitalName] = useState('UCSF Medical Center - Parnassus');
  const [hospitalAddress, setHospitalAddress] = useState('505 Parnassus Ave, San Francisco, CA');
  const [contactPhone, setContactPhone] = useState('(415) 555-0199');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const compatibleGroups = getCompatibleDonorGroups(bloodGroup, component);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please enter the patient’s name.');
      return;
    }
    if (!hospitalName.trim()) {
      setErrorMsg('Please enter the hospital name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'user-recipient-demo',
          recipientName: 'Family Coordinator',
          patientName,
          patientAge: Number(patientAge),
          bloodGroup,
          component,
          unitsRequired: Number(unitsRequired),
          urgency,
          hospitalName,
          hospitalAddress,
          lat: 37.7631, // UCSF default coordinates
          lng: -122.4578,
          contactPhone,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F97316', '#EA580C', '#EF4444', '#FFFFFF'],
        });
        onSubmitSuccess(data.request);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to broadcast request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl clay-card border border-orange-200 shadow-2xl p-6 sm:p-8 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              Emergency Broadcast Protocol
            </div>
            <h3 className="text-2xl font-black text-neutral-900">
              Create Emergency Blood Request
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Instantly broadcast alerts to compatible registered donors and certified blood bank dispatch centers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Urgency Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Urgency Classification
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'CRITICAL',
                  label: 'Critical (Under 2 hrs)',
                  desc: 'Trauma, ICU, Hemorrhage',
                  bg: 'hover:border-red-500',
                  active: 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30',
                },
                {
                  id: 'URGENT',
                  label: 'Urgent (Within 6 hrs)',
                  desc: 'Scheduled Emergency Surgery',
                  bg: 'hover:border-orange-500',
                  active: 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30',
                },
                {
                  id: 'STANDARD',
                  label: 'Standard (Within 24 hrs)',
                  desc: 'Transfusion preparation',
                  bg: 'hover:border-amber-500',
                  active: 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/30',
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setUrgency(item.id as any)}
                  className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                    urgency === item.id
                      ? item.active
                      : `bg-neutral-50/80 border-neutral-200 text-neutral-700 ${item.bg}`
                  }`}
                >
                  <div className="font-black text-sm">{item.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Blood Group & Component Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                Patient Blood Group Required
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((grp) => (
                  <button
                    type="button"
                    key={grp}
                    onClick={() => setBloodGroup(grp)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      bloodGroup === grp
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 border-2 border-white'
                        : 'bg-neutral-100 hover:bg-orange-50 text-neutral-800 border border-neutral-200'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-neutral-500">
                Compatible donor groups: <span className="font-bold text-orange-700">{compatibleGroups.join(', ')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                Blood Component & Units
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value as BloodComponent)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-semibold bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
              >
                {COMPONENTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-600">Units Required:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitsRequired((u) => Math.max(1, u - 1))}
                    className="w-8 h-8 rounded-lg bg-neutral-200 hover:bg-neutral-300 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-sm text-neutral-900">
                    {unitsRequired}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnitsRequired((u) => Math.min(10, u + 1))}
                    className="w-8 h-8 rounded-lg bg-neutral-200 hover:bg-neutral-300 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Patient Age (Years)
              </label>
              <input
                type="number"
                placeholder="32"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Hospital / Transfusion Center Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UCSF Medical Center"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="(415) 555-0199"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Hospital Address / Ward / Room Details
            </label>
            <input
              type="text"
              placeholder="e.g. 505 Parnassus Ave, Trauma Ward 4B, Bed 12"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Clinical Notes / Specific Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Cross-match specimen already drawn. Attending physician Dr. Michael."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-btn-orange px-6 py-2.5 text-xs font-bold text-white flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Broadcasting to Network...</span>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span>Broadcast Emergency Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
