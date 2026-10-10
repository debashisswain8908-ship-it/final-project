import React, { useState } from 'react';
import { BRSRReport, UserAccount, AuditEntry } from '../types/brsr';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Edit3, 
  Save, 
  History, 
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface DisclosuresTabProps {
  report: BRSRReport;
  currentUser: UserAccount;
  auditLogs: AuditEntry[];
  onOpenAuthModal: () => void;
  onUpdateField: (
    section: 'sectionA' | 'sectionB' | 'sectionC',
    field: string,
    value: string | number | boolean,
    fieldLabel: string,
    justification?: string
  ) => void;
}

export const DisclosuresTab: React.FC<DisclosuresTabProps> = ({
  report,
  currentUser,
  auditLogs,
  onOpenAuthModal,
  onUpdateField
}) => {
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C'>('C');
  const [activePrinciple, setActivePrinciple] = useState<number>(6); // Default to P6 (Environment)

  // Map of which fields are unlocked via password
  // Key format: `${section}.${field}`, e.g. "sectionA.turnoverCr"
  const [unlockedFields, setUnlockedFields] = useState<Record<string, boolean>>({});

  // Password verification modal state
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    section: 'sectionA' | 'sectionB' | 'sectionC';
    field: string;
    label: string;
    currentVal: string | number | boolean;
    unit?: string;
  } | null>(null);

  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [unlockAllSession, setUnlockAllSession] = useState(false);

  // Re-change modal state (once field is unlocked)
  const [rechangeTarget, setRechangeTarget] = useState<{
    section: 'sectionA' | 'sectionB' | 'sectionC';
    field: string;
    label: string;
    currentVal: string | number | boolean;
    unit?: string;
  } | null>(null);
  const [rechangeNewValue, setRechangeNewValue] = useState<string>('');
  const [rechangeNote, setRechangeNote] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);

  const canEditRole = (currentUser.role === 'reporter' || currentUser.role === 'analyst') && !report.metadata.isLocked;

  // Open password unlock prompt for a specific field
  const handleRequestUnlock = (
    section: 'sectionA' | 'sectionB' | 'sectionC',
    field: string,
    label: string,
    currentVal: string | number | boolean,
    unit?: string
  ) => {
    if (!canEditRole) {
      onOpenAuthModal();
      return;
    }

    const fieldKey = `${section}.${field}`;
    if (unlockedFields[fieldKey]) {
      // Already unlocked, open re-change editor directly
      setRechangeTarget({ section, field, label, currentVal, unit });
      setRechangeNewValue(String(currentVal));
      setRechangeNote('');
      return;
    }

    // Open password entry modal
    setPasswordModal({
      isOpen: true,
      section,
      field,
      label,
      currentVal,
      unit
    });
    setEnteredPassword('');
    setPasswordError(null);
    setUnlockAllSession(false);
  };

  // Verify password and unlock the entry point
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModal) return;

    const expectedPassword = currentUser.password || 'reporter2025';
    const expectedPin = currentUser.securityPin || '7741';

    const inputTrimmed = enteredPassword.trim();
    const isCorrect = inputTrimmed === expectedPassword || inputTrimmed === expectedPin;

    if (!isCorrect) {
      setPasswordError(`Invalid password or PIN. Only authorized credentials for ${currentUser.name} can unlock this field.`);
      return;
    }

    // Success: Unlock the field(s)
    const fieldKey = `${passwordModal.section}.${passwordModal.field}`;
    
    if (unlockAllSession) {
      // Unlock all fields for this session
      const allUnlocked: Record<string, boolean> = { ...unlockedFields };
      allUnlocked['*'] = true;
      allUnlocked[fieldKey] = true;
      setUnlockedFields(allUnlocked);
      setNotification(`Authenticated! All data entry points unlocked for ${currentUser.name}.`);
    } else {
      setUnlockedFields((prev) => ({ ...prev, [fieldKey]: true }));
      setNotification(`Password verified! Unlocked "${passwordModal.label}" for data entry.`);
    }

    // Open the re-change editor for this field
    setRechangeTarget({
      section: passwordModal.section,
      field: passwordModal.field,
      label: passwordModal.label,
      currentVal: passwordModal.currentVal,
      unit: passwordModal.unit
    });
    setRechangeNewValue(String(passwordModal.currentVal));
    setRechangeNote('');

    setPasswordModal(null);
    setTimeout(() => setNotification(null), 4000);
  };

  // Lock a single field back
  const handleLockField = (section: string, field: string) => {
    const fieldKey = `${section}.${field}`;
    setUnlockedFields((prev) => {
      const updated = { ...prev };
      delete updated[fieldKey];
      delete updated['*'];
      return updated;
    });
  };

  // Lock all fields
  const handleLockAll = () => {
    setUnlockedFields({});
    setNotification('All data entry points locked.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Submit re-change once unlocked
  const submitRechange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechangeTarget) return;

    let finalVal: string | number | boolean = rechangeNewValue;
    if (typeof rechangeTarget.currentVal === 'number') {
      finalVal = parseFloat(rechangeNewValue) || 0;
    } else if (typeof rechangeTarget.currentVal === 'boolean') {
      finalVal = rechangeNewValue === 'true';
    }

    onUpdateField(
      rechangeTarget.section,
      rechangeTarget.field,
      finalVal,
      rechangeTarget.label,
      rechangeNote || 'Re-changed after password unlock'
    );

    setNotification(`Successfully updated "${rechangeTarget.label}" to ${finalVal}`);
    setTimeout(() => setNotification(null), 4000);
    setRechangeTarget(null);
  };

  const isFieldUnlocked = (section: string, field: string) => {
    return !!(unlockedFields['*'] || unlockedFields[`${section}.${field}`]);
  };

  // Real-time calculated impacts
  const totalEmissions = report.sectionC.p6_scope1DirectEmissionsMtCo2e + report.sectionC.p6_scope2IndirectEmissionsMtCo2e;
  const emissionsIntensity = (totalEmissions / report.sectionA.turnoverCr).toFixed(2);
  const femalePercentage = ((report.sectionA.femaleEmployees / report.sectionA.totalEmployees) * 100).toFixed(1);
  const waterRecyclePercentage = ((report.sectionC.p6_waterRecycledKl / report.sectionC.p6_waterWithdrawalKl) * 100).toFixed(1);

  const principlesList = [
    { num: 1, name: 'P1: Ethics & Integrity', desc: 'Anti-bribery rules, regulatory fines, and honesty standards' },
    { num: 2, name: 'P2: Sustainable Products', desc: 'Eco-friendly goods, recycled materials, and life-cycle tests' },
    { num: 3, name: 'P3: Employee Well-being', desc: 'Workplace safety, health insurance, and equal opportunities' },
    { num: 4, name: 'P4: Stakeholder Engagement', desc: 'Listening to local communities, workers, and shareholders' },
    { num: 5, name: 'P5: Human Rights', desc: 'Fair wages, zero child labour, and safe dignity at work' },
    { num: 6, name: 'P6: Environmental Care', desc: 'Carbon emissions, clean energy, water saving, and waste recycling' },
    { num: 7, name: 'P7: Public Policy Advocacy', desc: 'Industry groups, ethical policy lobbying, and trade actions' },
    { num: 8, name: 'P8: Community & CSR Growth', desc: 'Social investments, schools, healthcare, and village aid' },
    { num: 9, name: 'P9: Consumer Protection', desc: 'Truth in labeling, data privacy, and prompt complaint handling' },
  ];

  // Helper component to render each password-protected data entry field
  const renderDataField = (
    section: 'sectionA' | 'sectionB' | 'sectionC',
    field: string,
    label: string,
    value: string | number | boolean,
    description: string,
    unit?: string
  ) => {
    const unlocked = isFieldUnlocked(section, field);

    return (
      <div 
        key={field}
        className={`p-4 rounded-xl border transition-all text-xs ${
          unlocked 
            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div>
            <span className="font-semibold text-slate-800 text-xs block">
              {label}
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              {description}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unlocked ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Unlocked</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleLockField(section, field)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  title="Lock field with password"
                >
                  Lock
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Password Locked</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono tabular-nums text-slate-900">
              {typeof value === 'boolean' 
                ? (value ? 'Yes, Approved' : 'No')
                : (typeof value === 'number' ? value.toLocaleString() : value)}
            </span>
            {unit && <span className="text-xs text-slate-500">{unit}</span>}
          </div>

          <div>
            {unlocked ? (
              <button
                type="button"
                onClick={() => {
                  setRechangeTarget({ section, field, label, currentVal: value, unit });
                  setRechangeNewValue(String(value));
                  setRechangeNote('');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Data</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestUnlock(section, field, label, value, unit)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Unlock with Password</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Password Security Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Password Security System for ESG Data Entry</span>
              <span aria-hidden="true">·</span>
              <span>SEBI BRSR Compliance</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Password-Protected BRSR Data Entry
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Every data point is locked by default. Only authenticated personnel can unlock with their security password/PIN and change the corporate data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canEditRole ? (
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.avatarInitials}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Active: {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Role: {currentUser.role.toUpperCase()} · Key: {currentUser.digitalKeyId}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Read-Only mode. Switch user to Corporate Reporter or Analyst to unlock fields.</span>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="ml-2 px-2.5 py-1 bg-amber-900 text-white rounded font-medium cursor-pointer"
                >
                  Switch User
                </button>
              </div>
            )}

            {Object.keys(unlockedFields).length > 0 && (
              <button
                type="button"
                onClick={handleLockAll}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Lock All Fields
              </button>
            )}
          </div>
        </div>

        {/* Real-time Recalculated Indicators */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Total GHG (Scope 1 + 2)</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {totalEmissions.toLocaleString()} <span className="text-xs font-normal text-slate-500">MT</span>
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Emissions Intensity</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {emissionsIntensity} <span className="text-xs font-normal text-slate-500">MT/₹Cr</span>
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Water Recycled Share</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {waterRecyclePercentage}%
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Female Workforce</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {femalePercentage}%
            </span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-slate-900 text-white text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <span className="text-slate-400 text-[11px]">Operator: {currentUser.name}</span>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection('A')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSection === 'A'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Section A: General Disclosures
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('B')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSection === 'B'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Section B: Governance & Processes
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('C')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSection === 'C'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Section C: 9 ESG Principles
        </button>
      </div>

      {/* SECTION A DATA ENTRY */}
      {activeSection === 'A' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Section A: General Corporate Disclosures
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click "Unlock with Password" on any entry point to enter your security password and change values.
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Security: PIN or Password validation per field
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDataField('sectionA', 'cin', 'Corporate Identification Number (CIN)', report.sectionA.cin, 'Ministry of Corporate Affairs 21-digit identifier')}
            {renderDataField('sectionA', 'sector', 'Industry Sector', report.sectionA.sector, 'Primary operational domain')}
            {renderDataField('sectionA', 'turnoverCr', 'Annual Turnover (₹ Crores)', report.sectionA.turnoverCr, 'Total revenue from goods and services sold', '₹ Cr')}
            {renderDataField('sectionA', 'netProfitCr', 'Net Profit After Tax (₹ Crores)', report.sectionA.netProfitCr, 'Earnings used to compute mandatory 2% CSR spend', '₹ Cr')}
            {renderDataField('sectionA', 'totalEmployees', 'Total Employees (Headcount)', report.sectionA.totalEmployees, 'Permanent and contract workforce', 'Staff')}
            {renderDataField('sectionA', 'femaleEmployees', 'Female Employees Count', report.sectionA.femaleEmployees, `Female staff (${femalePercentage}% of total workforce)`, 'Staff')}
            {renderDataField('sectionA', 'operatingPlants', 'Operating Plants Count', report.sectionA.operatingPlants, 'Active manufacturing and processing factories', 'Plants')}
            {renderDataField('sectionA', 'mainProducts', 'Key Products & Services', report.sectionA.mainProducts, 'Primary product lines')}
          </div>
        </div>
      )}

      {/* SECTION B DATA ENTRY */}
      {activeSection === 'B' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Section B: Management and Process Disclosures
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Board policies, designated director for ESG, review frequency, and grievance handling.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Security: Authenticated Director DIN and Policy verification
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDataField('sectionB', 'hasBoardApprovedPolicy', 'Board-Approved Sustainability Policy', report.sectionB.hasBoardApprovedPolicy, 'Written policy approved by the Board of Directors covering ESG')}
            {renderDataField('sectionB', 'responsibleDirectorName', 'Responsible Director for BRSR', report.sectionB.responsibleDirectorName, `DIN: ${report.sectionB.responsibleDirectorDin}`)}
            {renderDataField('sectionB', 'reviewFrequency', 'Board ESG Review Cadence', report.sectionB.reviewFrequency, 'Cadence of sustainability progress review')}
            {renderDataField('sectionB', 'resolvedGrievancesPercent', 'Stakeholder Grievances Resolved (%)', report.sectionB.resolvedGrievancesPercent, 'Complaints resolved within 30 days', '%')}
          </div>
        </div>
      )}

      {/* SECTION C DATA ENTRY */}
      {activeSection === 'C' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Principles Sidebar */}
          <div className="lg:col-span-1 space-y-1">
            <span className="text-xs font-semibold text-slate-500 px-3 py-1 block uppercase tracking-wider">
              SEBI ESG Principles
            </span>
            {principlesList.map((p) => {
              const isSelected = activePrinciple === p.num;
              return (
                <button
                  key={p.num}
                  type="button"
                  onClick={() => setActivePrinciple(p.num)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.desc}
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Principle Form Details */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            {activePrinciple === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 1: Ethics, Transparency & Accountability
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: The company strictly prohibits corruption, bribes, unlawful gifts, and regulatory fines.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p1_antiCorruptionPolicyCoveragePercent', 'Anti-Corruption Training Coverage (%)', report.sectionC.p1_antiCorruptionPolicyCoveragePercent, 'Staff trained on anti-bribery standards', '%')}
                  {renderDataField('sectionC', 'p1_regulatoryFinesPaidInr', 'Regulatory Fines Paid (₹ INR)', report.sectionC.p1_regulatoryFinesPaidInr, 'Penalties paid to government or regulators (Target: ₹0)', 'INR')}
                  {renderDataField('sectionC', 'p1_briberyComplaintsReceived', 'Bribery Complaints Received', report.sectionC.p1_briberyComplaintsReceived, 'Total corruption complaints filed during the year')}
                </div>
              </div>
            )}

            {activePrinciple === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 2: Sustainable Goods & Services
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Goods use recycled materials and have verified cradle-to-gate life cycle footprints.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p2_recycledInputsPercent', 'Recycled Inputs Used (%)', report.sectionC.p2_recycledInputsPercent, 'Recycled steel scrap and sustainable inputs share', '%')}
                  {renderDataField('sectionC', 'p2_lifeCycleAssessmentCoveragePercent', 'Life Cycle Assessment (LCA) Coverage (%)', report.sectionC.p2_lifeCycleAssessmentCoveragePercent, 'Products with verified cradle-to-gate carbon footprint', '%')}
                </div>
              </div>
            )}

            {activePrinciple === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 3: Employee Safety & Well-being
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Safe working conditions, insurance, zero accidents, and parental leave return.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p3_lostTimeInjuryFrequencyRate', 'Lost Time Injury Frequency Rate (LTIFR)', report.sectionC.p3_lostTimeInjuryFrequencyRate, 'Injuries per 1,000,000 man-hours (Lower is safer)')}
                  {renderDataField('sectionC', 'p3_healthInsuranceCoveragePercent', 'Health Insurance Coverage (%)', report.sectionC.p3_healthInsuranceCoveragePercent, 'Workers covered with corporate medical insurance', '%')}
                  {renderDataField('sectionC', 'p3_safetyTrainingCoveragePercent', 'Safety Training Coverage (%)', report.sectionC.p3_safetyTrainingCoveragePercent, 'Factory workers trained on hazard prevention', '%')}
                  {renderDataField('sectionC', 'p3_parentalLeaveReturnRatePercent', 'Parental Leave Return Rate (%)', report.sectionC.p3_parentalLeaveReturnRatePercent, 'Staff returning after maternity/paternity leave', '%')}
                </div>
              </div>
            )}

            {activePrinciple === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 4: Stakeholder Engagement
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Consultations with local villagers, tribal leaders, and affected communities.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p4_marginalizedConsultationsCount', 'Vulnerable Community Consultations', report.sectionC.p4_marginalizedConsultationsCount, 'Structured hearings and town halls with local villagers', 'Meetings')}
                  {renderDataField('sectionC', 'p4_stakeholderConcernsAddressedPercent', 'Stakeholder Concerns Addressed (%)', report.sectionC.p4_stakeholderConcernsAddressedPercent, 'Community issues solved within target timeline', '%')}
                </div>
              </div>
            )}

            {activePrinciple === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 5: Human Rights & Fair Wages
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: 100% statutory minimum wage, zero child or forced labour, and safe dignity.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p5_minimumWageCompliancePercent', 'Minimum Wage Compliance (%)', report.sectionC.p5_minimumWageCompliancePercent, 'Workers paid equal or above statutory wages', '%')}
                  {renderDataField('sectionC', 'p5_childForcedLaborAuditsPassedPercent', 'Child Labour Audits Passed (%)', report.sectionC.p5_childForcedLaborAuditsPassedPercent, 'Zero tolerance audit verification rate', '%')}
                  {renderDataField('sectionC', 'p5_poshHarassmentComplaintsPending', 'POSH Harassment Cases Pending', report.sectionC.p5_poshHarassmentComplaintsPending, 'Cases pending past 90 days (Target: 0)')}
                </div>
              </div>
            )}

            {activePrinciple === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 6: Environmental Care & Climate Disclosures
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Scope 1 chimneys pollution, Scope 2 grid power pollution, water recycling, clean energy.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p6_scope1DirectEmissionsMtCo2e', 'Direct Emissions (Scope 1)', report.sectionC.p6_scope1DirectEmissionsMtCo2e, 'Direct emissions from factory blast furnaces, fuel, and vehicles', 'MT CO2e')}
                  {renderDataField('sectionC', 'p6_scope2IndirectEmissionsMtCo2e', 'Electricity Emissions (Scope 2)', report.sectionC.p6_scope2IndirectEmissionsMtCo2e, 'Emissions from electricity purchased from the power grid', 'MT CO2e')}
                  {renderDataField('sectionC', 'p6_renewableEnergyPercent', 'Renewable Energy Share (%)', report.sectionC.p6_renewableEnergyPercent, 'Clean solar, wind, and hydro share of energy', '%')}
                  {renderDataField('sectionC', 'p6_waterWithdrawalKl', 'Water Withdrawal (kL)', report.sectionC.p6_waterWithdrawalKl, 'Total ground and river water withdrawn', 'kL')}
                  {renderDataField('sectionC', 'p6_waterRecycledKl', 'Water Recycled & Reused (kL)', report.sectionC.p6_waterRecycledKl, 'Industrial water recycled back into operations', 'kL')}
                  {renderDataField('sectionC', 'p6_hazardousWasteRecycledPercent', 'Hazardous Waste Recycled (%)', report.sectionC.p6_hazardousWasteRecycledPercent, 'Safe recycling of slag and industrial chemical waste', '%')}
                </div>
              </div>
            )}

            {activePrinciple === 7 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 7: Public Policy & Advocacy
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Ethical representation in industry trade bodies and public associations.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p7_tradeAssociationsCount', 'Trade Associations Count', report.sectionC.p7_tradeAssociationsCount, 'Memberships in industry chambers (CII, ISA, etc.)')}
                  {renderDataField('sectionC', 'p7_publicAdvocacyExpenditureInr', 'Public Advocacy Spend (₹ INR)', report.sectionC.p7_publicAdvocacyExpenditureInr, 'Total expenditure on policy dialogue', 'INR')}
                </div>
              </div>
            )}

            {activePrinciple === 8 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 8: Inclusive Community Growth (CSR)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Mandatory 2% profit investment in local village schools, clinics, and clean water.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p8_csrSpendPercentNetProfit', 'CSR Spend (% of Net Profit)', report.sectionC.p8_csrSpendPercentNetProfit, 'Companies Act Section 135 mandates minimum 2.0% average profit', '%')}
                  {renderDataField('sectionC', 'p8_aspirationalDistrictsBeneficiaries', 'Aspirational District Beneficiaries', report.sectionC.p8_aspirationalDistrictsBeneficiaries, 'Villagers supported in government aspirational districts', 'Persons')}
                </div>
              </div>
            )}

            {activePrinciple === 9 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Principle 9: Consumer Protection & Privacy
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain Meaning: Zero customer data breaches, honest labeling, and prompt grievance resolution.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDataField('sectionC', 'p9_dataPrivacyBreachesReported', 'Data Privacy Breaches', report.sectionC.p9_dataPrivacyBreachesReported, 'Cybersecurity customer data compromise incidents (Target: 0)')}
                  {renderDataField('sectionC', 'p9_customerComplaintsResolvedPercent', 'Customer Complaints Solved (%)', report.sectionC.p9_customerComplaintsResolvedPercent, 'Consumer issues resolved within standard timeline', '%')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENT DATA RE-CHANGES LOG */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Audit Record of Password-Unlocked Re-changes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every data modification logged with timestamp, authenticated user, and prior value.
            </p>
          </div>
          <History className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Authenticated Person</th>
                <th className="py-2.5 px-3">Metric / Field</th>
                <th className="py-2.5 px-3">Previous Value</th>
                <th className="py-2.5 px-3">Re-changed Value</th>
                <th className="py-2.5 px-3">Reason / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">{log.actorName}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5 uppercase font-mono">({log.actorRole})</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    {log.field}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">
                    {String(log.previousValue)}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-slate-900">
                    {String(log.newValue)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate" title={log.justification}>
                    {log.justification || 'Password-verified update'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PASSWORD VERIFICATION MODAL */}
      {passwordModal && passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-900" />
                <h3 className="text-sm font-bold text-slate-900">
                  Unlock Data Entry Point
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyPassword} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Selected Metric</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {passwordModal.label}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current Value: <strong className="text-slate-800">{String(passwordModal.currentVal)} {passwordModal.unit}</strong>
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-800">
                    Enter Password or Security PIN for {currentUser.name}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Enter authorized password or PIN..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                <div className="mt-2 p-2.5 rounded bg-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5 border border-slate-200">
                  <span className="text-slate-400 font-mono">🔑</span>
                  <div>
                    <span>Authorized credentials for <strong>{currentUser.name}</strong>:</span>
                    <div className="font-mono mt-0.5 font-semibold text-slate-800">
                      Password: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{currentUser.password || 'reporter2025'}</code> · PIN: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{currentUser.securityPin || '7741'}</code>
                    </div>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="unlockSession"
                  checked={unlockAllSession}
                  onChange={(e) => setUnlockAllSession(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="unlockSession" className="text-slate-600 cursor-pointer text-[11px]">
                  Also unlock all fields for this session
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPasswordModal(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Verify Password & Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RE-CHANGE DATA MODAL (FOR UNLOCKED FIELDS) */}
      {rechangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unlocked by {currentUser.name}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Change Data: {rechangeTarget.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRechangeTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitRechange} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Current Saved Value</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {String(rechangeTarget.currentVal)} {rechangeTarget.unit}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  Password Verified
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Enter New Value {rechangeTarget.unit && `(${rechangeTarget.unit})`}
                </label>
                {typeof rechangeTarget.currentVal === 'boolean' ? (
                  <select
                    value={rechangeNewValue}
                    onChange={(e) => setRechangeNewValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium"
                  >
                    <option value="true">Yes, Approved / Compliant</option>
                    <option value="false">No / Non-Compliant</option>
                  </select>
                ) : (
                  <input
                    type={typeof rechangeTarget.currentVal === 'number' ? 'number' : 'text'}
                    step="any"
                    required
                    value={rechangeNewValue}
                    onChange={(e) => setRechangeNewValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono text-sm focus:ring-2 focus:ring-slate-900"
                    placeholder="Enter new value..."
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Reason for Changing Data (Mandatory Audit Note)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rechangeNote}
                  onChange={(e) => setRechangeNote(e.target.value)}
                  placeholder="e.g. Updated based on Q4 utility meter reconciliation, external auditor review, or annual headcount audit..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRechangeTarget(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Commit Re-changed Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
