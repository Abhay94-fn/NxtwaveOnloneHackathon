'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShieldCheck, FileCheck, ArrowRight, Lock, Check } from 'lucide-react';

interface FloatingDockProps {
  onOpenModal: () => void;
  status: string;
  readinessScore: number;
  isAcknowledged: boolean;
}

export default function FloatingDock({
  onOpenModal,
  status,
  readinessScore,
  isAcknowledged,
}: FloatingDockProps) {
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (dockRef.current) {
      gsap.fromTo(
        dockRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)', delay: 0.3 }
      );
    }
  }, []);

  return (
    <div
      ref={dockRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-ink/95 text-white backdrop-blur-md border border-neutral-700/60 floating-dock">
        <div className="flex items-center gap-2.5 pl-1 pr-3 border-r border-white/15">
          <div className="w-2 h-2 rounded-full bg-emerald-400 live-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
              Readiness
            </span>
            <span className="font-serif text-sm leading-none font-normal text-white">
              {readinessScore}% Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="px-4 py-1.5 rounded-full bg-surface text-ink text-xs font-medium hover:bg-neutral-100 interactive-hover flex items-center gap-1.5 shadow-xs"
          >
            {isAcknowledged ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>View Receipt</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-800" />
                <span>Review & Sign</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-neutral-500" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
