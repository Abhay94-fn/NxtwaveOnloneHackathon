'use client';

import React, { useState } from 'react';
import { Search, Calendar, FileText, ArrowRight, Check, Building, Tag, SlidersHorizontal } from 'lucide-react';

export interface Scheme {
  id: string;
  name: string;
  code?: string;
  provider: string;
  department?: string;
  amount: string;
  deadline: string;
  category: string;
  level?: string;
  description: string;
  eligibility_summary?: string;
  eligibility_rules: Array<{ id: string; label?: string; criteria: string }>;
  required_documents?: Array<{ id: string; title: string; required: boolean; type: string }>;
  source?: string;
  portal_adapter?: string;
}

interface SchemeExplorerProps {
  schemes: Scheme[];
  selectedSchemeId: string;
  onSelectScheme: (schemeId: string) => void;
}

export default function SchemeExplorer({
  schemes,
  selectedSchemeId,
  onSelectScheme,
}: SchemeExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [filters, setFilters] = useState({
    income: '',
    gender: 'Any',
    category: 'Any',
    course: '',
    score: '',
  });

  const filtered = schemes.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.provider || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' ||
      (s.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    const text = `${s.name} ${s.description} ${s.eligibility_summary || ''} ${s.eligibility_rules.map((rule) => rule.criteria).join(' ')}`.toLowerCase();
    const income = Number(filters.income);
    const score = Number(filters.score);
    const matchesIncome = !filters.income || (s.id === 'post-matric-merit' ? income <= 600000 : income <= 800000);
    const matchesGender = filters.gender === 'Any' || s.id !== 'aicte-pragati' || filters.gender === 'Female';
    const matchesCategory = filters.category === 'Any' || (s.id === 'post-matric-merit' && filters.category !== 'General') || s.id !== 'post-matric-merit';
    const technicalCourse = /b\\.tech|btech|b\\.e|engineering|technology|diploma|computer/i.test(filters.course);
    const matchesCourse = !filters.course || s.id === 'post-matric-merit' || technicalCourse;
    const matchesScore = !filters.score || s.id !== 'national-merit' || score >= 60;
    return matchesSearch && matchesCat && (!showPersonalized || (matchesIncome && matchesGender && matchesCategory && matchesCourse && matchesScore));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-ink-subtle uppercase tracking-widest block">
            Entitlement Registry
          </span>
          <h2 className="font-serif text-2xl font-normal text-ink">
            Official Welfare Frameworks
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ministry or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-ink placeholder:text-ink-subtle focus:border-ink outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border text-[11px]">
            {['all', 'Tech', 'Women', 'Inclusion'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'all' ? 'all' : cat)}
                className={`px-2 py-1 rounded capitalize font-medium transition-all ${
                  (cat === 'all' && selectedCategory === 'all') ||
                  (cat !== 'all' && selectedCategory.toLowerCase() === cat.toLowerCase())
                    ? 'bg-surface text-ink shadow-xs border border-border'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPersonalized(!showPersonalized)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ${showPersonalized ? 'bg-brand text-white border-brand' : 'border-border text-ink-muted bg-surface'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Personalize
          </button>
        </div>
      </div>

      {showPersonalized && (
        <div className="rounded-lg border border-border bg-surface-subtle/50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="text-[10px] font-mono text-ink-subtle">Annual income
            <input type="number" min="0" placeholder="e.g. 350000" value={filters.income} onChange={(e) => setFilters({ ...filters, income: e.target.value })} className="mt-1 w-full rounded border border-border bg-surface px-2 py-1.5 text-xs" />
          </label>
          <label className="text-[10px] font-mono text-ink-subtle">Gender
            <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} className="mt-1 w-full rounded border border-border bg-surface px-2 py-1.5 text-xs"><option>Any</option><option>Female</option><option>Male</option><option>Other</option></select>
          </label>
          <label className="text-[10px] font-mono text-ink-subtle">Social category
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="mt-1 w-full rounded border border-border bg-surface px-2 py-1.5 text-xs"><option>Any</option><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option></select>
          </label>
          <label className="text-[10px] font-mono text-ink-subtle">Course keyword
            <input placeholder="B.Tech, diploma..." value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })} className="mt-1 w-full rounded border border-border bg-surface px-2 py-1.5 text-xs" />
          </label>
          <label className="text-[10px] font-mono text-ink-subtle">Minimum score
            <input type="number" min="0" max="100" placeholder="60" value={filters.score} onChange={(e) => setFilters({ ...filters, score: e.target.value })} className="mt-1 w-full rounded border border-border bg-surface px-2 py-1.5 text-xs" />
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="md:col-span-3 rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">No schemes match these requirements. Try increasing the income limit or clearing a filter.</p>}
        {filtered.map((scheme) => {
          const isSelected = scheme.id === selectedSchemeId;
          const rules =
            scheme.eligibility_rules && Array.isArray(scheme.eligibility_rules)
              ? scheme.eligibility_rules
              : Array.isArray((scheme as any).eligibility)
              ? (scheme as any).eligibility.map((item: string, idx: number) => ({
                  id: `rule-${idx}`,
                  criteria: item,
                }))
              : [];

          return (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme.id)}
              className={`rounded-xl border p-5 bg-surface flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'border-ink ring-1 ring-ink/20 paper-sheet'
                  : 'border-border hover:border-border-strong hover:bg-surface-subtle/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-subtle text-ink-muted border border-border">
                    {scheme.category || 'General Welfare'}
                  </span>
                  <span className="font-serif text-lg text-ink font-normal">{scheme.amount || '₹50,000 / year'}</span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-normal text-ink leading-snug">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-ink-subtle mt-0.5">{scheme.provider}</p>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                  {scheme.description || 'Verified government scholarship opportunity.'}
                </p>

                <div className="pt-2 border-t border-border space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle block">
                    Verified Directives:
                  </span>
                  <ul className="space-y-1">
                    {rules.slice(0, 3).map((rule: any, idx: number) => (
                      <li key={rule.id || `rule-${idx}`} className="text-xs text-ink flex items-start gap-1.5">
                        <span className="text-emerald-700 text-xs mt-0.5">•</span>
                        <span className="line-clamp-1 text-ink-muted">
                          {rule.criteria || (typeof rule === 'string' ? rule : '')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-ink-subtle">Until {scheme.deadline}</span>
                <span className={`text-xs font-medium flex items-center gap-1 ${isSelected ? 'text-ink font-semibold' : 'text-ink-subtle'}`}>
                  <span>{isSelected ? 'Active Dossier' : 'Load Dossier'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
