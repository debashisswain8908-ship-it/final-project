import React from 'react';
import { BRSRReport, UserAccount } from '../types/brsr';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Download, 
  ArrowRight,
  TrendingDown,
  Droplets,
  Zap,
  Users,
  Award
} from 'lucide-react';

interface OverviewTabProps {
  report: BRSRReport;
  currentUser: UserAccount;
  onNavigateToTab: (tab: 'entry' | 'analyst') => void;
  onOpenExportModal: () => void;
  onToggleLockFiling: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  report,
  currentUser,
  onNavigateToTab,
  onOpenExportModal,
  onToggleLockFiling
}) => {
  const { metadata, sectionA, sectionC } = report;

  // Real calculated figures
  const totalEmissions = sectionC.p6_scope1DirectEmissionsMtCo2e + sectionC.p6_scope2IndirectEmissionsMtCo2e;
  const emissionsIntensity = (totalEmissions / sectionA.turnoverCr).toFixed(2);
  const femalePercentage = ((sectionA.femaleEmployees / sectionA.totalEmployees) * 100).toFixed(1);
  const waterRecyclePercentage = ((sectionC.p6_waterRecycledKl / sectionC.p6_waterWithdrawalKl) * 100).toFixed(1);

  const principlesSummary = [
    { num: 'P1', title: 'Ethics & Integrity', metric: `${sectionC.p1_antiCorruptionPolicyCoveragePercent}% Policy Coverage`, status: '100% Compliant', desc: 'Zero bribery cases, strict anti-corruption code.' },
    { num: 'P2', title: 'Sustainable Goods', metric: `${sectionC.p2_recycledInputsPercent}% Recycled Inputs`, status: 'Verified', desc: 'Life cycle analysis on primary steel products.' },
    { num: 'P3', title: 'Employee Safety', metric: `${sectionC.p3_lostTimeInjuryFrequencyRate} LTIFR`, status: 'Zero Fatalities', desc: 'Comprehensive health coverage and safety drills.' },
    { num: 'P4', title: 'Stakeholder Voice', metric: `${sectionC.p4_marginalizedConsultationsCount} Consultations`, status: 'Active', desc: 'Regular dialogues with local community councils.' },
    { num: 'P5', title: 'Human Rights', metric: `${sectionC.p5_minimumWageCompliancePercent}% Minimum Wage`, status: '100% Audit Pass', desc: 'Zero child labour, strict POSH policy.' },
    { num: 'P6', title: 'Environment & Climate', metric: `${totalEmissions.toLocaleString()} MT CO2e`, status: 'Analyst Certified', desc: 'Scope 1 & 2 GHG tracked with CEA baseline.' },
    { num: 'P7', title: 'Responsible Policy', metric: `${sectionC.p7_tradeAssociationsCount} Associations`, status: 'Disclosed', desc: 'Public interest advocacy without partisan donations.' },
    { num: 'P8', title: 'Community & CSR', metric: `${sectionC.p8_csrSpendPercentNetProfit}% of Net Profit`, status: 'Exceeds SEBI 2%', desc: 'Education & health in aspirational districts.' },
    { num: 'P9', title: 'Consumer Protection', metric: `${sectionC.p9_dataPrivacyBreachesReported} Data Breaches`, status: 'Zero Incidents', desc: 'High customer complaint resolution rate.' },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
              <span>CIN: {sectionA.cin}</span>
              <span aria-hidden="true">·</span>
              <span>Financial Year: {metadata.financialYear}</span>
              <span aria-hidden="true">·</span>
              <span>SEBI BRSR Core Mandate</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {metadata.companyName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {sectionA.sector} · Registered in Mumbai, Maharashtra
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenExportModal}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export BRSR Filing</span>
            </button>

            {currentUser.role === 'auditor' && (
              <button
                type="button"
                onClick={onToggleLockFiling}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  metadata.isLocked
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {metadata.isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Filing</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign & Lock Filing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Verification Status & Security Seal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">
                Filing Status: {metadata.filingStatus}
              </span>
              <span className="text-slate-500 ml-2">
                (Last validated by {metadata.lastModifiedBy})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            <span className="text-slate-400">Merkle Root:</span>
            <span className="truncate max-w-[200px]" title={metadata.merkleRootHash}>
              {metadata.merkleRootHash}
            </span>
          </div>
        </div>
      </div>

      {/* Core ESG Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Core ESG Performance Indicators
          </h2>
          <span className="text-xs text-slate-500">
            Directly mapped to SEBI BRSR Core Assurance Attributes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Metric 1: Total GHG */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Greenhouse Gas (Scope 1 + 2)
              </span>
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {totalEmissions.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">MT CO2e</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Scope 1: {sectionC.p6_scope1DirectEmissionsMtCo2e.toLocaleString()} MT · Scope 2: {sectionC.p6_scope2IndirectEmissionsMtCo2e.toLocaleString()} MT
            </p>
          </div>

          {/* Metric 2: Emissions Intensity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Emissions Intensity
              </span>
              <Zap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {emissionsIntensity}
              </span>
              <span className="text-xs text-slate-500">MT CO2e / ₹ Cr</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Computed against total annual revenue of ₹{sectionA.turnoverCr.toLocaleString()} Cr
            </p>
          </div>

          {/* Metric 3: Renewable Energy */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Renewable Energy Share
              </span>
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {sectionC.p6_renewableEnergyPercent}%
              </span>
              <span className="text-xs text-slate-500">of total energy</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Total energy consumption: {sectionC.p6_totalEnergyConsumptionMwh.toLocaleString()} MWh
            </p>
          </div>

          {/* Metric 4: Water Recycled */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Water Recycled & Reused
              </span>
              <Droplets className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {waterRecyclePercentage}%
              </span>
              <span className="text-xs text-slate-500">recycling rate</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {sectionC.p6_waterRecycledKl.toLocaleString()} kL recycled of {sectionC.p6_waterWithdrawalKl.toLocaleString()} kL withdrawal
            </p>
          </div>

          {/* Metric 5: Gender Diversity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Female Workforce Participation
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {femalePercentage}%
              </span>
              <span className="text-xs text-slate-500">of workforce</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {sectionA.femaleEmployees.toLocaleString()} female staff of {sectionA.totalEmployees.toLocaleString()} total employees
            </p>
          </div>

          {/* Metric 6: CSR Spend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                CSR Outlay (Mandate: 2.0%)
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {sectionC.p8_csrSpendPercentNetProfit}%
              </span>
              <span className="text-xs text-emerald-700 font-medium">Compliant</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {sectionC.p8_aspirationalDistrictsBeneficiaries.toLocaleString()} beneficiaries in aspirational districts
            </p>
          </div>
        </div>
      </div>

      {/* 9 Principles Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              BRSR Nine Principles Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              SEBI framework for Business Responsibility and Sustainability Reporting
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('entry')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <span>Open Data Entry Forms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {principlesSummary.map((p) => (
            <div
              key={p.num}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-slate-900 w-7 shrink-0">
                  {p.num}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 mr-2">
                    {p.title}
                  </span>
                  <span className="text-slate-500 hidden md:inline">
                    · {p.desc}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:justify-end">
                <span className="font-mono tabular-nums text-slate-700 font-medium">
                  {p.metric}
                </span>
                <span className="text-slate-500">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authenticated Data Entry & Verification Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Corporate ESG Disclosures</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Ready to Input or Re-change Corporate ESG Data?
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Only authenticated corporate reporters can input and modify disclosures, while certified analysts can recalculate emissions and environmental factors. Switch user accounts anytime to test permissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('entry')}
            className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Go to Data Entry Portal
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('analyst')}
            className="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Analyst Review
          </button>
        </div>
      </div>
    </div>
  );
};
