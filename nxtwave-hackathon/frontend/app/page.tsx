'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Metrics from '../components/Metrics';
import SchemeExplorer, { Scheme } from '../components/SchemeExplorer';
import EligibilityChecker from '../components/EligibilityChecker';
import ApprovalModal from '../components/ApprovalModal';
import DocumentVault from '../components/DocumentVault';
import AuditTrail from '../components/AuditTrail';
import FloatingDock from '../components/FloatingDock';
import AuthPanel from '../components/AuthPanel';
import AdminPanel from '../components/AdminPanel';
import HelpChatbot from '../components/HelpChatbot';
import LiveSourcePanel from '../components/LiveSourcePanel';
import { Shield, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const FALLBACK_SCHEMES: Scheme[] = [
  {
    id: 'national-merit',
    name: 'National Merit Scholarship Scheme',
    code: 'NSP-NMS-2026',
    provider: 'Ministry of Education (Higher Education)',
    department: 'Department of Higher Education, Govt. of India',
    amount: 'â‚¹50,000 / year',
    deadline: '2027-03-31',
    category: 'Higher Education & Tech',
    level: 'Undergraduate / Postgraduate',
    description: 'Financial assistance to meritorious students from economically weaker sections to prevent dropout and enable technical higher education.',
    eligibility_summary: 'B.Tech/Engg students, Family Income < â‚¹8,00,000, Min 60% in prior qualification',
    eligibility_rules: [
      { id: 'course_type', label: 'Course Requirement', criteria: 'Enrolled in B.Tech, B.E., or equivalent recognized technical degree' },
      { id: 'income_limit', label: 'Family Income Ceiling', criteria: 'Gross annual household income strictly below â‚¹8,00,000' },
      { id: 'academic_standing', label: 'Academic Status', criteria: 'Current academic year between Year 1 and Year 6' },
      { id: 'min_percentage', label: 'Prior Academic Performance', criteria: 'Minimum 60% aggregate or 6.5 CGPA in secondary/previous semesters' }
    ],
    required_documents: [
      { id: 'doc_identity', title: 'Government Identity Proof (Aadhaar / Voter ID)', required: true, type: 'identity' },
      { id: 'doc_income', title: 'Authorized Tehsildar Income Certificate', required: true, type: 'income' },
      { id: 'doc_enrollment', title: 'College Bonafide / Enrollment Verification', required: true, type: 'bonafide' },
      { id: 'doc_marksheet', title: 'Latest Semester Marksheet / Grade Transcript', required: true, type: 'academic' }
    ],
    source: 'Ministry of Education Gazette Notification Â· Academic Year 2026-27',
    portal_adapter: 'NSP-Portal-Simulated-v3'
  },
  {
    id: 'aicte-pragati',
    name: 'AICTE Pragati Scholarship for Girl Students',
    code: 'AICTE-PRAG-2026',
    provider: 'All India Council for Technical Education',
    department: 'Ministry of Education, Govt. of India',
    amount: 'â‚¹50,000 / year',
    deadline: '2027-04-15',
    category: 'Women in STEM & Engineering',
    level: 'Degree / Diploma',
    description: 'Scheme aimed at providing assistance for advancement of girls pursuing technical education with maximum 2 girls per family.',
    eligibility_summary: 'Female students admitted to AICTE approved technical institution, Family Income < â‚¹8,00,000',
    eligibility_rules: [
      { id: 'gender_req', label: 'Gender Criterion', criteria: 'Exclusively for female students' },
      { id: 'course_type', label: 'Course Requirement', criteria: 'Admitted to 1st/2nd year degree level technical course in AICTE approved college' },
      { id: 'income_limit', label: 'Family Income Ceiling', criteria: 'Total family annual income not exceeding â‚¹8,00,000' }
    ],
    required_documents: [
      { id: 'doc_identity', title: 'Aadhaar Card', required: true, type: 'identity' },
      { id: 'doc_income', title: 'Annual Income Certificate', required: true, type: 'income' },
      { id: 'doc_aicte', title: 'AICTE Approved Institute Fee Receipt', required: true, type: 'fee_receipt' }
    ],
    source: 'AICTE Guidelines for Pragati Scholarship Scheme 2026-27',
    portal_adapter: 'AICTE-Portal-Simulated-v2'
  },
  {
    id: 'post-matric-merit',
    name: 'Central Sector Post-Matric Excellence Grant',
    code: 'MoSJE-PM-2026',
    provider: 'Ministry of Social Justice and Empowerment',
    department: 'Department of Social Justice, Govt. of India',
    amount: 'â‚¹36,000 / year + Tuition Waiver',
    deadline: '2027-05-30',
    category: 'Social Inclusion & Welfare',
    level: 'Post-Matric / Graduate',
    description: 'Targeted support for deserving students from SC/ST/OBC/EWS categories pursuing post-secondary degrees in accredited colleges.',
    eligibility_summary: 'Category SC/ST/OBC/EWS, Family Income < â‚¹6,00,000, Post-matric degree enrolled',
    eligibility_rules: [
      { id: 'category_req', label: 'Social Category', criteria: 'Belongs to SC, ST, OBC, or EWS category' },
      { id: 'income_limit', label: 'Family Income Ceiling', criteria: 'Total annual parental income not exceeding â‚¹6,00,000' },
      { id: 'course_level', label: 'Educational Level', criteria: 'Valid enrollment in regular full-time undergraduate or diploma program' }
    ],
    required_documents: [
      { id: 'doc_caste', title: 'Competent Authority Caste / Community Certificate', required: true, type: 'category' },
      { id: 'doc_income', title: 'Income Certificate issued by Revenue Authority', required: true, type: 'income' },
      { id: 'doc_identity', title: 'Identity & Address Verification', required: true, type: 'identity' }
    ],
    source: 'Department of Social Justice & Empowerment Official Framework',
    portal_adapter: 'MoSJE-PostMatric-Simulated-v1'
  }
];

export default function HomePage() {
  const [schemes, setSchemes] = useState<Scheme[]>(FALLBACK_SCHEMES);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('national-merit');
  const [activeTab, setActiveTab] = useState<'dossier' | 'registry' | 'audit'>('dossier');
  const [application, setApplication] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [session, setSession] = useState<{ token: string; refresh_token?: string; user: { email: string; name: string; role: string } } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('sevasetu-session');
      if (stored) setSession(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem('sevasetu-session');
    }
  }, []);

  useEffect(() => {
    if (!session?.refresh_token) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
        if (!response.ok) throw new Error('Session expired');
        const data = await response.json();
        const refreshed = { token: data.token, refresh_token: data.refresh_token, user: data.user };
        setSession(refreshed);
        window.localStorage.setItem('sevasetu-session', JSON.stringify(refreshed));
      } catch {
        setSession(null);
        window.localStorage.removeItem('sevasetu-session');
      }
    }, 10 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [session?.refresh_token]);

  const handleAuthenticated = (token: string, user: { email: string; name: string; role: string }, refreshToken?: string) => {
    const nextSession = { token, refresh_token: refreshToken, user };
    setSession(nextSession);
    window.localStorage.setItem('sevasetu-session', JSON.stringify(nextSession));
  };

  const handleLogout = async () => {
    if (session?.token && session.refresh_token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.token },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
      } catch {}
    }
    setSession(null);
    window.localStorage.removeItem('sevasetu-session');
    setApplication(null);
    setAccountOpen(false);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/schemes`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item: any) => ({
            ...item,
            category: item.category || 'Higher Education & Tech',
            amount: item.amount || 'â‚¹50,000 / year',
            description: item.description || 'Verified government welfare scheme.',
            deadline: item.deadline || '2027-03-31',
            eligibility_rules:
              item.eligibility_rules && Array.isArray(item.eligibility_rules)
                ? item.eligibility_rules
                : Array.isArray(item.eligibility)
                ? item.eligibility.map((c: string, idx: number) => ({
                    id: `rule-${idx}`,
                    criteria: c,
                  }))
                : [],
          }));
          setSchemes(normalized);
        }
      })
      .catch(() => {
        // Fallback initialized
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleApplicationPrepared = (app: any) => {
    setApplication(app);
  };

  const handleSubmitted = (updatedApp: any) => {
    setApplication(updatedApp);
    if (updatedApp.status === 'acknowledged') {
      showToast('Simulated submission acknowledged with digital token.');
    } else {
      showToast('Submission declined. Zero data transmitted.');
      setIsModalOpen(false);
    }
  };

  const activeScheme = schemes.find((s) => s.id === selectedSchemeId) || schemes[0];
  const readinessScore = application ? application.readiness_score || 85 : 85;
  const isAcknowledged = application?.status === 'acknowledged';

  return (
    <div className="min-h-screen flex flex-col bg-canvas pb-24">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationCount={application ? 1 : 0}
        schemeTitle={activeScheme?.name}
        onAccount={() => setAccountOpen(true)}
        onAdmin={() => setAdminOpen(true)}
        isAdmin={session?.user.role === 'admin'}
        userName={session?.user.name}
      />

      <Hero
        onStartCheck={() => setActiveTab('dossier')}
        onExploreSchemes={() => setActiveTab('registry')}
        readinessScore={readinessScore}
        activeSchemeName={activeScheme?.name}
      />

      <Metrics
        schemesCount={schemes.length}
        applicationsCount={application ? 1 : 0}
        readinessScore={readinessScore}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab 1: Active Dossier Sheet View */}
        {activeTab === 'dossier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            <div className="lg:col-span-8 space-y-6">
              <EligibilityChecker
                schemes={schemes}
                selectedSchemeId={selectedSchemeId}
                onSelectSchemeId={setSelectedSchemeId}
                onApplicationPrepared={handleApplicationPrepared}
                token={session?.token}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <DocumentVault documents={application?.documents || []} />
              <AuditTrail timeline={application?.timeline || []} />
            </div>
          </div>
        )}

        {/* Tab 2: Scheme Registry */}
        {activeTab === 'registry' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <LiveSourcePanel />
            <SchemeExplorer
              schemes={schemes}
              selectedSchemeId={selectedSchemeId}
              onSelectScheme={(id) => {
                setSelectedSchemeId(id);
                setActiveTab('dossier');
                showToast(`Loaded dossier for ${schemes.find((s) => s.id === id)?.name || id}`);
              }}
            />
          </div>
        )}

        {/* Tab 3: Immutable Audit Ledger */}
        {activeTab === 'audit' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            <AuditTrail
              timeline={
                application?.timeline && application.timeline.length > 0
                  ? application.timeline
                  : [
                      {
                        id: 'EVT-INIT',
                        at: new Date().toISOString(),
                        title: 'Workspace Initialized',
                        description: 'Loaded 3 statutory welfare schemas under strict citizen consent boundary.',
                        status: 'healthy',
                        actor: 'Core Engine',
                      },
                    ]
              }
            />
          </div>
        )}
      </main>

      {/* Floating Action Dock */}
      <FloatingDock
        onOpenModal={() => setIsModalOpen(true)}
        status={application?.status || 'draft'}
        readinessScore={readinessScore}
        isAcknowledged={isAcknowledged}
      />

      {/* Signing & Approval Modal */}
      <ApprovalModal
        application={application}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={handleSubmitted}
        token={session?.token}
      />

      {accountOpen && (
        <AuthPanel
          token={session?.token || null}
          user={session?.user || null}
        onAuthenticated={handleAuthenticated}
        onLogout={handleLogout}
        onClose={() => setAccountOpen(false)}
        />
      )}
      {adminOpen && session?.token && <AdminPanel token={session.token} onClose={() => setAdminOpen(false)} />}
      <HelpChatbot schemeId={selectedSchemeId} token={session?.token} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 px-3.5 py-2.5 rounded-lg bg-ink text-white font-mono text-xs shadow-lg flex items-center gap-2 border border-neutral-700 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-border bg-canvas py-6 text-xs text-ink-subtle mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-800" />
            <span className="font-serif text-sm text-ink font-normal">SevaSetu Workspace</span>
            <span>Â·</span>
            <span>Human-Governed Entitlement Synthesis</span>
          </div>

          <div className="flex items-center gap-3 text-ink-subtle">
            <span>FastAPI 1.0</span>
            <span>Â·</span>
            <span>Next.js App Router</span>
            <span>Â·</span>
            <span>Zero Unaudited Submissions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
