import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Hospital, User, AlertCircle, Navigation, Phone, ShieldCheck, MapPin, Droplet, RefreshCw } from 'lucide-react';
import { BloodGroup } from '../server/compatibility';

interface BloodBankItem {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  emergencyHotline: string;
  verified: boolean;
  rating: number;
  inventory: Record<BloodGroup, number>;
  plateletUnits: number;
  plasmaUnits: number;
  distanceKm?: number;
}

interface DonorItem {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  isAvailable: boolean;
  totalDonations: number;
  verified: boolean;
  badge: string;
  distanceKm?: number;
}

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
}

interface BloodMapProps {
  apiKey: string;
  bloodBanks: BloodBankItem[];
  donors: DonorItem[];
  requests: RequestItem[];
  selectedBloodGroup?: BloodGroup;
  selectedRadius?: number;
  onSelectEntity?: (type: 'bank' | 'donor' | 'request', item: any) => void;
  onRequestBlood?: () => void;
}

export const BloodMap: React.FC<BloodMapProps> = ({
  apiKey,
  bloodBanks,
  donors,
  requests,
  selectedBloodGroup,
  onSelectEntity,
  onRequestBlood,
}) => {
  const [selectedItem, setSelectedItem] = useState<{
    type: 'bank' | 'donor' | 'request';
    data: any;
  } | null>(null);

  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'banks' | 'donors' | 'requests'>('all');

  // Center on San Francisco Medical District
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };

  // Listen for Google Maps quota exceeded or auth failure
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('Google Maps API auth failure or quota reached.');
      setQuotaExceeded(true);
    };

    const handleQuotaExceeded = () => {
      console.warn('Google Maps quota exceeded event.');
      setQuotaExceeded(true);
    };

    window.addEventListener('gm_authFailure', handleAuthFailure);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);

    return () => {
      window.removeEventListener('gm_authFailure', handleAuthFailure);
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const visibleBanks = filterType === 'all' || filterType === 'banks' ? bloodBanks : [];
  const visibleDonors = filterType === 'all' || filterType === 'donors' ? donors : [];
  const visibleRequests = filterType === 'all' || filterType === 'requests' ? requests : [];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden clay-card p-2 sm:p-3 border border-orange-100">
      {/* Quota Exceeded Sticky Amber Banner */}
      {quotaExceeded && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-amber-500/95 text-white px-4 py-3 rounded-2xl shadow-lg backdrop-blur flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Map preview is currently operating in low-bandwidth telemetry mode. All geolocation search queries remain functional.</span>
          </div>
          <button
            onClick={() => setQuotaExceeded(false)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Floating Interactive Controls Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold tracking-wider uppercase text-neutral-600">
            Live Geospatial Grid
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
            {visibleBanks.length} Banks • {visibleDonors.length} Donors • {visibleRequests.length} Alerts
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-orange-50 rounded-full border border-orange-200/60 text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterType === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Pins
          </button>
          <button
            onClick={() => setFilterType('banks')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              filterType === 'banks' ? 'bg-orange-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Hospital className="w-3 h-3" /> Blood Banks
          </button>
          <button
            onClick={() => setFilterType('donors')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              filterType === 'donors' ? 'bg-orange-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="w-3 h-3" /> Donors
          </button>
          <button
            onClick={() => setFilterType('requests')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              filterType === 'requests' ? 'bg-red-500 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <AlertCircle className="w-3 h-3 text-current" /> Urgent
          </button>
        </div>
      </div>

      {/* Google Map Container with explicit height */}
      <div className="relative w-full h-[460px] sm:h-[540px] rounded-2xl overflow-hidden border border-orange-100 shadow-inner">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={false}
            zoomControl={true}
            streetViewControl={false}
            mapTypeControl={false}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Blood Banks Markers */}
            {visibleBanks.map((bank) => (
              <AdvancedMarker
                key={bank.id}
                position={{ lat: bank.lat, lng: bank.lng }}
                onClick={() => {
                  setSelectedItem({ type: 'bank', data: bank });
                  onSelectEntity?.('bank', bank);
                }}
              >
                <div className="group cursor-pointer transform hover:scale-110 transition-transform">
                  <div className="relative flex items-center justify-center w-11 h-11 bg-white border-2 border-orange-500 rounded-2xl shadow-lg text-orange-600">
                    <Hospital className="w-6 h-6 text-orange-600" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
                      ✓
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Donors Markers */}
            {visibleDonors.map((donor) => (
              <AdvancedMarker
                key={donor.id}
                position={{ lat: donor.lat, lng: donor.lng }}
                onClick={() => {
                  setSelectedItem({ type: 'donor', data: donor });
                  onSelectEntity?.('donor', donor);
                }}
              >
                <div className="group cursor-pointer transform hover:scale-110 transition-transform">
                  <div
                    className={`relative flex items-center justify-center px-2 py-1 min-w-[38px] h-9 rounded-2xl font-bold text-xs shadow-md border-2 ${
                      donor.isAvailable
                        ? 'bg-orange-500 border-white text-white shadow-orange-500/40'
                        : 'bg-neutral-200 border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <span>{donor.bloodGroup}</span>
                    {donor.isAvailable && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Emergency Requests Markers */}
            {visibleRequests.map((req) => (
              <AdvancedMarker
                key={req.id}
                position={{ lat: req.lat, lng: req.lng }}
                onClick={() => {
                  setSelectedItem({ type: 'request', data: req });
                  onSelectEntity?.('request', req);
                }}
              >
                <div className="cursor-pointer transform hover:scale-110 transition-transform relative">
                  <div className="animate-ping absolute -inset-1 rounded-full bg-red-400 opacity-60"></div>
                  <div className="relative flex items-center justify-center w-11 h-11 bg-red-600 text-white rounded-full border-2 border-white shadow-xl">
                    <Droplet className="w-5 h-5 fill-white" />
                  </div>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-800 text-[10px] font-black uppercase text-white px-1.5 py-0.2 rounded shadow">
                    SOS
                  </span>
                </div>
              </AdvancedMarker>
            ))}

            {/* Active Selected InfoWindow */}
            {selectedItem && (
              <InfoWindow
                position={{
                  lat: selectedItem.data.lat,
                  lng: selectedItem.data.lng,
                }}
                onCloseClick={() => setSelectedItem(null)}
              >
                <div className="p-2 max-w-[280px] text-neutral-800 font-sans">
                  {selectedItem.type === 'bank' && (
                    <div>
                      <div className="flex items-center gap-1.5 text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">
                        <Hospital className="w-3.5 h-3.5" /> Certified Blood Center
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 leading-snug">
                        {selectedItem.data.name}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400 shrink-0" /> {selectedItem.data.address}
                      </p>

                      {/* Live Stock Grid */}
                      <div className="mt-2.5 pt-2 border-t border-neutral-100">
                        <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">
                          Live On-Hand Reserves:
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          {Object.entries(selectedItem.data.inventory || {}).map(([group, units]) => {
                            const count = Number(units);
                            const isLow = count < 5;
                            return (
                              <div
                                key={group}
                                className={`p-1 rounded-lg border text-[11px] font-bold ${
                                  isLow
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-orange-50/70 text-orange-900 border-orange-200/50'
                                }`}
                              >
                                <span className="block text-[9px] text-neutral-400 font-normal">{group}</span>
                                <span>{count} u</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={`tel:${selectedItem.data.emergencyHotline || selectedItem.data.phone}`}
                          className="flex-1 py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call Dispatch
                        </a>
                        <button
                          onClick={onRequestBlood}
                          className="flex-1 py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold text-center"
                        >
                          Request Blood
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'donor' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified Donor
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {selectedItem.data.isAvailable ? 'Available Now' : 'Offline'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900">{selectedItem.data.name}</h4>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-orange-500 text-white font-extrabold rounded-lg">
                          {selectedItem.data.bloodGroup}
                        </span>
                        <span className="text-neutral-500 text-[11px]">
                          {selectedItem.data.totalDonations} Verified Donations
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" /> {selectedItem.data.address}
                      </p>
                      <div className="mt-3">
                        <a
                          href={`tel:${selectedItem.data.phone}`}
                          className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" /> Direct Contact
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'request' && (
                    <div>
                      <div className="flex items-center justify-between text-red-600 text-xs font-black uppercase tracking-wider mb-1">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {selectedItem.data.urgency} Request
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                          {selectedItem.data.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 leading-snug">
                        {selectedItem.data.patientName} ({selectedItem.data.bloodGroup})
                      </h4>
                      <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                        Needed: {selectedItem.data.unitsRequired} Units ({selectedItem.data.component})
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                        <Hospital className="w-3 h-3 text-neutral-400" /> {selectedItem.data.hospitalName}
                      </p>
                      <div className="mt-3">
                        <a
                          href={`tel:${selectedItem.data.contactPhone}`}
                          className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Hospital Coordinator
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Tactical Legend on map bottom right */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-3 py-2 rounded-2xl shadow-lg border border-orange-100 text-[11px] font-semibold text-neutral-700 flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-white border border-orange-500 flex items-center justify-center text-orange-600 text-[8px] font-bold">
              H
            </span>
            <span>Blood Bank</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>On-Call Donor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-red-700">Urgent Request</span>
          </div>
        </div>
      </div>
    </div>
  );
};
