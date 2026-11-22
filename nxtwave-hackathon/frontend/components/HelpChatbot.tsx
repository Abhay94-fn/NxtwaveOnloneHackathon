'use client';

import React, { useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface HelpChatbotProps {
  schemeId?: string;
  token?: string;
}

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export default function HelpChatbot({ schemeId, token }: HelpChatbotProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Hello. Ask me about schemes, eligibility, benefits, documents, applications, or approval.',
    },
  ]);

  const sendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = message.trim();
    if (!text || sending) return;
    setMessage('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setSending(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ message: text, scheme_id: schemeId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Chat service unavailable');
      setMessages((current) => [...current, { role: 'bot', text: data.answer }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: 'bot', text: error instanceof Error ? error.message : 'Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <section className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
          <div className="bg-brand text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <div>
                <h2 className="text-sm font-medium">SevaSetu Assistant</h2>
                <p className="font-mono text-[9px] text-white/70">Verified scheme information</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot"><X className="w-4 h-4" /></button>
          </div>
          <div className="h-80 overflow-y-auto p-3 space-y-3">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${item.role === 'user' ? 'bg-brand text-white' : 'bg-surface-subtle text-ink'}`}>
                  {item.text}
                </p>
              </div>
            ))}
            {sending && <p className="text-[11px] text-ink-subtle">Assistant is checking the registry...</p>}
          </div>
          <form onSubmit={sendMessage} className="border-t border-border p-3 flex gap-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask a question..."
              aria-label="Chat message"
              className="min-w-0 flex-1 border border-border rounded px-3 py-2 text-xs outline-none focus:border-ink"
            />
            <button type="submit" disabled={sending || !message.trim()} aria-label="Send message" className="rounded bg-brand text-white px-3 disabled:opacity-40">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
        className="fixed bottom-5 right-4 sm:right-6 z-50 rounded-full bg-brand text-white p-3 shadow-lg hover:bg-brand-hover"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </>
  );
}
