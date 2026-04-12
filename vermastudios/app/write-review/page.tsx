'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionTitle from '../components/SectionTitle';
import ScrollReveal from '../components/ScrollReveal';
import { API_URL } from '@/app/lib/api';

export default function WriteReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    event: '',
    quote: '',
    rating: 5,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/testimonials/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit review');
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 4000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section style={{
        position: 'relative',
        height: '40vh',
        minHeight: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&h=800&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 10, 0.75)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '16px',
          }}>Client Stories</p>
          <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#fafafa' }}>Share Your Experience</h1>
          <div className="gold-line" />
        </div>
      </section>

      <section className="section" style={{ background: 'var(--color-beige)' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <ScrollReveal animation="fadeUp">
            <div style={{
              background: 'var(--color-white)',
              padding: '48px',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
                  <h3 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--color-black)' }}>Thank You!</h3>
                  <p style={{ color: 'var(--color-gray-600)' }}>Your review has been successfully submitted and is under review.</p>
                  <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', marginTop: '16px' }}>Redirecting to home page...</p>
                </div>
              ) : (
                <>
                  <SectionTitle subtitle="Leave a Review" title="We'd love to hear from you." />
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {error && (
                      <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '4px', fontSize: '14px' }}>
                        {error}
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Your Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="John & Jane"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Event Name/Type</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="Wedding 2024"
                          value={formData.event}
                          onChange={e => setFormData({ ...formData, event: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Rating</label>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setFormData({ ...formData, rating: star })}
                            style={{ color: star <= formData.rating ? 'var(--color-gold)' : 'var(--color-gray-300)', transition: 'color 0.2s ease' }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Your Review</label>
                      <textarea
                        required
                        className="form-input"
                        placeholder="Tell us about your experience with Verma Studio..."
                        value={formData.quote}
                        onChange={e => setFormData({ ...formData, quote: e.target.value })}
                        style={{ minHeight: '150px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ marginTop: '16px', width: '100%', opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="padding: 48px"] {
            padding: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
