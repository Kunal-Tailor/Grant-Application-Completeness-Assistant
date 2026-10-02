import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet } from '../db/database';
import { VersionService } from './versionService';
import { AIService } from './aiService';
import { ScoringService } from './scoringService';
import { StructuredLogger } from '../logger';

export interface SampleScenario {
  id: string;
  name: string;
  tagline: string;
  category: string;
  guideline: {
    title: string;
    content: string;
  };
  application: {
    title: string;
    applicant_name: string;
    content: string;
  };
  supporting_docs: Array<{
    name: string;
    doc_type: string;
    description: string;
    is_mandatory: boolean;
    is_attached: boolean;
    verified_tag: string;
  }>;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'cleantech-horizon-2026',
    name: 'CleanTech Horizon 2026: Green Hydrogen Electrolyzer',
    tagline: 'Renewable energy & modular industrial hydrogen infrastructure proposal',
    category: 'Clean Energy & Climate',
    guideline: {
      title: 'Horizon 2026: Clean Hydrogen & Industrial Decarbonization Grant Call',
      content: `# European Clean Hydrogen & Industrial Decarbonization Framework (Call Horizon-2026-H2)

## 1. Eligibility Gates & Applicant Requirements
- **1.1 Legal Entity & Territory**: Applicants must be legally incorporated enterprises or accredited research consortia operating within participating member states with a minimum of 2 consecutive operating years.
- **1.2 SME & Consortia Eligibility**: Consortia must consist of at least one commercial technology provider and one certified industrial off-taker or academic validation partner.

## 2. Technical Scope & Technology Readiness Level (TRL)
- **2.1 TRL Progression**: Projects must start at a minimum of TRL 4 (laboratory validated) and demonstrate a clear path to TRL 7 (operational environment demonstration) within the 24-month grant lifecycle.
- **2.2 Work Packages & Milestones**: Detailed technical work plan must divide project deliverables into numbered Work Packages (WP1 to WP5) with defined quarterly milestones and verifiable acceptance metrics.
- **2.3 Open Science & Data Management (Recommended)**: Proposals providing open-source access or publicly accessible telemetry repositories will receive preferential scoring bonus.

## 3. Financial Planning & Cost Structure
- **3.1 Eligible Budget Breakdown**: Itemized expenditure sheet must clearly allocate costs across personnel, capital equipment depreciation, subcontracted engineering, and dissemination.
- **3.2 Mandatory Match Funding**: A minimum 25% non-grant matching co-funding commitment is mandatory and must be evidenced by formal bank guarantees or binding investor commitments.

## 4. Impact, Sustainability & Environmental Auditing
- **4.1 Quantified Lifecycle CO2 Savings**: Applications must supply quantified Scope 1-3 lifecycle greenhouse gas reduction projections benchmarked against current grey hydrogen production (min. 70% reduction).
- **4.2 Stakeholder & Community Inclusivity (Recommended)**: Proactive community engagement and workforce green-skills transition programs are strongly encouraged for extra impact credit.

## 5. Risk Governance & Compliance
- **5.1 Risk Assessment Matrix**: Comprehensive risk register identifying technical risks (membrane degradation, thermal runaway), supply chain risks, and regulatory compliance.
- **5.2 Quality Management Certification**: Applicants must hold or actively comply with ISO 9001 / ISO 14001 quality management standards.`,
    },
    application: {
      title: 'HydroVanguard: High-Efficiency Proton Exchange Membrane (PEM) Electrolyzer Stack',
      applicant_name: 'HydroVanguard Clean Energy Ltd. (Lead) & Nordic Steel Consortium',
      content: `# HydroVanguard: High-Efficiency Modular PEM Hydrogen Electrolyzer

## 1. Executive Summary & Organizational Eligibility
HydroVanguard Clean Energy Ltd. is an incorporated cleantech enterprise founded in 2023, headquartered in Rotterdam, Netherlands, partnered with Nordic Steel AB (industrial off-taker). We specialize in next-generation catalyst coatings that reduce precious platinum group metal (PGM) loading by 60% while increasing current density.

## 2. Technical Methodology & Work Package Plan
Our project advances from existing TRL 5 pilot prototypes to a containerized 1.5 MW field-deployed TRL 7 unit operating at Nordic Steel's rolling mill facility.

- **Work Package 1 (M1-M6)**: Advanced Membrane Electrode Assembly (MEA) fabrication and durability stress testing.
- **Work Package 2 (M7-M12)**: 1.5 MW Stack integration and automated power electronics control subsystem.
- **Work Package 3 (M13-M18)**: Balance of Plant (BoP) skids and water purification module manufacturing.
- **Work Package 4 (M19-M24)**: Field commissioning, industrial steel off-taker trials, and 1,000-hour continuous telemetry testing.

Our technical architecture guarantees 100% zero degradation over 10 years of continuous peak load cycling without cell stack refurbishment.

## 3. Financial Plan & Match Funding
Total grant request: €2,400,000 against a total project budget of €3,200,000.
Nordic Steel AB has pledged €800,000 (25% match funding) through cash co-investment and facility access agreements. Budget allocations: Personnel (€1.4M), Equipment & Components (€1.1M), Subcontracting (€450k), Dissemination & Travel (€250k).

## 4. Environmental Impact & Lifecycle Decarbonization
The 1.5 MW HydroVanguard unit will generate 260 metric tons of pure green hydrogen annually, displacing 2,400 metric tons of CO2 emissions from coal-derived syngas, achieving an estimated 82% lifecycle carbon reduction compared to EU benchmark grey hydrogen.

## 5. Governance, Risk Matrix & Team Leadership
Dr. Elena Rostova (Chief Technology Officer, ex-Fraunhofer ISE) leads technical execution alongside Marcus Lindqvist (VP Operations, Nordic Steel). Risk mitigations include dual-sourcing membrane suppliers and automated nitrogen purging fail-safes. We follow ISO-aligned internal quality control processes.`,
    },
    supporting_docs: [
      {
        name: 'Consortium Agreement & MOU (Signed)',
        doc_type: 'Legal Document',
        description: 'Binding partner agreement between HydroVanguard Ltd and Nordic Steel AB.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified Signed PDF',
      },
      {
        name: 'Bank Guarantee & Match Funding Letter',
        doc_type: 'Financial Verification',
        description: 'Letter of commitment for €800,000 match funding from ABN AMRO / Nordic Steel.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified Certified Letter',
      },
      {
        name: 'ISO 9001 / 14001 Quality Management Certificate',
        doc_type: 'Compliance Certificate',
        description: 'Official third-party accredited ISO 9001 / ISO 14001 certificate.',
        is_mandatory: true,
        is_attached: false, // Intentionally missing to test checklist & penalty detection!
        verified_tag: 'Missing Required Attachment',
      },
      {
        name: 'Key Personnel CVs & Track Record Portfolio',
        doc_type: 'Personnel Records',
        description: 'Detailed curriculum vitae for Dr. Rostova and core engineering team.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified CV Bundle',
      },
      {
        name: 'Community Clean Tech Transition Plan (Recommended)',
        doc_type: 'Stakeholder Document',
        description: 'Local stakeholder engagement and green technician training proposal.',
        is_mandatory: false,
        is_attached: true,
        verified_tag: 'Verified Supporting Doc',
      },
    ],
  },
  {
    id: 'sbir-phase1-pediatric-ai',
    name: 'NIH SBIR Phase I: AI Diagnostic Oncology Assistant',
    tagline: 'Pediatric imaging AI assistant for rapid osteosarcoma detection',
    category: 'Biomedical & Healthcare AI',
    guideline: {
      title: 'NIH/NSF SBIR Phase I: AI Clinical Decision Support Tools (PA-26-001)',
      content: `# NIH Small Business Innovation Research (SBIR) Phase I Guidelines

## 1. Small Business Qualifications & PI Employment
- **1.1 Small Business Eligibility**: The applicant must qualify as an eligible Small Business Concern (SBC) under US SBA regulations (<500 employees, >51% US citizen/resident owned).
- **1.2 Principal Investigator (PI) Primary Employment**: The PI must be primarily employed (>51% of work time) by the applicant SBC at the time of award.

## 2. Scientific & Technical Feasibility
- **2.1 Specific Aims & Milestones**: Phase I proposals must present clear, measurable Aim 1 and Aim 2 milestones demonstrating feasibility before progressing to Phase II clinical validation.
- **2.2 Algorithmic Transparency & Fairness (Recommended)**: Proposals incorporating model interpretability mechanisms and bias audits across multi-ethnic cohorts are strongly encouraged.

## 3. Human Subjects, IRB & Data Privacy Protection
- **3.1 Institutional Review Board (IRB) Protocol**: If human imaging datasets or clinical retrospective records are used, an active IRB exemption determination or full protocol approval number must be documented.
- **3.2 HIPAA / GDPR Compliance Architecture**: Technical safeguards including AES-256 data encryption at rest and in transit, de-identification pipelines (Safe Harbor method), and role-based access control must be explicitly detailed.

## 4. Budget & Commercialization Strategy
- **4.1 Phase I Budget Ceiling**: Total direct and indirect costs must not exceed $300,000 for a 6-to-12-month Phase I feasibility effort.
- **4.2 Commercial Letters of Support (Recommended)**: Letters from pediatric hospital networks expressing interest in clinical pilot testing will receive positive commercial scoring weight.`,
    },
    application: {
      title: 'OsteoVision-AI: Multi-Modal Deep Learning Platform for Pediatric Bone Oncology Detection',
      applicant_name: 'BioVision Health Technologies Inc. (Boston, MA)',
      content: `# OsteoVision-AI: Multi-Modal Pediatric Bone Oncology Detection

## 1. Small Business Qualification & PI Commitment
BioVision Health Technologies Inc. is a Delaware C-Corp founded in 2024 with 6 full-time employees. Dr. Sarah Chen, MD/PhD, is our Principal Investigator and devotes 80% of her professional effort directly to BioVision Health.

## 2. Specific Aims & Technical Feasibility
- **Aim 1 (Months 1-4)**: Train a 3D vision transformer on 4,500 annotated pediatric CT/MRI scans from our academic partner consortium.
- **Aim 2 (Months 5-9)**: Benchmark model inference against 5 board-certified pediatric radiologists in double-blinded retrospective trials.

Our proprietary architecture will achieve 99.9% diagnostic sensitivity and flawless zero false negatives across all pediatric tumor classifications.

## 3. Regulatory Compliance, IRB Protocol & HIPAA Architecture
We strictly enforce HIPAA compliant AWS HealthLake infrastructure with AES-256 encryption. Patient identifiable information is stripped using automated NLP de-identification algorithms. Institutional Review Board (IRB) review is currently submitted to Boston Children's Hospital Ethics Board under expedited protocol review #IRB-2026-881.

## 4. Budget Justification & Commercialization Roadmap
We request $298,500 over 9 months. Budget allocates: PI Dr. Chen ($110,000), Senior ML Engineer ($95,000), AWS GPU compute clusters ($55,000), Clinical annotation subcontracts ($38,500). Preliminary commercial discussions are underway with 3 major children's hospital networks.`,
    },
    supporting_docs: [
      {
        name: 'SBA SBC Eligibility Certification',
        doc_type: 'Legal Verification',
        description: 'Official SBA small business qualification certificate.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified SBA Form',
      },
      {
        name: 'IRB Protocol Approval / Exemption Letter',
        doc_type: 'Regulatory Document',
        description: 'IRB Ethics Committee formal letter of approval.',
        is_mandatory: true,
        is_attached: false, // Pending / missing attachment
        verified_tag: 'Pending Approval',
      },
      {
        name: 'Hospital Network Letters of Support (LOS)',
        doc_type: 'Commercial Evidence',
        description: 'Letters from clinical directors endorsing pilot trials.',
        is_mandatory: false,
        is_attached: true,
        verified_tag: 'Verified Letter',
      },
      {
        name: 'PI Employment & Biosketch (NIH Format)',
        doc_type: 'Personnel Record',
        description: 'Standard NIH biosketch for Dr. Sarah Chen.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified NIH Biosketch',
      },
    ],
  },
  {
    id: 'urban-climate-resilience',
    name: 'Municipal Green Canopy & Urban Resilience Grant',
    tagline: 'Neighborhood urban forestry and stormwater micro-wetlands proposal',
    category: 'Civic Ecology & Urban Planning',
    guideline: {
      title: 'Urban Climate Resilience & Biodiversity Fund 2026',
      content: `# Urban Climate Resilience & Green Canopy Initiative Guidelines

## 1. Applicant Eligibility & Municipal Partnership
- **1.1 Eligible Entities**: Non-profit 501(c)(3) community organizations, civic trusts, or accredited botanical societies partnering with municipal public works departments.
- **1.2 Mandatory Municipal Authorization**: A signed letter of municipal land-use consent and maintenance access permit must be provided.

## 2. Project Scope, GIS Site Plans & Biodiversity
- **2.1 Quantified Canopy Targets & GIS Mapping**: Applications must include detailed GIS site maps indicating tree species, planting density, and a minimum target of 500 indigenous native trees planted.
- **2.2 Stormwater Retention Modeling**: Technical estimates of annual rainwater runoff diverted from municipal sewer systems (min. 1,000,000 gallons/year).
- **2.3 Youth Environmental Stewardship Pipeline (Recommended)**: Programs offering paid green-job internships to local youth will receive priority ranking.

## 3. Financial Accountability & Community Engagement
- **3.1 Budget Breakdown & Matching In-Kind**: Maximum grant $150,000. Must demonstrate at least 15% community volunteer in-kind match.
- **3.2 Public Community Consultation Workshop**: Mandatory requirement to hold at least two publicized public community input sessions prior to ground-breaking.`,
    },
    application: {
      title: 'GreenCanopy Detroit: Urban Micro-Forests and Stormwater Bioswales',
      applicant_name: 'Detroit Urban Ecology Trust & City Parks Dept.',
      content: `# GreenCanopy Detroit: Urban Micro-Forests and Stormwater Bioswales

## 1. Applicant Profile & Municipal Co-Sponsorship
The Detroit Urban Ecology Trust (501c3 tax-exempt non-profit, established 2018) in formal partnership with the City of Detroit Department of Public Works and Parks Commission submits this proposal.

## 2. Technical Scope, GIS Planning & Stormwater Retention
We will transform 8 vacant municipal parcels into biodiverse urban micro-forests by planting 750 native oak, maple, and dogwood saplings. Comprehensive GIS boundary surveys have been finalized. Engineering calculations estimate 1,450,000 gallons of stormwater runoff will be captured annually, substantially relieving combined sewer overflow pressure during peak storm events.

## 3. Youth Apprenticeship & Community Engagement
We have established a paid 8-week Summer Youth Green Jobs internship program for 20 local high school students. Two public neighborhood community forums were conducted in January and March 2026 with over 140 neighborhood residents attending and voting in favor.

## 4. Itemized Budget & In-Kind Match
Total Grant Request: $148,000. Matching volunteer labor and nursery donations total $28,500 (19.2% match, exceeding the 15% requirement). Budget includes: Saplings & soil amendments ($62,000), Irrigation skids ($36,000), Youth intern stipends ($32,000), Community outreach and tools ($18,000).`,
    },
    supporting_docs: [
      {
        name: '501(c)(3) IRS Determination Letter',
        doc_type: 'Legal Verification',
        description: 'Official IRS tax-exemption verification letter.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified IRS Document',
      },
      {
        name: 'Municipal Land-Use Permit & Consent Letter',
        doc_type: 'Government Authorization',
        description: 'City of Detroit Parks Commission signed access agreement.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified City Permit',
      },
      {
        name: 'GIS Parcel Survey & Species Layout Maps',
        doc_type: 'Technical Documentation',
        description: 'High-resolution GIS maps and arboricultural layout plan.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified GIS Pack',
      },
      {
        name: 'Community Consultation Meeting Minutes & Sign-in Sheets',
        doc_type: 'Community Evidence',
        description: 'Notarized attendance sheets and minutes from public town halls.',
        is_mandatory: true,
        is_attached: true,
        verified_tag: 'Verified Community Record',
      },
    ],
  },
];

