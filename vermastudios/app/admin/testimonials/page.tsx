'use client';

import { useState, useEffect, FormEvent } from 'react';

const API = 'http://localhost:5000/api';

interface Testimonial {
  id: number;
  name: string;
  event: string;
  quote: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [event, setEvent] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState('5');
  const [featured, setFeatured] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API}/testimonials`);
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setName(''); setEvent(''); setQuote(''); setRating('5'); setFeatured(true);
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setName(item.name);
    setEvent(item.event);
    setQuote(item.quote);
    setRating(String(item.rating));
    setFeatured(item.featured);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = { name, event, quote, rating: parseInt(rating), featured };
    
    try {
      const url = editingItem ? `${API}/testimonials/${editingItem.id}` : `${API}/testimonials`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchTestimonials();
      } else {
        alert('Failed to save testimonial.');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const toggleFeatured = async (item: Testimonial) => {
    try {
      await fetch(`${API}/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, featured: !item.featured }),
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await fetch(`${API}/testimonials/${id}`, { method: 'DELETE' });
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Testimonials</h1>
        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + Add Testimonial
        </button>
      </div>

      {loading ? (
        <p>Loading testimonials...</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-200)' }}>
                <th style={{ padding: '16px' }}>Client</th>
                <th style={{ padding: '16px' }}>Context/Event</th>
                <th style={{ padding: '16px' }}>Rating</th>
                <th style={{ padding: '16px' }}>Featured</th>
                <th style={{ padding: '16px', width: '30%' }}>Quote</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} style={{ borderBottom: '1px solid var(--color-gray-200)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{testimonial.name}</td>
                  <td style={{ padding: '16px', color: 'var(--color-gray-600)' }}>{testimonial.event}</td>
                  <td style={{ padding: '16px', color: 'var(--color-gold)' }}>
                    {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => toggleFeatured(testimonial)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: 'none',
                        background: testimonial.featured ? '#fef3c7' : '#f3f4f6',
                        color: testimonial.featured ? '#92400e' : '#9ca3af',
                      }}
                    >
                      {testimonial.featured ? '★ Featured' : '☆ Not Featured'}
                    </button>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-gray-600)', fontStyle: 'italic', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={testimonial.quote}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditModal(testimonial)} style={{ padding: '6px 12px', fontSize: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => deleteTestimonial(testimonial.id)} style={{ padding: '6px 12px', fontSize: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No testimonials yet. Add your first review!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingItem ? 'Edit Testimonial' : 'Add Review'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Client Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="form-input" style={{ padding: '10px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Event/Context *</label>
                  <input type="text" required value={event} onChange={(e) => setEvent(e.target.value)} className="form-input" style={{ padding: '10px' }} placeholder="e.g. Wedding Shoot" />
                </div>
                <div>
                  <label style={labelStyle}>Rating (1-5)</label>
                  <select value={rating} onChange={(e) => setRating(e.target.value)} className="form-input" style={{ padding: '10px' }}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Quote *</label>
                <textarea required value={quote} onChange={(e) => setQuote(e.target.value)} className="form-input" rows={4} style={{ padding: '10px', minHeight: '100px' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Feature on Homepage
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {editingItem ? 'Update Review' : 'Save Review'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-outline" style={{ flex: 1, padding: '12px', color: 'var(--color-black)', borderColor: 'var(--color-gray-300)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block' as const, fontSize: '13px', marginBottom: '8px', fontWeight: 500 };
