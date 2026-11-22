'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowRight,
  FileText,
  Check,
  X,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApprovalModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (updatedApp: any) => void;
  token?: string;
}

export default function ApprovalModal({
  application,
  isOpen,
  onClose,
  onSubmitted,
  token,
}: ApprovalModalProps) {
  const [confirmedConsent, setConfirmedConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const isEligible = application.status === 'ready_for_review' || application.status === 'acknowledged';
  const isAcknowledged = application.status === 'acknowledged';

  const handleDecision = async (approved: boolean) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/applications/${application.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({
          approved,
          consent_statement: 'Explicit citizen consent verified and digitally signed.',
        }),
      });

      if (!res.ok) {
        throw new Error('Could not process decision. Please try again.');
      }

      const updated = await res.json();
      onSubmitted(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-subtle/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-white">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink font-normal">
                {isAcknowledged ? 'Official Entitlement Receipt' : 'Executive Consent Gate'}
              </h3>
              <p className="font-mono text-[10px] text-ink-subtle">
                Dossier Identifier: {application.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded border border-border hover:bg-surface text-ink-subtle hover:text-ink interactive-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
          {isAcknowledged && application.acknowledgement ? (
            <div className="p-5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Simulated Portal Handshake Complete</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface rounded border border-border">
                  <span className="font-mono text-[10px] text-ink-subtle block">
                    Acknowledgement Reference
                  </span>
                  <span className="font-mono font-bold text-ink text-xs">
                    {application.acknowledgement.acknowledgement_number}
                  </span>
                </div>
                <div className="p-3 bg-surface rounded border border-border">
                  <span className="font-mono text-[10px] text-ink-subtle block">Dispatch Gateway</span>
                  <span className="font-medium text-ink">
                    {application.acknowledgement.portal_adapter}
                  </span>
                </div>
              </div>

              {application.digital_signature && (
                <div className="p-3 bg-surface rounded border border-border space-y-1">
                  <span className="font-mono text-[10px] text-ink-subtle block">
                    Cryptographic Digital Signature (SHA-256):
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted break-all">
                    {application.digital_signature.hash}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg border border-border bg-surface-subtle/30 space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] text-ink-subtle border-b border-border pb-2">
                  <span>Welfare Directive</span>
                  <span className="text-ink font-semibold">{application.scheme.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-ink-subtle block">Citizen Legal Name</span>
                    <span className="font-medium text-ink">{application.profile.name}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-ink-subtle block">Enrolled Program</span>
                    <span className="font-medium text-ink">{application.profile.course}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-ink-subtle block">Annual Income</span>
                    <span className="font-medium text-ink">
                      â‚¹{application.profile.family_income.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-ink-subtle block">Statutory Benefit</span>
                    <span className="font-serif text-sm text-ink">{application.scheme.amount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle block">
                  Attached Credential Packet ({application.documents?.length || 0} files):
                </span>
                <div className="space-y-1.5">
                  {application.documents?.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded border border-border bg-surface flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                        <span className="truncate text-ink font-medium">{doc.name}</span>
                      </div>
                      <span className="font-mono text-[9px] text-emerald-800 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-surface text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={confirmedConsent}
                    onChange={(e) => setConfirmedConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-border text-ink focus:ring-ink"
                  />
                  <label htmlFor="consent-check" className="text-ink leading-relaxed">
                    I verify the submitted educational and income records are authentic. I authorize SevaSetu to generate a cryptographic dispatch token and simulate portal submission.
                  </label>
                </div>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="p-3 rounded border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-surface-subtle/30 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-border text-xs text-ink hover:bg-surface interactive-hover"
          >
            Dismiss
          </button>

          {!isAcknowledged && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecision(false)}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded border border-red-200 bg-red-50 text-red-800 text-xs font-medium hover:bg-red-100 interactive-hover"
              >
                Decline
              </button>

              <button
                onClick={() => handleDecision(true)}
                disabled={!confirmedConsent || submitting}
                className="px-4 py-1.5 rounded bg-ink text-white text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-800 disabled:opacity-40 interactive-hover shadow-xs"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>{submitting ? 'Signing...' : 'Authorize & Dispatch'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
