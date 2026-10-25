import React, { useState } from 'react';
import { Hospital, AlertTriangle, ShieldCheck, Plus, Minus, RefreshCw, Phone, Droplet, Radio } from 'lucide-react';
import { BloodGroup } from '../server/compatibility';

interface BloodBankItem {
  id: string;
  name: string;
  licenseNumber: string;
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
  lastInventoryAudit: string;
}

interface BloodBankViewProps {
  bloodBanks: BloodBankItem[];
  onUpdateInventory: (bankId: string, group: BloodGroup, delta: number) => void;
  onRequestBlood: () => void;
}

export const BloodBankView: React.FC<BloodBankViewProps> = ({
  bloodBanks,
  onUpdateInventory,
  onRequestBlood,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(
    bloodBanks[0]?.id || 'bb-ucsf-parnassus'
  );

  const selectedBank = bloodBanks.find((b) => b.id === selectedBankId) || bloodBanks[0];
  if (!selectedBank) return null;

  const bloodGroupList: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="space-y-6">
      {/* Header and Blood Bank Selector */}
      <div className="clay-card p-6 border border-orange-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <Hospital className="w-4 h-4 text-orange-600" />
            Certified Blood Bank & Depot Operations
          </div>
          <h2 className="text-2xl font-black text-neutral-900">
            Real-Time Reserve Inventory Management
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Track real-time whole blood, platelet apheresis, and fresh frozen plasma units with automated shortage triggers.
          </p>
        </div>

        {/* Center Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-neutral-600">Active Depot:</label>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {bloodBanks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Depot Info Card */}
      <div className="clay-card p-6 border border-orange-100">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-neutral-900">{selectedBank.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> License #{selectedBank.licenseNumber}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {selectedBank.address}, {selectedBank.city} • 24/7 Trauma Dispatch
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${selectedBank.emergencyHotline}`}
              className="clay-btn-orange px-4 py-2 text-xs text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Phone className="w-3.5 h-3.5" /> Emergency Hotline: {selectedBank.emergencyHotline}
            </a>
          </div>
        </div>

        {/* Inventory Units Table & Controls */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700">
              Red Blood Cells & Whole Blood Reserves
            </h4>
            <span className="text-[11px] text-neutral-400">
              Last synced: {new Date(selectedBank.lastInventoryAudit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {bloodGroupList.map((group) => {
              const units = selectedBank.inventory[group] || 0;
              const isCritical = units < 5;
              const isOptimal = units >= 15;

              return (
                <div
                  key={group}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCritical
                      ? 'bg-red-50/80 border-red-300 text-red-950 shadow-sm'
                      : isOptimal
                      ? 'bg-white border-orange-200/80'
                      : 'bg-orange-50/40 border-orange-200/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black">{group}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCritical
                          ? 'bg-red-600 text-white animate-pulse'
                          : isOptimal
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {isCritical ? 'CRITICAL LOW' : isOptimal ? 'OPTIMAL' : 'ADEQUATE'}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-neutral-900 mb-3">
                    {units} <span className="text-xs font-normal text-neutral-500">Units</span>
                  </div>

                  {/* Increment/Decrement Units */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5">
                    <button
                      onClick={() => onUpdateInventory(selectedBank.id, group, -1)}
                      disabled={units <= 0}
                      className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-neutral-400">Audit</span>
                    <button
                      onClick={() => onUpdateInventory(selectedBank.id, group, 1)}
                      className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isCritical && (
                    <button
                      onClick={onRequestBlood}
                      className="mt-2.5 w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Radio className="w-3 h-3 animate-ping" /> Alert Donors
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Component Reserves (Platelets & Plasma) */}
          <div className="mt-6 pt-5 border-t border-orange-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-orange-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase">
                  Platelets (Apheresis Units)
                </span>
                <div className="text-2xl font-black text-neutral-900 mt-1">
                  {selectedBank.plateletUnits} Units
                </div>
                <div className="text-[11px] text-neutral-400">Shelf life: 5-7 days at room temp agitation</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateInventory(selectedBank.id, 'O-', -1)}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateInventory(selectedBank.id, 'O-', 1)}
                  className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-orange-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase">
                  Fresh Frozen Plasma (FFP)
                </span>
                <div className="text-2xl font-black text-neutral-900 mt-1">
                  {selectedBank.plasmaUnits} Units
                </div>
                <div className="text-[11px] text-neutral-400">Stored at -18°C or colder (1 year shelf life)</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateInventory(selectedBank.id, 'AB+', -1)}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateInventory(selectedBank.id, 'AB+', 1)}
                  className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
