import { BRSRReport, UserAccount, AuditEntry, AnalystAdjustment } from '../types/brsr';
import { computeReportMerkleRoot, signPayload } from '../services/cryptoEngine';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_reporter',
    name: 'Ananya Sharma',
    role: 'reporter',
    email: 'ananya.sharma@ecosteel.in',
    title: 'Senior Manager - ESG Disclosures',
    organization: 'Tata EcoSteel & Infrastructure Ltd',
    digitalKeyId: 'KEY_RSA_4096_REP_7741',
    avatarInitials: 'AS',
    password: 'reporter2025',
    securityPin: '7741'
  },
  {
    id: 'user_analyst',
    name: 'Dr. Vikram Rao',
    role: 'analyst',
    email: 'v.rao@carbonanalytics.org',
    title: 'Lead Environmental Quantitative Analyst',
    organization: 'Global Carbon Analytics Institute',
    digitalKeyId: 'KEY_ECDSA_256_ANA_8812',
    avatarInitials: 'VR',
    password: 'analyst2025',
    securityPin: '8812'
  },
  {
    id: 'user_auditor',
    name: 'Priya Menon',
    role: 'auditor',
    email: 'p.menon@kpmg-assurance.com',
    title: 'Board ESG Assurance Director',
    organization: 'KPMG Sustainability & Assurance',
    digitalKeyId: 'KEY_ED25519_AUD_9903',
    avatarInitials: 'PM',
    password: 'auditor2025',
    securityPin: '9903'
  },
  {
    id: 'user_public',
    name: 'Public Stakeholder / Investor',
    role: 'public',
    email: 'investor@public.org',
    title: 'Public Viewer (Read-Only)',
    organization: 'External Public',
    digitalKeyId: 'UNAUTHENTICATED_GUEST',
    avatarInitials: 'PS'
  }
];

export const INITIAL_BRSR_REPORT: BRSRReport = {
  metadata: {
    companyName: 'Tata EcoSteel & Infrastructure Ltd',
    cin: 'L27100MH1907PLC002604',
    financialYear: '2024-2025',
    reportingPeriod: 'April 01, 2024 to March 31, 2025',
    registeredOffice: 'Bombay House, 24 Homi Mody Street, Mumbai 400001, Maharashtra, India',
    filingStatus: 'Analyst Verified',
    lastModifiedBy: 'Dr. Vikram Rao (Lead ESG Analyst)',
    lastModifiedAt: '2025-05-18T10:45:00.000Z',
    merkleRootHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    digitalSignature: '0x8849c719e0f34...a18f26',
    isLocked: false
  },

  sectionA: {
    cin: 'L27100MH1907PLC002604',
    sector: 'Metals, Mining & Sustainable Infrastructure',
    turnoverCr: 48620.5,
    netProfitCr: 5410.2,
    totalEmployees: 24850,
    femaleEmployees: 4720,
    differentlyAbledEmployees: 310,
    operatingPlants: 14,
    corporateOffices: 8,
    mainProducts: 'Green Rebars, Low-Carbon Hot Rolled Coils, Solar Mounting Structural Tubes'
  },

  sectionB: {
    hasBoardApprovedPolicy: true,
    responsibleDirectorName: 'Rajeshwar K. Singhania',
    responsibleDirectorDin: 'DIN-00192847',
    reviewFrequency: 'Quarterly',
    materialityAssessmentYear: '2024',
    activeGrievancesCount: 12,
    resolvedGrievancesPercent: 96.4
  },

  sectionC: {
    // P1: Ethics, Transparency & Accountability
    p1_antiCorruptionPolicyCoveragePercent: 100,
    p1_regulatoryFinesPaidInr: 0,
    p1_briberyComplaintsReceived: 0,

    // P2: Sustainable Products & Life Cycle
    p2_recycledInputsPercent: 34.8,
    p2_lifeCycleAssessmentCoveragePercent: 78.5,
    p2_extendedProducerResponsibilityCompliant: true,

    // P3: Employee Well-being & Safety
    p3_lostTimeInjuryFrequencyRate: 0.42,
    p3_safetyTrainingCoveragePercent: 98.7,
    p3_healthInsuranceCoveragePercent: 100,
    p3_parentalLeaveReturnRatePercent: 97.2,

    // P4: Stakeholder Engagement
    p4_marginalizedConsultationsCount: 28,
    p4_stakeholderConcernsAddressedPercent: 95.0,

    // P5: Human Rights
    p5_minimumWageCompliancePercent: 100,
    p5_childForcedLaborAuditsPassedPercent: 100,
    p5_poshHarassmentComplaintsPending: 0,

    // P6: Environment (Key ESG Disclosures)
    p6_scope1DirectEmissionsMtCo2e: 1824000,
    p6_scope2IndirectEmissionsMtCo2e: 412500,
    p6_totalEnergyConsumptionMwh: 4890000,
    p6_renewableEnergyPercent: 32.4,
    p6_waterWithdrawalKl: 12450000,
    p6_waterRecycledKl: 4210000,
    p6_hazardousWasteRecycledPercent: 94.2,

    // P7: Responsible Public Policy & Advocacy
    p7_tradeAssociationsCount: 6,
    p7_publicAdvocacyExpenditureInr: 12500000,

    // P8: Inclusive Growth & Community (CSR)
    p8_csrSpendPercentNetProfit: 2.15, // Meets SEBI mandated 2% rule
    p8_aspirationalDistrictsBeneficiaries: 184500,
    p8_localCommunityProjectsCount: 42,

    // P9: Consumer Value & Responsibility
    p9_dataPrivacyBreachesReported: 0,
    p9_customerComplaintsResolvedPercent: 99.1,
    p9_productRecallCount: 0
  }
};

