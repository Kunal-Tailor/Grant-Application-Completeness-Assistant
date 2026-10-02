import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  Assessment,
  Application,
  Guideline,
  Requirement,
  SupportingDocument,
  UnsubstantiatedClaim,
  ClarificationQuestion,
  ScenarioMeta,
  AuditLog,
} from './types';
import { Header } from './components/Header';
import { LegalDisclaimerBanner } from './components/LegalDisclaimerBanner';
import { StalenessAlert } from './components/StalenessAlert';
import { CompletenessScorecard } from './components/CompletenessScorecard';
import { RequirementCard } from './components/RequirementCard';
import { SupportingDocsManager } from './components/SupportingDocsManager';
import { UnsubstantiatedClaimsView } from './components/UnsubstantiatedClaimsView';
import { ClarificationQuestionsView } from './components/ClarificationQuestionsView';
import { DocumentEditor } from './components/DocumentEditor';
import { AuditLogsDrawer } from './components/AuditLogsDrawer';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Flame,
  HelpCircle,
  Paperclip,
  FileEdit,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Layers,
} from 'lucide-react';

export function App() {
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('cleantech-horizon-2026');

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [guideline, setGuideline] = useState<Guideline | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [supportingDocs, setSupportingDocs] = useState<SupportingDocument[]>([]);
  const [unsubstantiatedClaims, setUnsubstantiatedClaims] = useState<UnsubstantiatedClaim[]>([]);
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);

  const [activeTab, setActiveTab] = useState<'requirements' | 'claims' | 'clarifications' | 'documents' | 'editor'>('requirements');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'mandatory' | 'recommended' | 'fulfilled' | 'gaps'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // API Key State
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('llm_api_key') || '');
  const [provider, setProvider] = useState<string>(localStorage.getItem('llm_provider') || 'builtin');

  // Load scenarios on mount
  useEffect(() => {
    loadScenariosAndDefault();
  }, []);

  const loadScenariosAndDefault = async () => {
    try {
      setIsLoading(true);
      const list = await api.getScenarios();
      setScenarios(list);
      if (list.length > 0) {
        const defaultId = list[0].id;
        setSelectedScenarioId(defaultId);
        await loadAssessmentByScenario(defaultId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize scenarios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssessmentByScenario = async (scenarioId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const assessmentId = await api.loadScenario(scenarioId);
      await refreshAssessmentData(assessmentId);
    } catch (err: any) {
      setError(err.message || 'Failed to load scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAssessmentData = async (assessmentId: string) => {
    const data = await api.getAssessment(assessmentId);
    setAssessment(data.assessment);
    setApplication(data.application);
    setGuideline(data.guideline);
    setRequirements(data.requirements);
    setSupportingDocs(data.supportingDocs);
    setUnsubstantiatedClaims(data.unsubstantiatedClaims);
    setClarificationQuestions(data.clarificationQuestions);

    if (data.assessment.scoring_details.deterministic_score >= 95) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  // Re-run AI Analysis
  const handleReanalyze = async () => {
    if (!application || !guideline) return;
    setIsAnalyzing(true);
    try {
      const res = await api.reanalyzeAssessment(application.id, guideline.id, apiKey, provider);
      await refreshAssessmentData(res.assessmentId);
    } catch (err: any) {
      setError(err.message || 'AI Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Human Review Action on a requirement
  const handleReviewRequirement = async (
    reqId: string,
    payload: {
      humanStatus: 'confirmed' | 'corrected' | 'rejected' | 'pending';
      humanNotes?: string;
      mappingStatus?: 'fulfilled' | 'partially_fulfilled' | 'missing' | 'ambiguous';
      evidenceStrength?: 'strong' | 'moderate' | 'weak' | 'none';
      correctedQuote?: string;
    }
  ) => {
    if (!assessment) return;
    try {
      await api.reviewRequirement(assessment.id, reqId, payload);
      await refreshAssessmentData(assessment.id);
    } catch (err: any) {
      setError(err.message || 'Failed to update requirement');
    }
  };

  // Toggle supporting document
  const handleToggleDoc = async (docId: string, isAttached: boolean) => {
    if (!assessment) return;
    try {
      await api.toggleSupportingDoc(assessment.id, docId, isAttached);
      await refreshAssessmentData(assessment.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update claim status
  const handleUpdateClaimStatus = async (claimId: string, status: 'flagged' | 'resolved' | 'dismissed') => {
    if (!assessment) return;
    try {
      await api.updateClaimStatus(assessment.id, claimId, status);
      await refreshAssessmentData(assessment.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Answer clarification question
  const handleAnswerQuestion = async (questionId: string, applicantResponse: string) => {
    if (!assessment) return;
    try {
      await api.answerQuestion(assessment.id, questionId, applicantResponse, 'resolved');
      await refreshAssessmentData(assessment.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Save Application Edits
  const handleSaveApplication = async (content: string, title?: string, summary?: string) => {
    if (!application || !assessment) return;
    try {
      await api.updateApplicationContent(application.id, content, title, summary);
      await refreshAssessmentData(assessment.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Save Guideline Edits
  const handleSaveGuideline = async (content: string, title?: string, summary?: string) => {
    if (!guideline || !assessment) return;
    try {
      await api.updateGuidelineContent(guideline.id, content, title, summary);
      await refreshAssessmentData(assessment.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open Audit Logs
  const handleOpenAuditLogs = async () => {
    if (assessment) {
      const logs = await api.getAuditLogs(assessment.id);
      setAuditLogs(logs);
    }
    setIsAuditLogsOpen(true);
  };

  // Filtered requirements
  const filteredRequirements = requirements.filter((req) => {
    // Filter by type
    if (filterType === 'mandatory' && !req.is_mandatory) return false;
    if (filterType === 'recommended' && req.is_mandatory) return false;
    if (filterType === 'fulfilled' && req.mapping_status !== 'fulfilled') return false;
    if (filterType === 'gaps' && req.mapping_status === 'fulfilled') return false;

    // Filter by category
    if (filterCategory !== 'all' && req.category !== filterCategory) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = req.req_code.toLowerCase().includes(q);
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      const matchQuote = req.application_citation?.quote?.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDesc && !matchQuote) return false;
    }

    return true;
  });

  const categories = Array.from(new Set(requirements.map((r) => r.category)));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <Header
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={(id) => {
          setSelectedScenarioId(id);
          loadAssessmentByScenario(id);
        }}
        onReanalyze={handleReanalyze}
        isAnalyzing={isAnalyzing}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenAuditLogs={handleOpenAuditLogs}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        provider={provider}
      />

      <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px 28px', flex: 1 }}>
        {/* Advisory Disclaimer Notice */}
        <LegalDisclaimerBanner
          acknowledged={assessment?.legal_disclaimer_acknowledged || 0}
          onAcknowledge={async () => {
            if (assessment) await api.acknowledgeDisclaimer(assessment.id);
          }}
        />

        {/* Staleness Alert Banner */}
        {assessment && (
          <StalenessAlert
            isStale={assessment.is_stale}
            reason={assessment.staleness_reason}
            onReanalyze={handleReanalyze}
            isLoading={isAnalyzing}
          />
        )}

        {/* Global Error Notice */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: '#fca5a5',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="btn btn-sm btn-secondary">
              Dismiss
            </button>
          </div>
        )}

        {isLoading || !assessment ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Loading Completeness Assessment...</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
              Extracting eligibility criteria, mapping application evidence, and computing deterministic scores.
            </p>
          </div>
        ) : (
          <>
            {/* Completeness Scorecard Header */}
            <CompletenessScorecard
              scoring={assessment.scoring_details}
              assessment={assessment}
              totalClaims={unsubstantiatedClaims.filter((c) => c.status === 'flagged').length}
              totalQuestions={clarificationQuestions.filter((q) => q.status === 'open').length}
            />

            {/* Workbench Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '24px',
              }}
            >
              <button
                onClick={() => setActiveTab('requirements')}
                style={{
                  background: activeTab === 'requirements' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: activeTab === 'requirements' ? '#38bdf8' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: activeTab === 'requirements' ? '2px solid #38bdf8' : '2px solid transparent',
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <CheckSquare size={16} />
                <span>Requirements Checklist ({requirements.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('claims')}
                style={{
                  background: activeTab === 'claims' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  color: activeTab === 'claims' ? '#fbbf24' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: activeTab === 'claims' ? '2px solid #fbbf24' : '2px solid transparent',
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Flame size={16} />
                <span>Unsupported Claims ({unsubstantiatedClaims.filter((c) => c.status === 'flagged').length})</span>
              </button>

              <button
                onClick={() => setActiveTab('clarifications')}
                style={{
                  background: activeTab === 'clarifications' ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                  color: activeTab === 'clarifications' ? '#c084fc' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: activeTab === 'clarifications' ? '2px solid #c084fc' : '2px solid transparent',
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <HelpCircle size={16} />
                <span>Clarification Questions ({clarificationQuestions.filter((q) => q.status === 'open').length})</span>
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                style={{
                  background: activeTab === 'documents' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: activeTab === 'documents' ? '#34d399' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: activeTab === 'documents' ? '2px solid #34d399' : '2px solid transparent',
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Paperclip size={16} />
                <span>Supporting Docs ({supportingDocs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                style={{
                  background: activeTab === 'editor' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: activeTab === 'editor' ? '#f1f5f9' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: activeTab === 'editor' ? '2px solid #f1f5f9' : '2px solid transparent',
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <FileEdit size={16} />
                <span>Document & Version Editor</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'requirements' && (
              <div className="animate-fade-in">
                {/* Filters & Search Toolbar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '18px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setFilterType('all')}
                      className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      All ({requirements.length})
                    </button>
                    <button
                      onClick={() => setFilterType('mandatory')}
                      className={`btn btn-sm ${filterType === 'mandatory' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Mandatory Only ({requirements.filter((r) => r.is_mandatory).length})
                    </button>
                    <button
                      onClick={() => setFilterType('recommended')}
                      className={`btn btn-sm ${filterType === 'recommended' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Recommendations ({requirements.filter((r) => !r.is_mandatory).length})
                    </button>
                    <button
                      onClick={() => setFilterType('fulfilled')}
                      className={`btn btn-sm ${filterType === 'fulfilled' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Fulfilled ({requirements.filter((r) => r.mapping_status === 'fulfilled').length})
                    </button>
                    <button
                      onClick={() => setFilterType('gaps')}
                      className={`btn btn-sm ${filterType === 'gaps' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Gaps / Missing ({requirements.filter((r) => r.mapping_status !== 'fulfilled').length})
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Category Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                        }}
                      >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Input */}
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search requirement / evidence..."
                        style={{
                          padding: '6px 12px 6px 30px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          width: '220px',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Requirement Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredRequirements.map((req) => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      onReview={(payload) => handleReviewRequirement(req.id, payload)}
                    />
                  ))}
                  {filteredRequirements.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No requirements match your active filter criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="animate-fade-in">
                <UnsubstantiatedClaimsView
                  claims={unsubstantiatedClaims}
                  onUpdateClaimStatus={handleUpdateClaimStatus}
                />
              </div>
            )}

            {activeTab === 'clarifications' && (
              <div className="animate-fade-in">
                <ClarificationQuestionsView
                  questions={clarificationQuestions}
                  onAnswerQuestion={handleAnswerQuestion}
                />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="animate-fade-in">
                <SupportingDocsManager
                  documents={supportingDocs}
                  onToggleDoc={handleToggleDoc}
                />
              </div>
            )}

            {activeTab === 'editor' && application && guideline && (
              <div className="animate-fade-in">
                <DocumentEditor
                  application={application}
                  guideline={guideline}
                  onSaveApplication={handleSaveApplication}
                  onSaveGuideline={handleSaveGuideline}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals and Drawers */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        provider={provider}
        onSave={(newKey, newProvider) => {
          setApiKey(newKey);
          setProvider(newProvider);
          localStorage.setItem('llm_api_key', newKey);
          localStorage.setItem('llm_provider', newProvider);
        }}
      />

      <AuditLogsDrawer
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
      />

      {assessment && application && guideline && (
        <ExportSummaryModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          assessment={assessment}
          application={application}
          guideline={guideline}
        />
      )}
    </div>
  );
}

export default App;

