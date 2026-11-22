'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { Award, Landmark, FileCheck2, ShieldAlert } from 'lucide-react';

interface MetricsProps {
  schemesCount: number;
  applicationsCount: number;
  readinessScore: number;
}

export default function Metrics({
  schemesCount,
  applicationsCount,
  readinessScore,
}: MetricsProps) {
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);
  const stat3Ref = useRef<HTMLSpanElement>(null);
  const stat4Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (stat1Ref.current) stat1Ref.current.innerText = '₹50,000';
      if (stat2Ref.current) stat2Ref.current.innerText = '03';
      if (stat3Ref.current) stat3Ref.current.innerText = `${readinessScore || 85}%`;
      if (stat4Ref.current) stat4Ref.current.innerText = '100%';
      return;
    }

    // Anime.js count-up
    const obj1 = { val: 0 };
    anime({
      targets: obj1,
      val: 50000,
      round: 1,
      easing: 'easeOutExpo',
      duration: 1600,
      update: () => {
        if (stat1Ref.current) {
          stat1Ref.current.innerText = `₹${obj1.val.toLocaleString('en-IN')}`;
        }
      },
    });

    const obj2 = { val: 0 };
    anime({
      targets: obj2,
      val: schemesCount || 3,
      round: 1,
      easing: 'easeOutQuad',
      duration: 1200,
      update: () => {
        if (stat2Ref.current) {
          stat2Ref.current.innerText = obj2.val < 10 ? `0${obj2.val}` : `${obj2.val}`;
        }
      },
    });

    const obj3 = { val: 0 };
    anime({
      targets: obj3,
      val: readinessScore || 85,
      round: 1,
      easing: 'easeOutCubic',
      duration: 1400,
      update: () => {
        if (stat3Ref.current) {
          stat3Ref.current.innerText = `${obj3.val}%`;
        }
      },
    });

    const obj4 = { val: 0 };
    anime({
      targets: obj4,
      val: 100,
      round: 1,
      easing: 'easeOutCubic',
      duration: 1400,
      update: () => {
        if (stat4Ref.current) {
          stat4Ref.current.innerText = `${obj4.val}%`;
        }
      },
    });

    // Pulse animation
    anime({
      targets: '.live-pulse',
      opacity: [0.4, 1, 0.4],
      easing: 'easeInOutQuad',
      duration: 1800,
      loop: true,
    });
  }, [schemesCount, applicationsCount, readinessScore]);

  return (
    <section className="border-b border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="py-2 sm:py-0 px-3 first:pl-0">
            <span className="font-mono text-[10px] text-ink-subtle uppercase tracking-wider block">
              Direct Benefit Support
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span ref={stat1Ref} className="font-serif text-2xl text-ink">
                ₹50,000
              </span>
              <span className="text-[11px] text-ink-subtle">/ year</span>
            </div>
          </div>

          <div className="py-2 sm:py-0 px-3">
            <span className="font-mono text-[10px] text-ink-subtle uppercase tracking-wider block">
              Verified Frameworks
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span ref={stat2Ref} className="font-serif text-2xl text-ink">
                03
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">gazette verified</span>
            </div>
          </div>

          <div className="py-2 sm:py-0 px-3">
            <span className="font-mono text-[10px] text-ink-subtle uppercase tracking-wider block">
              Dossier Readiness
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span ref={stat3Ref} className="font-serif text-2xl text-ink">
                85%
              </span>
              <span className="text-[11px] text-ink-subtle">audit ready</span>
            </div>
          </div>

          <div className="py-2 sm:py-0 px-3">
            <span className="font-mono text-[10px] text-ink-subtle uppercase tracking-wider block">
              Consent Gate
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span ref={stat4Ref} className="font-serif text-2xl text-emerald-800">
                100%
              </span>
              <span className="text-[11px] text-ink-subtle">no dark dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
