'use client';

import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <input
          type="text"
          placeholder="Your Name *"
          className="form-input"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="email"
          placeholder="Your Email *"
          className="form-input"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <input
          type="tel"
          placeholder="Phone Number"
          className="form-input"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
        <select
          className="form-input"
          value={formData.service}
          onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
          style={{ cursor: 'pointer' }}
        >
          <option value="">Select a Service</option>
          <option value="wedding">Wedding Photography</option>
          <option value="events">Event Coverage</option>
          <option value="portraits">Portrait Session</option>
          <option value="commercial">Commercial Shoot</option>
          <option value="studio">Studio Session</option>
        </select>
      </div>

      <textarea
        placeholder="Tell us about your project... *"
        className="form-input"
        required
        value={formData.message}
        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
        rows={5}
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === 'loading'}
        style={{
          alignSelf: 'flex-start',
          padding: '16px 48px',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'success' && (
        <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: 500 }}>
          ✓ Thank you! We&apos;ll get back to you within 24 hours.
        </p>
      )}

      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 500 }}>
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          form > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </form>
  );
}
