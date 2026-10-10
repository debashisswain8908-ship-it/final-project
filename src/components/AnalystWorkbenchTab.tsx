import React, { useState } from 'react';
import { BRSRReport, UserAccount, AnalystAdjustment } from '../types/brsr';
import { 
  Calculator, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RefreshCw,
  PlusCircle,
  FileCheck2,
  UserCheck,
  Info
} from 'lucide-react';

interface AnalystWorkbenchTabProps {
  report: BRSRReport;
  currentUser: UserAccount;
  adjustments: AnalystAdjustment[];
  onApplyAdjustment: (adjustment: Omit<AnalystAdjustment, 'id' | 'timestamp' | 'analystName' | 'analystId' | 'status'>) => void;
  onOpenAuthModal?: () => void;
  onSwitchToAnalyst?: () => void;
}

export const AnalystWorkbenchTab: React.FC<AnalystWorkbenchTabProps> = ({
  report,
  currentUser,
  adjustments,
  onApplyAdjustment,
  onOpenAuthModal,
  onSwitchToAnalyst
}) => {
  const isAnalyst = currentUser.role === 'analyst' && !report.metadata.isLocked;

  // Recalculation form states
  const [selectedMetric, setSelectedMetric] = useState<'scope2' | 'scope1' | 'water'>('scope2');
  const [factorName, setFactorName] = useState('Central Electricity Authority (CEA) Baseline v19.1');
  const [customValue, setCustomValue] = useState<number>(405000);
  const [justification, setJustification] = useState(
    'Recomputed purchased power indirect emissions utilizing regional grid emission factor 0.712 kg CO2/kWh from latest CEA National Carbon Baseline report.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automated Compliance & Anomaly Checks
  const complianceChecks = [
    {
      id: 'chk-1',
      title: 'Mandatory CSR Spend Rule (SEBI & Section 135)',
      condition: report.sectionC.p8_csrSpendPercentNetProfit >= 2.0,
      current: `${report.sectionC.p8_csrSpendPercentNetProfit}% of Net Profit`,
      target: '≥ 2.00%',
      desc: 'Company complies with mandatory 2% CSR expenditure requirement under Companies Act 2013.'
    },
    {
      id: 'chk-2',
      title: 'Workforce Health & Medical Coverage',
      condition: report.sectionC.p3_healthInsuranceCoveragePercent >= 95,
      current: `${report.sectionC.p3_healthInsuranceCoveragePercent}%`,
      target: '100% of employees',
      desc: 'Full coverage of permanent and contractual employees with corporate healthcare benefits.'
    },
    {
      id: 'chk-3',
      title: 'Human Rights & Minimum Wages Assurance',
      condition: report.sectionC.p5_minimumWageCompliancePercent === 100,
      current: `${report.sectionC.p5_minimumWageCompliancePercent}%`,
      target: '100% statutory adherence',
      desc: 'Zero statutory underpayment violations across all 14 operating industrial units.'
    },
    {
      id: 'chk-4',
      title: 'Water Recycling & Circularity Ratio',
      condition: ((report.sectionC.p6_waterRecycledKl / report.sectionC.p6_waterWithdrawalKl) * 100) >= 30,
      current: `${((report.sectionC.p6_waterRecycledKl / report.sectionC.p6_waterWithdrawalKl) * 100).toFixed(1)}%`,
      target: '≥ 30.0% recycled',
      desc: 'Industrial effluent treatment plants operating at high closed-loop recycling efficiency.'
    },
    {
      id: 'chk-5',
      title: 'Consumer Data Privacy & Cybersecurity',
      condition: report.sectionC.p9_dataPrivacyBreachesReported === 0,
      current: `${report.sectionC.p9_dataPrivacyBreachesReported} breaches`,
      target: '0 breaches',
      desc: 'No customer data leaks or cybersecurity compromises reported during the reporting period.'
    }
  ];

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnalyst) return;

    setIsSubmitting(true);

    let metricKey = 'p6_scope2IndirectEmissionsMtCo2e';
    let metricLabel = 'Grid Electricity Indirect Emissions (Scope 2)';
    let originalVal = report.sectionC.p6_scope2IndirectEmissionsMtCo2e;
    let unit = 'Metric Tonnes CO2e';

    if (selectedMetric === 'scope1') {
      metricKey = 'p6_scope1DirectEmissionsMtCo2e';
      metricLabel = 'Direct Manufacturing Emissions (Scope 1)';
      originalVal = report.sectionC.p6_scope1DirectEmissionsMtCo2e;
    } else if (selectedMetric === 'water') {
      metricKey = 'p6_waterRecycledKl';
      metricLabel = 'Water Recycled & Reused';
      originalVal = report.sectionC.p6_waterRecycledKl;
      unit = 'Kilolitres (kL)';
    }

    onApplyAdjustment({
      metricKey,
      metricLabel,
      originalValue: originalVal,
      adjustedValue: customValue,
      unit,
      adjustmentFactor: factorName,
      reason: justification
    });

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Calculator className="w-4 h-4 text-slate-700" />
            <span>Analytical Recalibration & Assurance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            ESG Analyst Workbench & Verification Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized analysts can recalculate emission factors, normalize metrics, and certify BRSR disclosures.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAnalyst ? (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold block">Analyst Mode Active</span>
                <span className="text-[11px] text-emerald-700">{currentUser.name} · Full Recalculation Access</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold text-amber-900 block">Recalibration Restricted (View Only)</span>
                <span className="text-[11px] text-amber-700">
                  {report.metadata.isLocked 
                    ? 'Report certified & locked by Auditor'
                    : `Active: ${currentUser.name} (${currentUser.role.toUpperCase()})`}
                </span>
              </div>
              {onSwitchToAnalyst && !report.metadata.isLocked && (
                <button
                  type="button"
                  onClick={onSwitchToAnalyst}
                  className="ml-1 px-3 py-1 bg-amber-900 text-white rounded text-[11px] font-semibold hover:bg-amber-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Enable Analyst Mode
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanation of Restriction for Non-Analyst Roles */}
      {!isAnalyst && (
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">
                Why is analytical recalculation restricted in View-Only mode?
              </span>
              <p className="text-slate-600 mt-0.5">
                Under SEBI BRSR governance and ISO 14064 greenhouse gas assurance protocols, only certified quantitative analysts (e.g. <strong>Dr. Vikram Rao</strong>) possess the authority to recalibrate emission factors (such as CEA Grid emission factors or biogenic avoidance deductions). Corporate reporters handle operational data entry, while analysts certify mathematical recalculations.
              </p>
            </div>
          </div>

          {onSwitchToAnalyst && !report.metadata.isLocked && (
            <button
              type="button"
              onClick={onSwitchToAnalyst}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              Switch to Dr. Vikram Rao (Lead Analyst)
            </button>
          )}
        </div>
      )}

      {/* Automated Compliance & Anomaly Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Automated BRSR Core Compliance & Rules Engine
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Real-time algorithmic verification against SEBI BRSR guidelines and Indian statutory benchmarks.
        </p>

        <div className="space-y-4">
          {complianceChecks.map((chk) => (
            <div
              key={chk.id}
              className="p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {chk.condition ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">
                    {chk.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {chk.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs shrink-0">
                <div>
                  <span className="text-[11px] text-slate-400 block">Reported Value</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">
                    {chk.current}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Statutory Target</span>
                  <span className="font-mono text-slate-600">
                    {chk.target}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    chk.condition ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {chk.condition ? 'VERIFIED' : 'ACTION REQUIRED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recalculation by Analysis Tool */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Apply Analytical Recalibration / Factor Adjustment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              As authorized analyst, recalculate metrics based on updated grid emission factors, verified carbon credits, or laboratory water balance tests.
            </p>
          </div>
          {!isAnalyst && (
            <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded font-medium border border-amber-200">
              Form locked: Enable Lead Analyst Mode to submit adjustments
            </span>
          )}
        </div>

        <form onSubmit={handleRecalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Select Metric to Recalculate
              </label>
              <select
                disabled={!isAnalyst}
                value={selectedMetric}
                onChange={(e) => {
                  const val = e.target.value as 'scope2' | 'scope1' | 'water';
                  setSelectedMetric(val);
                  if (val === 'scope2') setCustomValue(405000);
                  if (val === 'scope1') setCustomValue(1820000);
                  if (val === 'water') setCustomValue(4250000);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="scope2">Scope 2 Indirect Emissions (Electricity Grid)</option>
                <option value="scope1">Scope 1 Direct Carbon Emissions (Manufacturing)</option>
                <option value="water">Water Recycled & Reused (kL)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Analytical Framework / Conversion Factor
              </label>
              <input
                type="text"
                disabled={!isAnalyst}
                value={factorName}
                onChange={(e) => setFactorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="e.g. CEA National Grid Baseline v19"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                New Recalculated Value
              </label>
              <input
                type="number"
                disabled={!isAnalyst}
                value={customValue}
                onChange={(e) => setCustomValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tabular-nums text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Current in report:{' '}
                {selectedMetric === 'scope2' && `${report.sectionC.p6_scope2IndirectEmissionsMtCo2e.toLocaleString()} MT`}
                {selectedMetric === 'scope1' && `${report.sectionC.p6_scope1DirectEmissionsMtCo2e.toLocaleString()} MT`}
                {selectedMetric === 'water' && `${report.sectionC.p6_waterRecycledKl.toLocaleString()} kL`}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Mandatory Analyst Justification & Audit Note
              </label>
              <textarea
                rows={3}
                disabled={!isAnalyst}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="Explain the source documents, verified calculation formula, and audit evidence..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {isAnalyst 
                ? 'Ready to commit: Change will be signed under Dr. Vikram Rao\'s analyst credentials.'
                : 'Form is in View-Only mode. Switch to Lead ESG Analyst above to edit and commit adjustments.'}
            </span>

            <button
              type="submit"
              disabled={!isAnalyst || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Apply & Seal Analytical Recalibration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analytical Adjustment History */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Analytical Calibration Audit Trail
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Record of all data adjustments executed through analytical verification.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Original Value</th>
                <th className="py-3 px-4">Calibrated Value</th>
                <th className="py-3 px-4">Factor / Standard</th>
                <th className="py-3 px-4">Analyst</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {adj.metricLabel}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                    {adj.originalValue.toLocaleString()} {adj.unit}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                    {adj.adjustedValue.toLocaleString()} {adj.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{adj.adjustmentFactor}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{adj.reason}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {adj.analystName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {adj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
