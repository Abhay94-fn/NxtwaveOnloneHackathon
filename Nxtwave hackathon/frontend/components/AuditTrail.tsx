'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Activity, Clock, ShieldCheck, CheckCircle2, User, Cpu } from 'lucide-react';

interface AuditEvent {
  id: string;
  at: string;
  title: string;
  description: string;
  status: string;
  actor: string;
}

interface AuditTrailProps {
  timeline: AuditEvent[];
}

export default function AuditTrail({ timeline }: AuditTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.ledger-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
        );
      }
    }
  }, [timeline]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 paper-sheet space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-800" />
          <h3 className="font-serif text-lg text-ink font-normal">Audit Ledger</h3>
        </div>
        <span className="font-mono text-[10px] text-ink-subtle">
          Append-only
        </span>
      </div>

      <div ref={containerRef} className="space-y-3">
        {timeline && timeline.length > 0 ? (
          timeline.map((evt) => {
            const isCitizen = evt.actor.toLowerCase().includes('citizen');
            return (
              <div key={evt.id} className="ledger-item p-3 rounded-lg border border-border/80 bg-surface-subtle/30 space-y-1 text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-ink">{evt.title}</span>
                  <span className="font-mono text-[10px] text-ink-subtle shrink-0">
                    {new Date(evt.at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-ink-muted text-[11px] leading-relaxed">{evt.description}</p>

                <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-ink-subtle">
                  <span className="flex items-center gap-1">
                    {isCitizen ? <User className="w-2.5 h-2.5" /> : <Cpu className="w-2.5 h-2.5" />}
                    <span>{evt.actor}</span>
                  </span>
                  <span>·</span>
                  <span className="uppercase text-neutral-500">{evt.status}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-ink-subtle py-2">No ledger events recorded.</div>
        )}
      </div>
    </div>
  );
}
