'use client';

import { useState, FormEvent } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'An error occurred.');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your internet connection.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center shadow-sm">
        <div className="text-5xl mb-4">🎰</div>
        <h3 className="text-xl font-semibold text-blue-600 mb-3">
          Your message has been sent!
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          We&apos;ve sent a confirmation email to your inbox.<br />
          We&apos;ll get back to you within 1-2 business days.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-sm hover:text-blue-600 hover:border-blue-200 transition"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 border border-gray-200 space-y-5 shadow-sm"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
