export type UserRole = 'reporter' | 'analyst' | 'auditor' | 'public';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  title: string;
  organization: string;
  digitalKeyId: string;
  avatarInitials: string;
  password?: string;
  securityPin?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'ANALYST_RECALCULATION' | 'AUDIT_SIGN_OFF' | 'RESTORE';
  section: string;
  field: string;
  previousValue: string | number | boolean;
  newValue: string | number | boolean;
  justification?: string;
  recordHash: string;
  signature: string;
  isTampered?: boolean;
}

export interface AnalystAdjustment {
  id: string;
  metricKey: string;
  metricLabel: string;
  originalValue: number;
  adjustedValue: number;
  unit: string;
  adjustmentFactor: string;
  reason: string;
  timestamp: string;
  analystName: string;
  analystId: string;
  status: 'PENDING' | 'APPLIED' | 'REJECTED';
}

export interface AnomalyFlag {
  id: string;
  code: string;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendedAction: string;
}

export interface BRSRReport {
  metadata: {
    companyName: string;
    cin: string;
    financialYear: string;
    reportingPeriod: string;
    registeredOffice: string;
    filingStatus: 'Draft' | 'Under Review' | 'Analyst Verified' | 'Board Certified & Sealed';
    lastModifiedBy: string;
    lastModifiedAt: string;
    merkleRootHash: string;
    digitalSignature: string;
    isLocked: boolean;
  };

  sectionA: {
    cin: string;
    sector: string;
    turnoverCr: number;
    netProfitCr: number;
    totalEmployees: number;
    femaleEmployees: number;
    differentlyAbledEmployees: number;
    operatingPlants: number;
    corporateOffices: number;
    mainProducts: string;
  };

  sectionB: {
    hasBoardApprovedPolicy: boolean;
    responsibleDirectorName: string;
    responsibleDirectorDin: string;
    reviewFrequency: 'Quarterly' | 'Half-Yearly' | 'Annually';
    materialityAssessmentYear: string;
    activeGrievancesCount: number;
    resolvedGrievancesPercent: number;
  };

  sectionC: {
    // P1: Ethics, Transparency & Accountability
    p1_antiCorruptionPolicyCoveragePercent: number;
    p1_regulatoryFinesPaidInr: number;
    p1_briberyComplaintsReceived: number;

    // P2: Sustainable Products & Life Cycle
    p2_recycledInputsPercent: number;
    p2_lifeCycleAssessmentCoveragePercent: number;
    p2_extendedProducerResponsibilityCompliant: boolean;

    // P3: Employee Well-being & Safety
    p3_lostTimeInjuryFrequencyRate: number; // LTIFR per million hours
    p3_safetyTrainingCoveragePercent: number;
    p3_healthInsuranceCoveragePercent: number;
    p3_parentalLeaveReturnRatePercent: number;

    // P4: Stakeholder Engagement
    p4_marginalizedConsultationsCount: number;
    p4_stakeholderConcernsAddressedPercent: number;

    // P5: Human Rights
    p5_minimumWageCompliancePercent: number;
    p5_childForcedLaborAuditsPassedPercent: number;
    p5_poshHarassmentComplaintsPending: number;

    // P6: Environment (Core Quantitative Metrics)
    p6_scope1DirectEmissionsMtCo2e: number;
    p6_scope2IndirectEmissionsMtCo2e: number;
    p6_totalEnergyConsumptionMwh: number;
    p6_renewableEnergyPercent: number;
    p6_waterWithdrawalKl: number;
    p6_waterRecycledKl: number;
    p6_hazardousWasteRecycledPercent: number;

    // P7: Responsible Public Policy & Advocacy
    p7_tradeAssociationsCount: number;
    p7_publicAdvocacyExpenditureInr: number;

    // P8: Inclusive Growth & Community (CSR)
    p8_csrSpendPercentNetProfit: number;
    p8_aspirationalDistrictsBeneficiaries: number;
    p8_localCommunityProjectsCount: number;

    // P9: Consumer Value & Responsibility
    p9_dataPrivacyBreachesReported: number;
    p9_customerComplaintsResolvedPercent: number;
    p9_productRecallCount: number;
  };
}
