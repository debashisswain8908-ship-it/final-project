import React from 'react';
import { BRSRReport } from '../types/brsr';
import { X, Download, Printer, ShieldCheck } from 'lucide-react';

interface BrsrExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: BRSRReport;
}

export const BrsrExportModal: React.FC<BrsrExportModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen) return null;

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BRSR_${report.metadata.cin}_FY${report.metadata.financialYear}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div 
        className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Official BRSR ESG Filing Document
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SEBI compliant Business Responsibility and Sustainability Report
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Filing Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-slate-900">{report.metadata.companyName}</h1>
                <p className="text-slate-500">CIN: {report.metadata.cin} · FY {report.metadata.financialYear}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  {report.metadata.filingStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Section A */}
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">
              Section A: General Corporate Disclosures
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Turnover: <strong className="text-slate-900">₹{report.sectionA.turnoverCr.toLocaleString()} Cr</strong></div>
              <div>Net Profit: <strong className="text-slate-900">₹{report.sectionA.netProfitCr.toLocaleString()} Cr</strong></div>
              <div>Total Employees: <strong className="text-slate-900">{report.sectionA.totalEmployees.toLocaleString()}</strong></div>
              <div>Female Employees: <strong className="text-slate-900">{report.sectionA.femaleEmployees.toLocaleString()} ({((report.sectionA.femaleEmployees / report.sectionA.totalEmployees) * 100).toFixed(1)}%)</strong></div>
              <div>Operating Plants: <strong className="text-slate-900">{report.sectionA.operatingPlants}</strong></div>
              <div>Sector: <strong className="text-slate-900">{report.sectionA.sector}</strong></div>
            </div>
          </div>

          {/* Section B */}
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">
              Section B: Management & Governance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Director in Charge: <strong className="text-slate-900">{report.sectionB.responsibleDirectorName} ({report.sectionB.responsibleDirectorDin})</strong></div>
              <div>Review Cadence: <strong className="text-slate-900">{report.sectionB.reviewFrequency}</strong></div>
              <div>Board ESG Policy: <strong className="text-slate-900">{report.sectionB.hasBoardApprovedPolicy ? 'Yes, Board Approved' : 'No'}</strong></div>
              <div>Grievances Solved: <strong className="text-slate-900">{report.sectionB.resolvedGrievancesPercent}%</strong></div>
            </div>
          </div>

          {/* Section C */}
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">
              Section C: Principle-Wise ESG Disclosures (Key Figures)
            </h4>
            <div className="space-y-2 text-slate-600">
              <div><strong>Principle 1 (Ethics):</strong> Anti-corruption training: {report.sectionC.p1_antiCorruptionPolicyCoveragePercent}%, Regulatory fines: ₹{report.sectionC.p1_regulatoryFinesPaidInr}</div>
              <div><strong>Principle 2 (Products):</strong> Recycled inputs: {report.sectionC.p2_recycledInputsPercent}%, LCA coverage: {report.sectionC.p2_lifeCycleAssessmentCoveragePercent}%</div>
              <div><strong>Principle 3 (Employees):</strong> LTIFR injury rate: {report.sectionC.p3_lostTimeInjuryFrequencyRate}, Health insurance: {report.sectionC.p3_healthInsuranceCoveragePercent}%</div>
              <div><strong>Principle 4 (Stakeholders):</strong> Consultations: {report.sectionC.p4_marginalizedConsultationsCount}, Concerns solved: {report.sectionC.p4_stakeholderConcernsAddressedPercent}%</div>
              <div><strong>Principle 5 (Human Rights):</strong> Minimum wage compliance: {report.sectionC.p5_minimumWageCompliancePercent}%, Zero child labour audits: {report.sectionC.p5_childForcedLaborAuditsPassedPercent}%</div>
              <div><strong>Principle 6 (Environment):</strong> Scope 1 GHG: {report.sectionC.p6_scope1DirectEmissionsMtCo2e.toLocaleString()} MT, Scope 2 GHG: {report.sectionC.p6_scope2IndirectEmissionsMtCo2e.toLocaleString()} MT, Renewable Energy: {report.sectionC.p6_renewableEnergyPercent}%, Water Recycled: {report.sectionC.p6_waterRecycledKl.toLocaleString()} kL</div>
              <div><strong>Principle 7 (Advocacy):</strong> Trade associations: {report.sectionC.p7_tradeAssociationsCount}, Public advocacy spend: ₹{report.sectionC.p7_publicAdvocacyExpenditureInr.toLocaleString()}</div>
              <div><strong>Principle 8 (CSR):</strong> CSR spend: {report.sectionC.p8_csrSpendPercentNetProfit}% of net profit, Aspirational district beneficiaries: {report.sectionC.p8_aspirationalDistrictsBeneficiaries.toLocaleString()}</div>
              <div><strong>Principle 9 (Consumer):</strong> Data breaches: {report.sectionC.p9_dataPrivacyBreachesReported}, Complaints resolved: {report.sectionC.p9_customerComplaintsResolvedPercent}%</div>
            </div>
          </div>

          {/* Cryptographic Seal */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic Audit Proof</span>
            </div>
            <div className="font-mono text-[11px] text-slate-600 space-y-1">
              <div>Merkle Root: {report.metadata.merkleRootHash}</div>
              <div>Digital Signature: {report.metadata.digitalSignature}</div>
              <div>Signer Key: {report.metadata.lastModifiedBy}</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
