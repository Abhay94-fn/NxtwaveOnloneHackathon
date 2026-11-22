'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShieldCheck, ArrowRight, UserCheck, Sparkles, SlidersHorizontal } from 'lucide-react';

interface HeroProps {
  onStartCheck: () => void;
  onExploreSchemes: () => void;
  readinessScore: number;
  activeSchemeName: string;
}

export default function Hero({
  onStartCheck,
  onExploreSchemes,
  readinessScore,
  activeSchemeName,
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        metaRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.5'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pt-8 pb-6 border-b border-border bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div ref={metaRef} className="flex items-center gap-2 text-[11px] font-mono text-ink-subtle">
              <span className="px-2 py-0.5 rounded bg-surface border border-border text-ink">
                Session: Citizen-042
              </span>
              <span>/</span>
              <span>18 Nov 2026</span>
              <span>/</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Human-Governed
              </span>
            </div>

            <h1
              ref={headlineRef}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink leading-[1.15] tracking-tight"
            >
              Intelligent entitlement synthesis and verified portal dispatch.
            </h1>

            <p ref={subtitleRef} className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Evaluating official eligibility directives for{' '}
              <span className="text-ink font-medium underline underline-offset-4 decoration-border-strong">
                {activeSchemeName}
              </span>
              . Every document, criteria evaluation, and submission packet remains strictly under your direct review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onStartCheck}
              className="px-4 py-2 rounded-lg bg-ink text-white font-medium text-xs flex items-center gap-2 hover:bg-neutral-800 interactive-hover shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize Dossier</span>
            </button>

            <button
              onClick={onExploreSchemes}
              className="px-4 py-2 rounded-lg border border-border bg-surface text-ink font-medium text-xs hover:bg-surface-subtle interactive-hover"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 inline" />
              <span>Change Scheme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