export async function seedSampleDataIfEmpty() {
  const existingCount = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM guidelines`);
  if (existingCount && existingCount.count > 0) {
    console.log(`Database already contains ${existingCount.count} guidelines. Skipping auto-seed.`);
    return;
  }

  console.log('Seeding initial rich sample grant scenarios...');
  for (const scenario of SAMPLE_SCENARIOS) {
    await loadSampleScenario(scenario.id);
  }
  console.log('Sample scenarios loaded successfully.');
}

export async function loadSampleScenario(scenarioId: string): Promise<string> {
  const scenario = SAMPLE_SCENARIOS.find((s) => s.id === scenarioId) || SAMPLE_SCENARIOS[0];

  const guidelineId = `guide-${scenario.id}`;
  const applicationId = `app-${scenario.id}`;
  const assessmentId = `assess-${scenario.id}`;

  const guideHash = VersionService.generateHash(scenario.guideline.content);
  const appHash = VersionService.generateHash(scenario.application.content);

  // 1. Insert/Update Guideline
  await dbRun(
    `INSERT INTO guidelines (id, title, content, version, hash, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, content=excluded.content, version=1, hash=excluded.hash, updated_at=CURRENT_TIMESTAMP`,
    [guidelineId, scenario.guideline.title, scenario.guideline.content, guideHash]
  );

  // 2. Insert/Update Application
  await dbRun(
    `INSERT INTO applications (id, guideline_id, title, applicant_name, content, version, hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET guideline_id=excluded.guideline_id, title=excluded.title, applicant_name=excluded.applicant_name, content=excluded.content, version=1, hash=excluded.hash, updated_at=CURRENT_TIMESTAMP`,
    [applicationId, guidelineId, scenario.application.title, scenario.application.applicant_name, scenario.application.content, appHash]
  );

  // 3. Clear and re-populate supporting documents
  await dbRun(`DELETE FROM supporting_documents WHERE application_id = ?`, [applicationId]);
  for (const doc of scenario.supporting_docs) {
    await dbRun(
      `INSERT INTO supporting_documents (id, application_id, name, doc_type, description, is_mandatory, is_attached, verified_tag)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        applicationId,
        doc.name,
        doc.doc_type,
        doc.description,
        doc.is_mandatory ? 1 : 0,
        doc.is_attached ? 1 : 0,
        doc.verified_tag,
      ]
    );
  }

  // 4. Run AI Analysis
  const aiResult = await AIService.analyzeApplication(
    scenario.guideline.title,
    scenario.guideline.content,
    scenario.application.title,
    scenario.application.content,
    scenario.supporting_docs
  );

  // 5. Calculate Deterministic Score
  const scoreResult = ScoringService.calculateScore(
    aiResult.requirements,
    scenario.supporting_docs,
    aiResult.unsubstantiated_claims
  );

  // 6. Save Assessment
  await dbRun(
    `INSERT INTO assessments (
      id, application_id, guideline_id, app_version_analyzed, guideline_version_analyzed,
      app_hash_analyzed, guideline_hash_analyzed, is_stale,
      deterministic_score, mandatory_score, recommended_score,
      total_requirements, mandatory_count, mandatory_fulfilled,
      recommended_count, recommended_fulfilled, missing_docs_count,
      unsubstantiated_claims_count, summary_markdown, legal_disclaimer_acknowledged, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, 1, 1, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      is_stale = 0,
      deterministic_score = excluded.deterministic_score,
      mandatory_score = excluded.mandatory_score,
      recommended_score = excluded.recommended_score,
      total_requirements = excluded.total_requirements,
      mandatory_count = excluded.mandatory_count,
      mandatory_fulfilled = excluded.mandatory_fulfilled,
      recommended_count = excluded.recommended_count,
      recommended_fulfilled = excluded.recommended_fulfilled,
      missing_docs_count = excluded.missing_docs_count,
      unsubstantiated_claims_count = excluded.unsubstantiated_claims_count,
      summary_markdown = excluded.summary_markdown,
      updated_at = CURRENT_TIMESTAMP`,
    [
      assessmentId,
      applicationId,
      guidelineId,
      appHash,
      guideHash,
      scoreResult.deterministic_score,
      scoreResult.mandatory_score,
      scoreResult.recommended_score,
      scoreResult.total_requirements,
      scoreResult.mandatory_count,
      scoreResult.mandatory_fulfilled,
      scoreResult.recommended_count,
      scoreResult.recommended_fulfilled,
      scoreResult.missing_docs_count,
      scoreResult.unsubstantiated_claims_count,
      aiResult.summary_markdown,
    ]
  );

  // 7. Clear and insert requirements
  await dbRun(`DELETE FROM requirements WHERE assessment_id = ?`, [assessmentId]);
  for (const req of aiResult.requirements) {
    const reqId = uuidv4();
    await dbRun(
      `INSERT INTO requirements (
        id, assessment_id, req_code, category, title, description,
        is_mandatory, guideline_citation, mapping_status, evidence_strength,
        human_status, application_citation, missing_elements,
        clarification_question, confidence_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        reqId,
        assessmentId,
        req.req_code,
        req.category,
        req.title,
        req.description,
        req.is_mandatory ? 1 : 0,
        JSON.stringify(req.guideline_citation),
        req.mapping_status,
        req.evidence_strength,
        JSON.stringify(req.application_citation),
        JSON.stringify(req.missing_elements || []),
        req.clarification_question || null,
        req.confidence_score,
      ]
    );
  }

  // 8. Clear and insert claims
  await dbRun(`DELETE FROM unsubstantiated_claims WHERE assessment_id = ?`, [assessmentId]);
  for (const claim of aiResult.unsubstantiated_claims) {
    await dbRun(
      `INSERT INTO unsubstantiated_claims (
        id, assessment_id, claim_text, section, severity, explanation, recommended_evidence, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'flagged')`,
      [
        uuidv4(),
        assessmentId,
        claim.claim_text,
        claim.section,
        claim.severity,
        claim.explanation,
        claim.recommended_evidence,
      ]
    );
  }

  // 9. Clear and insert clarification questions
  await dbRun(`DELETE FROM clarification_questions WHERE assessment_id = ?`, [assessmentId]);
  for (const q of aiResult.clarification_questions) {
    await dbRun(
      `INSERT INTO clarification_questions (
        id, assessment_id, question, priority, context_hint, status
      ) VALUES (?, ?, ?, ?, ?, 'open')`,
      [uuidv4(), assessmentId, q.question, q.priority, q.context_hint]
    );
  }

  // Audit log
  await StructuredLogger.audit(
    'SAMPLE_SCENARIO_LOADED',
    'SYSTEM',
    { scenarioId, scenarioName: scenario.name, assessmentId },
    assessmentId
  );

  return assessmentId;
}
