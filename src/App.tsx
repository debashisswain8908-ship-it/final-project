import React, { useState } from 'react';
import { BRSRReport, UserAccount, AuditEntry, AnalystAdjustment } from './types/brsr';
import { 
  INITIAL_USERS, 
  INITIAL_BRSR_REPORT, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_ANALYST_ADJUSTMENTS 
} from './data/initialData';
import { 
  computeReportMerkleRoot, 
  signPayload, 
  createAuditRecord 
} from './services/cryptoEngine';
import { TopBar } from './components/TopBar';
import { AuthModal } from './components/AuthModal';
import { OverviewTab } from './components/OverviewTab';
import { DisclosuresTab } from './components/DisclosuresTab';
import { AnalystWorkbenchTab } from './components/AnalystWorkbenchTab';
import { BrsrExportModal } from './components/BrsrExportModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'entry' | 'analyst'>('overview');
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [report, setReport] = useState<BRSRReport>(INITIAL_BRSR_REPORT);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [adjustments, setAdjustments] = useState<AnalystAdjustment[]>(INITIAL_ANALYST_ADJUSTMENTS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Field update / Re-change handler
  const handleUpdateField = (
    section: 'sectionA' | 'sectionB' | 'sectionC',
    field: string,
    value: string | number | boolean,
    fieldLabel: string,
    justification?: string
  ) => {
    if (report.metadata.isLocked) return;
    if (currentUser.role !== 'reporter' && currentUser.role !== 'analyst') return;

    const previousValue = (report[section] as any)[field];
    if (previousValue === value) return;

    // Update section data
    const updatedReport: BRSRReport = {
      ...report,
      [section]: {
        ...report[section],
        [field]: value
      }
    };

    // Calculate new Merkle root hash
    const newMerkleRoot = computeReportMerkleRoot(updatedReport);
    const newSignature = signPayload(newMerkleRoot, currentUser.digitalKeyId);

    updatedReport.metadata = {
      ...updatedReport.metadata,
      lastModifiedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      lastModifiedAt: new Date().toISOString(),
      merkleRootHash: newMerkleRoot,
      digitalSignature: newSignature,
      filingStatus: currentUser.role === 'analyst' ? 'Analyst Verified' : 'Under Review'
    };

    // Create sealed audit record
    const auditRecord = createAuditRecord(
      currentUser,
      'UPDATE',
      section === 'sectionA' ? 'Section A (General)' : section === 'sectionB' ? 'Section B (Governance)' : 'Section C (Principles)',
      fieldLabel,
      previousValue,
      value,
      justification || 'Data re-changed by authenticated personnel'
    );

    setReport(updatedReport);
    setAuditLogs([auditRecord, ...auditLogs]);
  };

  // Analyst recalculation / adjustment handler
  const handleApplyAdjustment = (
    adjustmentData: Omit<AnalystAdjustment, 'id' | 'timestamp' | 'analystName' | 'analystId' | 'status'>
  ) => {
    if (report.metadata.isLocked || currentUser.role !== 'analyst') return;

    const newAdjustment: AnalystAdjustment = {
      ...adjustmentData,
      id: `adj-${Date.now()}`,
      timestamp: new Date().toISOString(),
      analystName: currentUser.name,
      analystId: currentUser.id,
      status: 'APPLIED'
    };

    const updatedReport: BRSRReport = {
      ...report,
      sectionC: {
        ...report.sectionC,
        [adjustmentData.metricKey]: adjustmentData.adjustedValue
      }
    };

    const newMerkleRoot = computeReportMerkleRoot(updatedReport);
    const newSignature = signPayload(newMerkleRoot, currentUser.digitalKeyId);

    updatedReport.metadata = {
      ...updatedReport.metadata,
      lastModifiedBy: `${currentUser.name} (Lead ESG Analyst)`,
      lastModifiedAt: new Date().toISOString(),
      merkleRootHash: newMerkleRoot,
      digitalSignature: newSignature,
      filingStatus: 'Analyst Verified'
    };

    const auditRecord = createAuditRecord(
      currentUser,
      'ANALYST_RECALCULATION',
      'Section C (Environmental Principles)',
      adjustmentData.metricLabel,
      adjustmentData.originalValue,
      adjustmentData.adjustedValue,
      adjustmentData.reason
    );

    setReport(updatedReport);
    setAdjustments([newAdjustment, ...adjustments]);
    setAuditLogs([auditRecord, ...auditLogs]);
  };

  // Toggle lock filing by Board Auditor
  const handleToggleLockFiling = () => {
    if (currentUser.role !== 'auditor') return;

    const newLockState = !report.metadata.isLocked;
    const updatedReport: BRSRReport = {
      ...report,
      metadata: {
        ...report.metadata,
        isLocked: newLockState,
        filingStatus: newLockState ? 'Board Certified & Sealed' : 'Analyst Verified',
        lastModifiedBy: `${currentUser.name} (Board Auditor)`,
        lastModifiedAt: new Date().toISOString()
      }
    };

    const auditRecord = createAuditRecord(
      currentUser,
      'AUDIT_SIGN_OFF',
      'Metadata Governance',
      'filingStatus',
      report.metadata.filingStatus,
      updatedReport.metadata.filingStatus,
      newLockState ? 'Board level digital sign-off and lock' : 'Auditor unlocked filing for revisions'
    );

    setReport(updatedReport);
    setAuditLogs([auditRecord, ...auditLogs]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isFilingLocked={report.metadata.isLocked}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && (
          <OverviewTab
            report={report}
            currentUser={currentUser}
            onNavigateToTab={setCurrentTab}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onToggleLockFiling={handleToggleLockFiling}
          />
        )}

        {currentTab === 'entry' && (
          <DisclosuresTab
            report={report}
            currentUser={currentUser}
            auditLogs={auditLogs}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onUpdateField={handleUpdateField}
          />
        )}

        {currentTab === 'analyst' && (
          <AnalystWorkbenchTab
            report={report}
            currentUser={currentUser}
            adjustments={adjustments}
            onApplyAdjustment={handleApplyAdjustment}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSwitchToAnalyst={() => setCurrentUser(INITIAL_USERS[1])}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">BRSR Corporate ESG Portal</span>
            <span>·</span>
            <span>SEBI Business Responsibility and Sustainability Reporting</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Corporate Disclosures</span>
            <span>·</span>
            <span>Analyst Recalculation Engine</span>
          </div>
        </div>
      </footer>

      {/* Role Switch & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      {/* Export Filing Modal */}
      <BrsrExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={report}
      />
    </div>
  );
}
