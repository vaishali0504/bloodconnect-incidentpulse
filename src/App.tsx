import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Heart,
  Hospital,
  User,
  ShieldCheck,
  AlertCircle,
  Phone,
  Search,
  MapPin,
  Bot,
  Bell,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { BloodMap } from './components/BloodMap';
import { CompatibilityMatrix } from './components/CompatibilityMatrix';
import { EmergencyRequestModal } from './components/EmergencyRequestModal';
import { PulseAIAssistant } from './components/PulseAIAssistant';
import { RecipientView } from './components/RecipientView';
import { DonorView } from './components/DonorView';
import { BloodBankView } from './components/BloodBankView';
import { AdminAuditView } from './components/AdminAuditView';
import { IncidentPulseWorkspace } from './components/IncidentPulseWorkspace';
import { BloodGroup, BloodComponent } from './server/compatibility';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

type TabType = 'map' | 'recipient' | 'donor' | 'bank' | 'compatibility' | 'admin' | 'incidentpulse';
type RoleType = 'recipient' | 'donor' | 'bloodBankStaff' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [currentRole, setCurrentRole] = useState<RoleType>('recipient');

  // Modal states
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);

  // Platform Data
  const [stats, setStats] = useState({
    activeRequests: 3,
    fulfilledRequests: 4,
    livesSavedEstimate: 260,
    availableDonors: 7,
    totalRegisteredDonors: 8,
    certifiedBloodBanks: 5,
    totalInventoryUnits: 342,
    emergencyAverageResponseMinutes: 14,
  });

  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedBloodGroupFilter, setSelectedBloodGroupFilter] = useState<BloodGroup | undefined>(undefined);
  const [selectedRadius, setSelectedRadius] = useState<number>(25);

  const [isLoading, setIsLoading] = useState(true);
  const isIncidentPulseActive = activeTab === 'incidentpulse';

  // Current Donor Profile for demo
  const [currentDonor, setCurrentDonor] = useState({
    id: 'donor-1',
    name: 'Elena Rostova',
    bloodGroup: 'O-' as BloodGroup,
    phone: '(415) 555-0192',
    email: 'elena.rostova@gmail.com',
    isAvailable: true,
    totalDonations: 14,
    badge: 'Gold Hero',
  });

  const fetchData = async () => {
    try {
      const [statsRes, banksRes, donorsRes, requestsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch(`/api/blood-banks?radius=${selectedRadius}${selectedBloodGroupFilter ? `&bloodGroup=${selectedBloodGroupFilter}` : ''}`),
        fetch(`/api/donors?radius=${selectedRadius}${selectedBloodGroupFilter ? `&bloodGroup=${selectedBloodGroupFilter}` : ''}`),
        fetch('/api/requests'),
      ]);

      const [statsData, banksData, donorsData, requestsData] = await Promise.all([
        statsRes.json(),
        banksRes.json(),
        donorsRes.json(),
        requestsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (banksData.success) setBloodBanks(banksData.bloodBanks || []);
      if (donorsData.success) setDonors(donorsData.donors || []);
      if (requestsData.success) setRequests(requestsData.requests || []);
    } catch (e) {
      console.warn('Failed to load live data, using offline fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBloodGroupFilter, selectedRadius]);

  const handleToggleDonorAvailability = async (isAvailable: boolean) => {
    setCurrentDonor((prev) => ({ ...prev, isAvailable }));
    try {
      await fetch(`/api/donors/${currentDonor.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      fetchData();
    } catch (e) {
      console.warn('Failed to update availability:', e);
    }
  };

  const handleRespondToRequest = async (requestId: string) => {
    try {
      await fetch(`/api/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: currentDonor.id,
          donorName: currentDonor.name,
          bloodGroup: currentDonor.bloodGroup,
          phone: currentDonor.phone,
          etaMinutes: 15,
        }),
      });
      fetchData();
    } catch (e) {
      console.warn('Failed to respond to request:', e);
    }
  };

  const handleUpdateBankInventory = async (bankId: string, group: BloodGroup, delta: number) => {
    const bank = bloodBanks.find((b) => b.id === bankId);
    if (!bank) return;
    const currentUnits = bank.inventory[group] || 0;
    const nextUnits = Math.max(0, currentUnits + delta);

    // Optimistic UI update
    setBloodBanks((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? { ...b, inventory: { ...b.inventory, [group]: nextUnits } }
          : b
      )
    );

    try {
      await fetch(`/api/blood-banks/${bankId}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup: group,
          units: nextUnits,
        }),
      });
      fetchData();
    } catch (e) {
      console.warn('Failed to update inventory:', e);
    }
  };

  const handleRequestCreated = (newReq: any) => {
    setRequests((prev) => [newReq, ...prev]);
    setActiveTab('recipient');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#252525] flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-900">
      {/* Top Emergency Ticker Alert */}
      {!isIncidentPulseActive && <aside aria-label="Urgent Broadcast" className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white text-xs py-2 px-4 shadow-sm flex items-center justify-between font-bold">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0"></span>
          <span className="uppercase tracking-wider font-black text-[10px] bg-black/25 px-2 py-0.5 rounded">
            Live Priority Dispatch
          </span>
          <span className="truncate">
            UCSF Benioff Children's Hospital: 3 Units of O- Negative urgently needed for trauma surgery.
          </span>
        </div>
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="shrink-0 ml-3 underline hover:text-white/80 cursor-pointer text-xs"
        >
          View Alert →
        </button>
      </aside>}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FFF8F3]/90 backdrop-blur-md border-b border-orange-100/80 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30">
              <Droplet className="w-6 h-6 fill-white" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-neutral-900 font-serif">
                  Blood<span className="text-orange-600">Connect</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase">
                  AI-Powered
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                Emergency Blood Bank & Voluntary Donor Network
              </p>
            </div>
          </div>

          {/* Persona / Role Switcher for seamless demo testing */}
          <div className="hidden lg:flex items-center gap-2 p-1 bg-white rounded-full border border-orange-200/80 shadow-sm text-xs font-semibold">
            <span className="px-2.5 text-neutral-400 text-[11px]">Role:</span>
            {[
              { id: 'recipient', label: 'Recipient' },
              { id: 'donor', label: 'Donor (Elena, O-)' },
              { id: 'bloodBankStaff', label: 'Hospital Staff' },
              { id: 'admin', label: 'Admin' },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setCurrentRole(role.id as any);
                  if (role.id === 'recipient') setActiveTab('recipient');
                  if (role.id === 'donor') setActiveTab('donor');
                  if (role.id === 'bloodBankStaff') setActiveTab('bank');
                  if (role.id === 'admin') setActiveTab('admin');
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  currentRole === role.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask PulseAI Button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="clay-btn-white px-3.5 py-2 text-xs font-bold text-neutral-700 flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">PulseAI</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="clay-btn-orange px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-black text-white flex items-center gap-2 shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>Emergency Request</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'map', label: 'Live Map & Search', icon: MapPin },
            { id: 'recipient', label: 'Recipient Dashboard', icon: Droplet },
            { id: 'donor', label: 'Voluntary Donor Portal', icon: Heart },
            { id: 'bank', label: 'Blood Bank Inventory', icon: Hospital },
            { id: 'compatibility', label: 'Compatibility Matrix', icon: Sparkles },
            { id: 'admin', label: 'Compliance & Audit', icon: ShieldCheck },
            { id: 'incidentpulse', label: 'IncidentPulse AI', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white/80 hover:bg-white text-neutral-600 border border-orange-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Hero Stats Ribbon */}
      {!isIncidentPulseActive && <section className="bg-gradient-to-b from-[#FFF5EE] to-[#FFF8F3] border-b border-orange-100 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="clay-card p-3 border border-orange-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-900 leading-none">
                {stats.livesSavedEstimate}
              </div>
              <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">Lives Saved Estimate</div>
            </div>
          </div>

          <div className="clay-card p-3 border border-orange-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-900 leading-none">
                {stats.availableDonors} <span className="text-xs text-neutral-400 font-normal">/ {stats.totalRegisteredDonors}</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">Donors On-Call Now</div>
            </div>
          </div>

          <div className="clay-card p-3 border border-orange-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Hospital className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-900 leading-none">
                {stats.totalInventoryUnits} <span className="text-xs text-neutral-400 font-normal">Units</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">Tracked Blood Reserves</div>
            </div>
          </div>

          <div className="clay-card p-3 border border-orange-100/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-900 leading-none">
                {stats.emergencyAverageResponseMinutes} <span className="text-xs text-neutral-400 font-normal">min</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">Avg Response Dispatch</div>
            </div>
          </div>
        </div>
      </section>}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {/* TAB 1: LIVE MAP & PROXIMITY SEARCH */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="clay-card p-4 sm:p-5 border border-orange-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
                  Target Blood Group:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setSelectedBloodGroupFilter(undefined)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedBloodGroupFilter === undefined
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    All Groups
                  </button>
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((grp) => (
                    <button
                      key={grp}
                      onClick={() => setSelectedBloodGroupFilter(grp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        selectedBloodGroupFilter === grp
                          ? 'bg-orange-500 text-white shadow-md border-2 border-white'
                          : 'bg-neutral-100 hover:bg-orange-50 text-neutral-800'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-neutral-600">Radius:</label>
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="p-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>
              </div>
            </div>

            {/* Interactive Google Map */}
            <BloodMap
              apiKey={GOOGLE_MAPS_KEY}
              bloodBanks={bloodBanks}
              donors={donors}
              requests={requests}
              selectedBloodGroup={selectedBloodGroupFilter}
              selectedRadius={selectedRadius}
              onRequestBlood={() => setIsEmergencyModalOpen(true)}
            />

            {/* Bottom 2-column detail lists: Certified Blood Banks & Available Donors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Certified Blood Banks List */}
              <div className="clay-card p-6 border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-neutral-800">
                    <Hospital className="w-4 h-4 text-orange-600" />
                    <span>Regional Certified Blood Banks ({bloodBanks.length})</span>
                  </div>
                  <span className="text-xs text-neutral-400">Real-Time Inventory</span>
                </div>

                <div className="space-y-3">
                  {bloodBanks.map((bank) => (
                    <div
                      key={bank.id}
                      className="p-3.5 bg-white border border-orange-100 rounded-2xl hover:border-orange-300 transition text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm">{bank.name}</h4>
                          <p className="text-neutral-500 mt-0.5">{bank.address}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-full text-[10px] shrink-0">
                          {bank.distanceKm ? `${bank.distanceKm} km away` : 'Regional Center'}
                        </span>
                      </div>

                      {/* Stock pill preview */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(bank.inventory || {})
                          .slice(0, 4)
                          .map(([grp, units]) => (
                            <span
                              key={grp}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                Number(units) < 5
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {grp}: {Number(units)} u
                            </span>
                          ))}
                        <span className="text-[10px] text-neutral-400 self-center">
                          +{Object.keys(bank.inventory || {}).length - 4} more
                        </span>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500 font-medium">Hotline: {bank.emergencyHotline}</span>
                        <a
                          href={`tel:${bank.emergencyHotline}`}
                          className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call Center
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Voluntary Donors List */}
              <div className="clay-card p-6 border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-neutral-800">
                    <Heart className="w-4 h-4 text-orange-600 fill-orange-500" />
                    <span>Verified Voluntary Donors Nearby ({donors.length})</span>
                  </div>
                  <span className="text-xs text-neutral-400">5-25 km Range</span>
                </div>

                <div className="space-y-3">
                  {donors.map((donor) => (
                    <div
                      key={donor.id}
                      className="p-3.5 bg-white border border-orange-100 rounded-2xl hover:border-orange-300 transition text-xs flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                            <span>{donor.name}</span>
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                              Verified
                            </span>
                          </div>
                          <div className="text-neutral-500 mt-0.5">
                            {donor.address} • {donor.totalDonations} Donations
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-emerald-600">
                          {donor.isAvailable ? 'Available Now' : 'Offline'}
                        </span>
                        <a
                          href={`tel:${donor.phone}`}
                          className="mt-1 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Contact
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECIPIENT DASHBOARD */}
        {activeTab === 'recipient' && (
          <RecipientView
            requests={requests}
            onRequestBlood={() => setIsEmergencyModalOpen(true)}
            onRefresh={fetchData}
          />
        )}

        {/* TAB 3: DONOR DASHBOARD */}
        {activeTab === 'donor' && (
          <DonorView
            donorProfile={currentDonor}
            requests={requests}
            onToggleAvailability={handleToggleDonorAvailability}
            onRespondToRequest={handleRespondToRequest}
          />
        )}

        {/* TAB 4: BLOOD BANK DASHBOARD */}
        {activeTab === 'bank' && (
          <BloodBankView
            bloodBanks={bloodBanks}
            onUpdateInventory={handleUpdateBankInventory}
            onRequestBlood={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {/* TAB 5: COMPATIBILITY MATRIX */}
        {activeTab === 'compatibility' && <CompatibilityMatrix />}

        {/* TAB 6: ADMIN & AUDIT */}
        {activeTab === 'admin' && <AdminAuditView />}

        {/* TAB 7: INCIDENTPULSE AI */}
        {activeTab === 'incidentpulse' && <IncidentPulseWorkspace />}
      </main>

      {/* Floating PulseAI Trigger Button */}
      {!isIncidentPulseActive && <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 clay-btn-orange p-3.5 sm:px-5 sm:py-3.5 rounded-full text-white font-bold text-xs flex items-center gap-2.5 shadow-2xl cursor-pointer"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
        </div>
        <span className="hidden sm:inline">Ask PulseAI Assistant</span>
      </button>}

      {/* Modals */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSubmitSuccess={handleRequestCreated}
      />

      <PulseAIAssistant
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        userBloodGroup={currentDonor.bloodGroup}
        userRole={currentRole}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-orange-100 bg-white/70 py-6 px-4 sm:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs">
              BC
            </div>
            <span className="font-bold text-neutral-800">{isIncidentPulseActive ? 'IncidentPulse AI' : 'BloodConnect Platform'}</span>
            <span>• Powered by Google Maps Platform & Gemini AI</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy & HIPAA Compliant</span>
            <span>•</span>
            <span>Deterministic Cross-Match Engine</span>
            <span>•</span>
            <span>24/7 Regional Emergency Dispatch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
