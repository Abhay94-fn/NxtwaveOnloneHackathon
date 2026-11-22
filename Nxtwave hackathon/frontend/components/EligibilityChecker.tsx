'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Scheme } from './SchemeExplorer';
import { CheckCircle2, AlertCircle, Sparkles, RefreshCw, Sliders, ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RuleEvaluation {
  rule_id: string;
  rule_title: string;
  passed: boolean;
  diagnostic: string;
  requirement: string;
}

interface EligibilityResult {
  eligible: boolean;
  score: number;
  scheme_id: string;
  scheme_name: string;
  evaluations: RuleEvaluation[];
  timestamp: string;
  disclaimer?: string;
}

interface EligibilityCheckerProps {
  schemes: Scheme[];
  selectedSchemeId: string;
  onSelectSchemeId: (id: string) => void;
  onApplicationPrepared: (application: any) => void;
  token?: string;
}

export default function EligibilityChecker({
  schemes,
  selectedSchemeId,
  onSelectSchemeId,
  onApplicationPrepared,
  token,
}: EligibilityCheckerProps) {
  const [formData, setFormData] = useState({
    name: 'Abhay Dwivedi',
    email: 'abhay@example.com',
    phone: '+91 98765 43210',
    course: 'B.Tech Computer Science & Engineering',
    year: 3,
    institution: 'National Institute of Technology',
    family_income: 350000,
    category: 'General',
    gender: 'Male',
    percentage_score: 84.5,
  });

  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EligibilityResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showParameters, setShowParameters] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(!token);

  const bulletsRef = useRef<HTMLDivElement>(null);
  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId) || schemes[0];

  useEffect(() => {
    if (!token) {
      setProfileLoaded(true);
      return;
    }
    fetch(`${API_URL}/api/profile`, {
      headers: token ? { Authorization: "Bearer " + token } : {},
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((profile) => {
        setFormData((current) => ({
          ...current,
          name: profile.name || current.name,
          email: profile.email || current.email,
          phone: profile.phone || current.phone,
          course: profile.course || current.course,
          year: Number(profile.year || current.year),
          institution: profile.institution || current.institution,
          family_income: Number(profile.family_income ?? current.family_income),
          category: profile.category || current.category,
          gender: profile.gender || current.gender,
          percentage_score: Number(profile.percentage_score ?? current.percentage_score),
        }));
      })
      .catch(() => undefined)
      .finally(() => setProfileLoaded(true));
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'year' || name === 'family_income' || name === 'percentage_score'
          ? Number(value)
          : value,
    }));
  };

  const handleRunEvaluation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...formData,
        scheme_id: selectedSchemeId,
      };

      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Could not evaluate application parameters.');
      }

      const application = await res.json();
      setEvalResult(application.eligibility);
      onApplicationPrepared(application);

      // Animate bullets with GSAP stagger
      if (bulletsRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(
          bulletsRef.current.querySelectorAll('.bullet-item'),
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error connecting to backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Run on first load or when scheme changes
  useEffect(() => {
    if (profileLoaded) handleRunEvaluation();
  }, [selectedSchemeId, profileLoaded]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 paper-sheet space-y-8">
      {/* Document Header */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-subtle text-ink-muted border border-border">
              Dossier Brief
            </span>
            <span className="font-mono text-[10px] text-ink-subtle">
              Ref: {selectedScheme?.code || 'GOV-ENTITLEMENT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-ink-subtle">Framework:</span>
            <select
              value={selectedSchemeId}
              onChange={(e) => onSelectSchemeId(e.target.value)}
              className="text-xs font-serif font-medium border border-border rounded-md px-2.5 py-1 bg-surface-subtle text-ink outline-none focus:border-ink cursor-pointer"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.amount})
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-ink leading-tight">
          {selectedScheme?.name}
        </h2>
        <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
          {selectedScheme?.description}
        </p>
      </div>

      {/* AI Synthesis Section - Lined / Bullet Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-subtle block">
            Synthesized Directives & Citizen Match
          </span>
          <button
            type="button"
            onClick={() => setShowParameters(!showParameters)}
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showParameters ? 'Hide Attributes' : 'Edit Parameters'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showParameters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Collapsible Parameter Editor */}
        {showParameters && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunEvaluation(e);
            }}
            className="p-5 rounded-lg border border-border bg-surface-subtle/50 space-y-4 animate-in fade-in duration-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-[10px] text-ink-subtle block mb-1">Citizen Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-xs text-ink focus:border-ink outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-ink-subtle block mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-xs text-ink focus:border-ink outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-ink-subtle block mb-1">Enrolled Course</label>
                <input
                  name="course"
                  type="text"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-xs text-ink focus:border-ink outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-ink-subtle block mb-1">Academic Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-xs text-ink focus:border-ink outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] text-ink-subtle block mb-1">Annual Income (INR)</label>
                <input
                  name="family_income"
                  type="number"
                  step={10000}
                  value={formData.family_income}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-xs text-ink focus:border-ink outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-ink-subtle block mb-1">Reservation Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-xs text-ink focus:border-ink outline-none"
                >
                  {['General', 'OBC', 'SC', 'ST', 'EWS'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-3.5 py-1.5 rounded bg-ink text-white font-medium text-xs hover:bg-neutral-800 disabled:opacity-50 interactive-hover flex items-center gap-1.5"
              >
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Update Synthesis</span>
              </button>
            </div>
          </form>
        )}

        {/* Lined synthesis output */}
        <div ref={bulletsRef} className="space-y-3 pt-2">
          {evalResult ? (
            <>
            {evalResult.evaluations.map((item) => (
              <div
                key={item.rule_id}
                className="bullet-item flex items-start gap-3 py-2 border-b border-border/60 last:border-0"
              >
                <div className="mt-0.5">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-ink">{item.rule_title}</span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        item.passed ? 'text-emerald-700 font-semibold' : 'text-amber-800 font-semibold'
                      }`}
                    >
                      {item.passed ? 'Verified' : 'Check Required'}
                    </span>
                  </div>
                  <p className="text-ink-muted leading-relaxed">{item.diagnostic}</p>
                  <p className="text-[11px] text-ink-subtle font-mono">Directive: {item.requirement}</p>
                </div>
              </div>
            ))}
            {evalResult.disclaimer && (
              <p className="text-[10px] leading-relaxed text-ink-subtle border-t border-border pt-3">
                {evalResult.disclaimer}
              </p>
            )}
            </>
          ) : (
            <div className="text-xs text-ink-subtle py-4">Evaluating official criteria...</div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