// Initial Merkle root recalculation
INITIAL_BRSR_REPORT.metadata.merkleRootHash = computeReportMerkleRoot(INITIAL_BRSR_REPORT);
INITIAL_BRSR_REPORT.metadata.digitalSignature = signPayload(
  INITIAL_BRSR_REPORT.metadata.merkleRootHash,
  INITIAL_USERS[0].digitalKeyId
);

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2025-05-15T09:12:00.000Z',
    actorId: 'user_reporter',
    actorName: 'Ananya Sharma',
    actorRole: 'reporter',
    action: 'CREATE',
    section: 'Section C - P6 (Environment)',
    field: 'p6_scope1DirectEmissionsMtCo2e',
    previousValue: 0,
    newValue: 1845000,
    justification: 'Initial upload of plant-level continuous emission monitoring reports (CEMS)',
    recordHash: '4a87c1f8876214d081f9b3b246a49c95191f61a1537841c305a415510255b632',
    signature: '0x99281a...48bf12'
  },
  {
    id: 'aud-002',
    timestamp: '2025-05-16T14:30:00.000Z',
    actorId: 'user_analyst',
    actorName: 'Dr. Vikram Rao',
    actorRole: 'analyst',
    action: 'ANALYST_RECALCULATION',
    section: 'Section C - P6 (Environment)',
    field: 'p6_scope1DirectEmissionsMtCo2e',
    previousValue: 1845000,
    newValue: 1824000,
    justification: 'Deducted certified carbon-neutral biomethane feedstock credit verified at Kalinganagar plant',
    recordHash: '72e519cbbd377b2bb5e8e35327297e682e70e9b97779d72be556d405230ef1d2',
    signature: '0x33b15c...e290ab'
  },
  {
    id: 'aud-003',
    timestamp: '2025-05-17T11:20:00.000Z',
    actorId: 'user_reporter',
    actorName: 'Ananya Sharma',
    actorRole: 'reporter',
    action: 'UPDATE',
    section: 'Section C - P8 (CSR)',
    field: 'p8_csrSpendPercentNetProfit',
    previousValue: 2.05,
    newValue: 2.15,
    justification: 'Added Q4 audited tribal education scholarship outlays in aspirational districts',
    recordHash: 'bf60744e8774f7626960d7506634839cfbe127e9545465545a05b38e4a905a81',
    signature: '0x44f910...cd5591'
  }
];

export const INITIAL_ANALYST_ADJUSTMENTS: AnalystAdjustment[] = [
  {
    id: 'adj-001',
    metricKey: 'p6_scope1DirectEmissionsMtCo2e',
    metricLabel: 'Direct Greenhouse Gas Emissions (Scope 1)',
    originalValue: 1845000,
    adjustedValue: 1824000,
    unit: 'Metric Tonnes CO2e',
    adjustmentFactor: 'Biomethane Net-Zero Reconciliation factor (v4.2)',
    reason: 'Verified supplier certified carbon avoidance certificates for bio-coal injection at blast furnace 3.',
    timestamp: '2025-05-16T14:30:00.000Z',
    analystName: 'Dr. Vikram Rao',
    analystId: 'user_analyst',
    status: 'APPLIED'
  },
  {
    id: 'adj-002',
    metricKey: 'p6_scope2IndirectEmissionsMtCo2e',
    metricLabel: 'Grid Electricity Purchased Emissions (Scope 2)',
    originalValue: 421000,
    adjustedValue: 412500,
    unit: 'Metric Tonnes CO2e',
    adjustmentFactor: 'Central Electricity Authority (CEA) Grid Baseline v19 (0.716 kg CO2/kWh)',
    reason: 'Updated regional grid emission factor using latest CEA national grid carbon database publication.',
    timestamp: '2025-05-17T16:15:00.000Z',
    analystName: 'Dr. Vikram Rao',
    analystId: 'user_analyst',
    status: 'APPLIED'
  }
];
