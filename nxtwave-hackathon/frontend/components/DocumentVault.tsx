'use client';

import React from 'react';
import { Shield, FileText, CheckCircle2, Lock } from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  type: string;
  status: string;
  size: string;
  sha256: string;
  verified_at: string;
}

interface DocumentVaultProps {
  documents: DocumentItem[];
}

export default function DocumentVault({ documents }: DocumentVaultProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 paper-sheet space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-800" />
          <h3 className="font-serif text-lg text-ink font-normal">Credential Vault</h3>
        </div>
        <span className="font-mono text-[10px] text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
          SHA-256 Verified
        </span>
      </div>

      <div className="space-y-2.5">
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-lg border border-border bg-canvas hover:border-border-strong interactive-hover flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-neutral-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-ink block truncate">{doc.name}</span>
                  <span className="font-mono text-[10px] text-ink-subtle">{doc.filename} · {doc.size}</span>
                </div>
              </div>

              <span className="font-mono text-[10px] text-ink-subtle px-2 py-0.5 rounded bg-surface border border-border shrink-0">
                {doc.sha256}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-ink-subtle border border-dashed border-border rounded-lg">
            No credential packet generated.
          </div>
        )}
      </div>

      <div className="pt-2 text-[11px] text-ink-subtle font-mono flex items-center gap-1.5 border-t border-border">
        <Lock className="w-3 h-3 text-emerald-700" />
        <span>Stored strictly in local boundary</span>
      </div>
    </div>
  );
}
