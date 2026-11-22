'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Radio } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SourceStatus {
  status: string;
  records: number;
  checked_at: string;
  error?: string;
}

interface SourceUpdate {
  id: string;
  source: string;
  title: string;
  summary: string;
  official_url: string;
  checked_at: string;
}

interface WebhookDelivery {
  id: string;
  status: string;
  http_status?: number;
  sent_at: string;
  target_url?: string;
}

export default function LiveSourcePanel() {
  const [sources, setSources] = useState<Record<string, SourceStatus>>({});
  const [updates, setUpdates] = useState<SourceUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [webhookConfigured, setWebhookConfigured] = useState(false);

  const load = async (sync = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/sources/${sync ? 'sync' : 'status'}`, {
        method: sync ? 'POST' : 'GET',
      });
      const data = await response.json();
      setSources(data.sources || {});
      setUpdates(data.updates || []);
      setDeliveries(data.webhook_deliveries || []);
      setWebhookConfigured(Boolean(data.webhook_target_configured));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-accent" />
          <div>
            <h3 className="font-serif text-lg">Official source updates</h3>
            <p className="font-mono text-[9px] text-ink-subtle">Public official sources only</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="rounded border border-border px-2.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync now
        </button>
      </div>

      {Object.keys(sources).length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Object.entries(sources).map(([name, status]) => (
            <div key={name} className="rounded border border-border bg-surface-subtle p-2.5">
              <span className="block text-[10px] text-ink-muted truncate">{name}</span>
              <span className={`font-mono text-[9px] ${status.status === 'live' ? 'text-success' : 'text-warning'}`}>
                {status.status.replaceAll('_', ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface-subtle/40 p-3 flex items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[9px] text-ink-subtle block">OUTBOUND WEBHOOK</span>
          <span className={`text-xs ${webhookConfigured ? 'text-success' : 'text-warning'}`}>
            {webhookConfigured ? 'Configured' : 'Not configured'}
          </span>
        </div>
        {deliveries.length > 0 && (
          <span className="font-mono text-[9px] text-ink-muted">
            {deliveries[0].status} · {deliveries[0].http_status || 'no response'}
          </span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {updates.map((update) => (
          <article key={update.id} className="rounded border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[9px] text-ink-subtle">{update.source}</span>
                <p className="text-xs text-ink leading-relaxed mt-1">{update.title}</p>
              </div>
              <a href={update.official_url} target="_blank" rel="noreferrer" aria-label="Open official source" className="text-ink-subtle hover:text-ink">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        ))}
        {!loading && updates.length === 0 && (
          <p className="text-xs text-ink-muted">No source updates loaded. Use Sync now to check official pages.</p>
        )}
      </div>
    </section>
  );
}
