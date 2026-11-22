'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, ShieldAlert } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [overview, setOverview] = useState<Record<string, number> | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const headers = { Authorization: "Bearer " + token };
    Promise.all([
      fetch(`${API_URL}/api/admin/overview`, { headers }).then((response) => response.json()),
      fetch(`${API_URL}/api/admin/audit`, { headers }).then((response) => response.json()),
    ]).then(([stats, audit]) => {
      if (stats.detail) throw new Error(stats.detail);
      setOverview(stats);
      setEvents(Array.isArray(audit) ? audit : []);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Admin data unavailable'));
  }, [token]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
      <section className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-accent" /><h2 className="font-serif text-2xl">Operations console</h2></div>
          <button onClick={onClose} className="text-xs text-ink-muted">Close</button>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : overview && <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{Object.entries(overview).map(([key, value]) => <div key={key} className="rounded border border-border bg-surface-subtle p-3"><span className="block font-mono text-[9px] uppercase text-ink-subtle">{key.replace('_', ' ')}</span><strong className="text-xl">{value}</strong></div>)}</div>}
        <div className="space-y-2"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-subtle"><ShieldAlert className="w-3.5 h-3.5" />Immutable audit events</div>{events.map((event) => <div key={event.id} className="rounded border border-border p-3 text-xs"><div className="flex justify-between font-medium"><span>{event.action}</span><span className="font-mono text-ink-subtle">{new Date(event.created_at).toLocaleString()}</span></div><p className="text-ink-muted mt-1">{event.actor} Â· {event.resource_id || 'system'}</p></div>)}</div>
      </section>
    </div>
  );
}
