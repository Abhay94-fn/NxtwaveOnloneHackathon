'use client';

import React, { useEffect, useState } from 'react';
import { Download, LogIn, UserPlus, Upload, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface AuthPanelProps {
  token: string | null;
  user: { email: string; name: string; role: string } | null;
  onAuthenticated: (token: string, user: { email: string; name: string; role: string }, refreshToken?: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  course: '',
  year: 1,
  institution: '',
  family_income: 0,
  category: 'General',
  gender: 'Other',
  percentage_score: 0,
};

export default function AuthPanel({ token, user, onAuthenticated, onLogout, onClose }: AuthPanelProps) {
  const [registerMode, setRegisterMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [documents, setDocuments] = useState<any[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false);

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
          ...(token ? { Authorization: "Bearer " + token } : {}),
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Request failed');
    return data;
  };

  const loadDocuments = async () => {
    if (!token) return;
    try {
      const data = await request('/api/documents');
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      setDocuments([]);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    request('/api/profile')
      .then((data) => setProfile({ ...EMPTY_PROFILE, ...data, name: data.name || user.name, email: data.email || user.email }))
      .catch(() => setProfile({ ...EMPTY_PROFILE, name: user.name, email: user.email }));
    loadDocuments();
  }, [token, user]);

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      const data = await request(`/api/auth/${registerMode ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onAuthenticated(data.token, data.user, data.refresh_token);
      setMessage(registerMode ? 'Account created. Profile workspace opened.' : 'Signed in successfully.');
    } catch (error) {
      if (!registerMode && error instanceof Error && error.message.includes('MFA verification required')) {
        setMfaSetupRequired(true);
        setMessage('Enter your authenticator code to complete sign-in.');
        return;
      }
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const submitMfaLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      const data = await request('/api/auth/mfa/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password, code: mfaCode }),
      });
      onAuthenticated(data.token, data.user, data.refresh_token);
      setMfaSetupRequired(false);
      setMessage('MFA sign-in successful.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'MFA verification failed');
    }
  };

  const setupMfa = async () => {
    try {
      const data = await request('/api/auth/mfa/setup', { method: 'POST' });
      setMfaSecret(data.secret);
      setMessage('Add this secret to an authenticator app, then enter its code.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'MFA setup failed');
    }
  };

  const enableMfa = async () => {
    try {
      await request('/api/auth/mfa/enable', {
        method: 'POST',
        body: JSON.stringify({ code: mfaCode }),
      });
      setMfaSecret(null);
      setMessage('MFA enabled successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'MFA activation failed');
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage(null);
    try {
      const saved = await request('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...profile, email: profile.email || user?.email }),
      });
      setProfile((current) => ({ ...current, ...saved }));
      setMessage('Applicant profile saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!token) {
      setMessage('Sign in before uploading a document.');
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
      headers: { Authorization: "Bearer " + token },
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'Upload failed');
      setDocuments((current) => [data, ...current]);
      setMessage(`Uploaded successfully. SHA-256: ${data.sha256.slice(0, 16)}...`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (documentId: string) => {
    if (!token) return;
    const response = await fetch(`${API_URL}/api/documents/${documentId}/download`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!response.ok) {
      setMessage('Document download failed.');
      return;
    }
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = documents.find((item) => item.id === documentId)?.name || 'document';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
      <section className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-2xl">{user ? `Welcome, ${user.name}` : 'Citizen account'}</h2>
            <p className="font-mono text-[10px] text-ink-subtle">Secure profile and document workspace</p>
          </div>
          <button onClick={onClose} aria-label="Close account panel"><X className="w-4 h-4" /></button>
        </div>

        {!user ? (
          <form onSubmit={submitAuth} className="space-y-3">
            {registerMode && (
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm" />
            )}
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm" />
            <input required minLength={8} type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm" />
            <button type="submit" className="w-full rounded bg-brand text-white py-2 text-sm flex justify-center items-center gap-2"><LogIn className="w-4 h-4" />{registerMode ? 'Create account' : 'Sign in'}</button>
            <button type="button" onClick={() => setRegisterMode(!registerMode)} className="text-xs text-accent flex items-center gap-1"><UserPlus className="w-3 h-3" />{registerMode ? 'Use existing account' : 'Create a new account'}</button>
          </form>
        ) : null}
        {!user && mfaSetupRequired && (
          <form onSubmit={submitMfaLogin} className="rounded border border-border p-3 space-y-2">
            <label className="text-[10px] font-mono text-ink-subtle">Authenticator code</label>
            <input required minLength={6} maxLength={6} inputMode="numeric" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))} className="w-full border border-border rounded px-3 py-2 text-sm" />
            <button type="submit" className="w-full rounded bg-brand text-white py-2 text-sm">Verify MFA</button>
          </form>
        )}
        {user && (
          <>
            <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-[10px] font-mono text-ink-subtle sm:col-span-2">Full name
                <input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle sm:col-span-2">Email
                <input required type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Phone
                <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Institution
                <input value={profile.institution} onChange={(e) => setProfile({ ...profile, institution: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Course
                <input required value={profile.course} onChange={(e) => setProfile({ ...profile, course: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Academic year
                <select value={profile.year} onChange={(e) => setProfile({ ...profile, year: Number(e.target.value) })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm">
                  {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Annual income
                <input required type="number" min="0" value={profile.family_income} onChange={(e) => setProfile({ ...profile, family_income: Number(e.target.value) })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Academic score
                <input type="number" min="0" max="100" value={profile.percentage_score} onChange={(e) => setProfile({ ...profile, percentage_score: Number(e.target.value) })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm" />
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Social category
                <select value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm">
                  {['General', 'OBC', 'SC', 'ST', 'EWS'].map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-mono text-ink-subtle">Gender
                <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="mt-1 w-full border border-border rounded px-3 py-2 text-sm">
                  {['Female', 'Male', 'Other'].map((gender) => <option key={gender}>{gender}</option>)}
                </select>
              </label>
              <button type="submit" disabled={savingProfile} className="rounded bg-brand text-white py-2 text-sm sm:col-span-2 disabled:opacity-50">
                {savingProfile ? 'Saving...' : 'Save applicant profile'}
              </button>
            </form>
            <label className="border border-dashed border-border rounded p-4 flex items-center gap-2 text-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload verified document'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={upload} disabled={uploading} />
            </label>
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div key={document.id} className="rounded border border-border px-3 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-ink truncate">{document.name}</p>
                      <p className="font-mono text-[9px] text-ink-subtle">{document.sha256?.slice(0, 16)}...</p>
                    </div>
                    <button type="button" onClick={() => downloadDocument(document.id)} aria-label={`Download ${document.name}`} className="text-ink-muted hover:text-ink">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded border border-border p-3 space-y-2">
              <p className="text-xs font-medium">Authenticator MFA</p>
              {mfaSecret ? (
                <>
                  <p className="font-mono text-[10px] break-all text-ink-muted">{mfaSecret}</p>
                  <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))} minLength={6} maxLength={6} inputMode="numeric" placeholder="6-digit code" className="w-full border border-border rounded px-3 py-2 text-sm" />
                  <button type="button" onClick={enableMfa} className="w-full rounded bg-brand text-white py-2 text-sm">Enable MFA</button>
                </>
              ) : (
                <button type="button" onClick={setupMfa} className="w-full rounded border border-border py-2 text-xs">Set up authenticator</button>
              )}
            </div>
            <button type="button" onClick={onLogout} className="w-full rounded border border-border py-2 text-xs text-ink-muted hover:text-ink">
              Sign out
            </button>
          </>
        )}
        {message && <p className="text-xs text-ink-muted border-t border-border pt-3">{message}</p>}
      </section>
    </div>
  );
}
