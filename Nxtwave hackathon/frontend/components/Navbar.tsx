'use client';

import React from 'react';
import { Shield, Sparkles, FolderArchive, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dossier' | 'registry' | 'audit';
  setActiveTab: (tab: 'dossier' | 'registry' | 'audit') => void;
  applicationCount: number;
  schemeTitle?: string;
  onAccount: () => void;
  onAdmin: () => void;
  isAdmin: boolean;
  userName?: string;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  applicationCount,
  schemeTitle,
  onAccount,
  onAdmin,
  isAdmin,
  userName,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-canvas/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-brand flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-normal text-ink tracking-tight">SevaSetu</span>
            <span className="font-mono text-[10px] text-ink-subtle uppercase tracking-widest hidden sm:inline">
              Workspace
            </span>
          </div>
          {schemeTitle && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border text-xs text-ink-muted">
              <span className="font-mono text-[11px] text-ink-subtle">Active Document:</span>
              <span className="font-medium text-ink truncate max-w-[240px]">{schemeTitle}</span>
            </div>
          )}
        </div>

        <nav className="flex items-center gap-1 bg-surface-subtle/80 p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === 'dossier'
                ? 'bg-surface text-ink shadow-xs border border-border/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === 'registry'
                ? 'bg-surface text-ink shadow-xs border border-border/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Schemes</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-surface text-ink shadow-xs border border-border/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ledger</span>
              {applicationCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              )}
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-2 text-xs">
          {isAdmin && <button onClick={onAdmin} className="hidden sm:inline text-ink-muted hover:text-ink">Admin</button>}
          <button onClick={onAccount} className="rounded border border-border px-2 py-1 text-ink-muted hover:text-ink hover:bg-surface">
            {userName || 'Account'}
          </button>
          <span className="live-pulse inline-block w-2 h-2 rounded-full bg-emerald-600" />
          <span className="font-mono text-[11px] text-ink-subtle hidden sm:inline">Engine Active</span>
        </div>
      </div>
    </header>
  );
}
