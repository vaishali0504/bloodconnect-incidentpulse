import React, { useState } from 'react';
import { BloodGroup, BloodComponent, RED_CELL_COMPATIBILITY, PLASMA_COMPATIBILITY, PLATELET_COMPATIBILITY } from '../server/compatibility';
import { CheckCircle2, XCircle, Sparkles, HeartPulse, ShieldAlert, ArrowRightLeft } from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const CompatibilityMatrix: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('Whole Blood');
  const [mode, setMode] = useState<'give' | 'receive'>('give');

  const getCompatibleList = () => {
    if (mode === 'receive') {
      if (selectedComponent === 'Fresh Frozen Plasma') return PLASMA_COMPATIBILITY[selectedGroup] || [];
      if (selectedComponent === 'Platelets') return PLATELET_COMPATIBILITY[selectedGroup] || [];
      return RED_CELL_COMPATIBILITY[selectedGroup] || [];
    } else {
      // Who can this selectedGroup give to?
      return BLOOD_GROUPS.filter((target) => {
        if (selectedComponent === 'Fresh Frozen Plasma') {
          return (PLASMA_COMPATIBILITY[target] || []).includes(selectedGroup);
        }
        if (selectedComponent === 'Platelets') {
          return (PLATELET_COMPATIBILITY[target] || []).includes(selectedGroup);
        }
        return (RED_CELL_COMPATIBILITY[target] || []).includes(selectedGroup);
      });
    }
  };

  const compatibleList = getCompatibleList();

  return (
    <div className="clay-card p-6 border border-orange-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <HeartPulse className="w-4 h-4 text-orange-600" />
            Deterministic Clinical Engine
          </div>
          <h3 className="text-xl font-black text-neutral-900">
            Interactive Blood Compatibility Calculator
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified hematological cross-matching rules for red blood cells, platelets, and fresh frozen plasma.
          </p>
        </div>

        {/* Component Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-orange-50 rounded-2xl border border-orange-200/50">
          {(['Whole Blood', 'Packed Red Cells', 'Platelets', 'Fresh Frozen Plasma'] as BloodComponent[]).map(
            (comp) => (
              <button
                key={comp}
                onClick={() => setSelectedComponent(comp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedComponent === comp
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {comp}
              </button>
            )
          )}
        </div>
      </div>

      {/* Mode Toggle: Can Give To vs Can Receive From */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setMode('give')}
          className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            mode === 'give'
              ? 'clay-btn-orange text-white'
              : 'clay-btn-white text-neutral-600'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          I Want to Donate (Who can receive my {selectedGroup}?)
        </button>
        <button
          onClick={() => setMode('receive')}
          className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            mode === 'receive'
              ? 'clay-btn-orange text-white'
              : 'clay-btn-white text-neutral-600'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          I Need Blood (Who can donate to my {selectedGroup}?)
        </button>
      </div>

      {/* Blood Group Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-6">
        {BLOOD_GROUPS.map((group) => {
          const isSelected = selectedGroup === group;
          const isUniversalDonor = group === 'O-';
          const isUniversalRecipient = group === 'AB+';

          return (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`relative py-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105 border-2 border-white'
                  : 'bg-white hover:bg-orange-50 text-neutral-800 border border-orange-100 shadow-sm'
              }`}
            >
              <span className="text-base">{group}</span>
              {isUniversalDonor && (
                <span className="text-[9px] font-bold tracking-tight text-white/90 uppercase mt-0.5">
                  Universal
                </span>
              )}
              {isUniversalRecipient && (
                <span className="text-[9px] font-bold tracking-tight text-white/90 uppercase mt-0.5">
                  Recipient
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Display Grid */}
      <div className="neu-inset p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-neutral-700">
          <span>
            {mode === 'give'
              ? `Compatible Recipients for ${selectedGroup} (${selectedComponent})`
              : `Compatible Donors for ${selectedGroup} (${selectedComponent})`}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[11px]">
            {compatibleList.length} of 8 Blood Groups Match
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BLOOD_GROUPS.map((target) => {
            const isMatch = compatibleList.includes(target);
            return (
              <div
                key={target}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isMatch
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-white/60 border-neutral-200 text-neutral-400 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      isMatch ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {target}
                  </div>
                  <span className="text-xs">
                    {isMatch ? 'Compatible' : 'Incompatible'}
                  </span>
                </div>
                {isMatch ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-neutral-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Fact callout */}
        <div className="mt-4 pt-3 border-t border-orange-200/40 text-xs text-neutral-600 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            {selectedGroup === 'O-' && mode === 'give' && (
              <span>
                <strong>Universal Hero:</strong> O- Negative red cells carry neither A, B, nor Rh antigens, making them life-saving in emergency trauma transfusions before cross-match typing is complete!
              </span>
            )}
            {selectedGroup === 'AB+' && mode === 'receive' && (
              <span>
                <strong>Universal Recipient:</strong> An AB+ patient can safely receive red blood cells from any blood type without an immune response to ABO or Rh antigens.
              </span>
            )}
            {selectedComponent === 'Fresh Frozen Plasma' && (
              <span>
                <strong>Plasma Note:</strong> Plasma compatibility rules are inverted from red blood cells. AB is the universal plasma donor, and O is the universal plasma recipient!
              </span>
            )}
            {selectedGroup !== 'O-' && selectedGroup !== 'AB+' && (
              <span>
                <strong>Matching Algorithm:</strong> In addition to ABO/Rh matching, hospital blood banks perform antibody screening and crossmatching before unit release.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
