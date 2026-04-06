'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_URL, fetchWithAuth } from '@/app/lib/api';

interface Event {
  id: string;
  title: string;
  clientName: string;
  eventDate: string;
  price: string | null;
  category: string | null;
  status: string;
  description: string | null;
  notes: string | null;
  driveFolderUrl: string | null;
  hasAccessCode: boolean;
  hasDriveFolder: boolean;
  bannerImages?: string[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  upcoming: { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
};

const CATEGORIES = ['Wedding', 'Pre-Wedding', 'Birthday', 'Corporate', 'Baby Shower', 'Maternity', 'Other'];

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Event | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '', clientName: '', eventDate: '',
    price: '', category: '', status: 'upcoming',
    description: '', notes: '',
    driveFolderUrl: '', accessCode: '',
  });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/events`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const resetForm = () => {
    setForm({
      title: '', clientName: '', eventDate: '',
      price: '', category: '', status: 'upcoming',
      description: '', notes: '',
      driveFolderUrl: '', accessCode: '',
    });
    setGeneratedCode(null);
    setBannerFiles([]);
    setBannerPreviews([]);
  };

  const openEdit = (event: Event) => {
    setForm({
      title: event.title,
      clientName: event.clientName,
      eventDate: event.eventDate.split('T')[0],
      price: event.price || '',
      category: event.category || '',
      status: event.status,
      description: event.description || '',
      notes: event.notes || '',
      driveFolderUrl: event.driveFolderUrl || '',
      accessCode: '',
    });
    setGeneratedCode(null);
    setBannerFiles([]);
    setBannerPreviews(event.bannerImages || []);
    setShowEditModal(event);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 6);
      setBannerFiles(files);
      setBannerPreviews(files.map(f => URL.createObjectURL(f)));
    }
  };

  const uploadBanners = async (eventId: string) => {
    if (bannerFiles.length === 0) return;
    const formData = new FormData();
    bannerFiles.forEach(file => formData.append('bannerImages', file));
    await fetchWithAuth(`${API_URL}/events/${eventId}/banner`, {
      method: 'POST',
      body: formData,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price || null,
          category: form.category || null,
          driveFolderUrl: form.driveFolderUrl || null,
          accessCode: form.accessCode || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      
      const createdEvent = await res.json();
      await uploadBanners(createdEvent.id);

      await fetchEvents();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      alert('Error creating event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setActionLoading(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        price: form.price || null,
        category: form.category || null,
        driveFolderUrl: form.driveFolderUrl || null,
      };
      // Only send accessCode if admin typed a new one
      if (form.accessCode.trim()) {
        payload.accessCode = form.accessCode.trim();
      }
      const res = await fetchWithAuth(`${API_URL}/events/${showEditModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update event');

      await uploadBanners(showEditModal.id);

      await fetchEvents();
      setShowEditModal(null);
      resetForm();
    } catch (err) {
      alert('Error updating event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event record?')) return;
    try {
      await fetchWithAuth(`${API_URL}/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('Error deleting event.');
    }
  };

  const copyClientLink = (eventId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/gallery/${eventId}`);
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateCode = () => {
    const code = generateAccessCode();
    setForm(p => ({ ...p, accessCode: code }));
    setGeneratedCode(code);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '8px' }}>
            Event Gallery
          </h1>
          <p style={{ color: 'var(--color-gray-500)' }}>
            Manage and track your studio events.
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} style={btnPrimary}>
          + New Event
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Completed', value: events.filter(e => e.status === 'completed').length },
          { label: 'Upcoming', value: events.filter(e => e.status === 'upcoming').length },
          { label: 'With Gallery', value: events.filter(e => e.hasDriveFolder).length },
        ].map(s => (
          <div key={s.label} style={statCard}>
            <p style={statLabel}>{s.label}</p>
            <p style={statValue}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Events Table */}
      {loading ? (
        <p style={{ color: 'var(--color-gray-500)' }}>Loading events…</p>
      ) : events.length === 0 ? (
        <div style={emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📸</p>
          <p style={{ color: 'var(--color-gray-500)', marginBottom: '16px' }}>No events yet. Create your first event to get started.</p>
          <button onClick={() => { resetForm(); setShowCreateModal(true); }} style={btnPrimary}>+ New Event</button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {['Title & Client', 'Date', 'Category', 'Status', 'Gallery', 'Price', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const sc = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming;
                return (
                  <tr key={event.id} style={{ borderBottom: '1px solid var(--color-gray-200)' }}>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, color: 'var(--color-black)', marginBottom: '2px' }}>{event.title}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>{event.clientName}</p>
                    </td>
                    <td style={tdStyle}>
                      {new Date(event.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={tdStyle}>{event.category || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ ...statusBadge, background: sc.bg, color: sc.color }}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {event.hasDriveFolder ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ ...statusBadge, background: '#dbeafe', color: '#1e40af' }}>📷 Active</span>
                          {event.hasAccessCode && (
                            <span style={{ ...statusBadge, background: '#d1fae5', color: '#065f46', fontSize: '11px' }}>🔒</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-gray-400)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>{event.price ? `₹${event.price}` : '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => openEdit(event)} style={btnEdit} title="Edit event">
                          ✏️
                        </button>
                        {event.hasDriveFolder && (
                          <button
                            onClick={() => copyClientLink(event.id)}
                            style={{ ...btnCopy, background: copiedId === event.id ? '#10b981' : '#6366f1' }}
                            title="Copy client gallery link"
                          >
                            {copiedId === event.id ? '✓' : '🔗'}
                          </button>
                        )}
                        <button onClick={() => handleDelete(event.id)} style={btnDelete} title="Delete event">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {(showCreateModal || showEditModal) && (
        <ModalOverlay onClose={() => { setShowCreateModal(false); setShowEditModal(null); resetForm(); }}>
          <h2 style={modalTitle}>{showCreateModal ? 'Create New Event' : 'Edit Event'}</h2>
          <form onSubmit={showCreateModal ? handleCreate : handleEdit}>
            <div style={formGrid}>
              <FormField label="Event Title *">
                <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Sharma Wedding" />
              </FormField>
              <FormField label="Client Name *">
                <input style={inputStyle} value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} required placeholder="e.g. Rahul Sharma" />
              </FormField>
              <FormField label="Event Date *">
                <input style={inputStyle} type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} required />
              </FormField>
              <FormField label="Price (₹)">
                <input style={inputStyle} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 25000" />
              </FormField>
              <FormField label="Category">
                <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Status">
                <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="upcoming">Upcoming</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </FormField>
            </div>
            <FormField label="Description">
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Event details, location, shoot type…" />
            </FormField>
            <FormField label="Internal Notes">
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Private notes (not shown to client)" />
            </FormField>

            {/* ── Photo Delivery Section ── */}
            <div style={deliverySectionStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📸</span> Photo Delivery
              </h3>
              <FormField label="Google Drive Folder URL">
                <input
                  style={inputStyle}
                  value={form.driveFolderUrl}
                  onChange={e => setForm(p => ({ ...p, driveFolderUrl: e.target.value }))}
                  placeholder="https://drive.google.com/drive/folders/..."
                />
                <p style={hintText}>Paste the Google Drive folder link containing the client&apos;s photos.</p>
              </FormField>
              <FormField label={showEditModal ? 'New Access Code (leave blank to keep current)' : 'Client Access Code'}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={form.accessCode}
                    onChange={e => { setForm(p => ({ ...p, accessCode: e.target.value })); setGeneratedCode(null); }}
                    placeholder={showEditModal ? '(leave blank to keep current)' : 'e.g. A3X9K2'}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    style={btnGenerate}
                    title="Generate random code"
                  >
                    🔄 Generate
                  </button>
                </div>
                {generatedCode && (
                  <p style={{ ...hintText, color: '#059669', fontWeight: 600, marginTop: '6px' }}>
                    Generated code: <span style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '2px' }}>{generatedCode}</span> — share this with your client.
                  </p>
                )}
                {showEditModal && showEditModal.hasAccessCode && !form.accessCode && (
                  <p style={{ ...hintText, color: '#6366f1', marginTop: '4px' }}>
                    🔒 This event already has an access code set.
                  </p>
                )}
              </FormField>
            </div>

            {/* ── Banner Images Section ── */}
            <div style={deliverySectionStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🖼️</span> Banner Images
              </h3>
              <FormField label="Event Banners (Up to 6)">
                <input
                  style={inputStyle}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p style={hintText}>Select up to 6 pictures that will roll automatically on the client gallery page.</p>
                {bannerPreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {bannerPreviews.map((src, i) => (
                      <img key={i} src={src.startsWith('blob:') ? src : `${API_URL.replace('/api', '')}${src}`} alt="Banner preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                    ))}
                  </div>
                )}
              </FormField>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(null); resetForm(); }} style={btnSecondary}>
                Cancel
              </button>
              <button type="submit" style={btnPrimary} disabled={actionLoading}>
                {actionLoading ? 'Saving…' : showCreateModal ? 'Create Event' : 'Save Changes'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--color-white)', borderRadius: '16px',
        padding: '32px', width: '100%', maxWidth: '680px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const btnPrimary: React.CSSProperties = {
  background: 'var(--color-black)', color: '#fff',
  padding: '10px 20px', borderRadius: '8px', border: 'none',
  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent', color: 'var(--color-black)',
  padding: '10px 20px', borderRadius: '8px',
  border: '1px solid var(--color-gray-300)',
  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
};

const btnEdit: React.CSSProperties = {
  background: '#f59e0b', color: '#fff',
  padding: '6px 10px', borderRadius: '6px', border: 'none',
  fontSize: '13px', cursor: 'pointer',
};

const btnDelete: React.CSSProperties = {
  background: '#ef4444', color: '#fff',
  padding: '6px 10px', borderRadius: '6px', border: 'none',
  fontSize: '13px', cursor: 'pointer',
};

const btnCopy: React.CSSProperties = {
  color: '#fff',
  padding: '6px 10px', borderRadius: '6px', border: 'none',
  fontSize: '13px', cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const btnGenerate: React.CSSProperties = {
  background: '#6366f1', color: '#fff',
  padding: '10px 16px', borderRadius: '8px', border: 'none',
  fontWeight: 600, fontSize: '13px', cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse',
  background: 'var(--color-white)',
  borderRadius: '12px', overflow: 'hidden',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-gray-200)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '14px 16px',
  fontSize: '12px', fontWeight: 700,
  color: 'var(--color-gray-500)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  background: 'var(--color-gray-50)',
  borderBottom: '1px solid var(--color-gray-200)',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px', fontSize: '14px',
  color: 'var(--color-gray-700)', verticalAlign: 'middle',
};

const statusBadge: React.CSSProperties = {
  display: 'inline-block', padding: '3px 10px',
  borderRadius: '20px', fontSize: '12px', fontWeight: 600,
};

const statCard: React.CSSProperties = {
  background: 'var(--color-white)', padding: '20px',
  borderRadius: '8px', boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-gray-200)',
};

const statLabel: React.CSSProperties = {
  fontSize: '12px', color: 'var(--color-gray-500)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  fontWeight: 600, marginBottom: '6px',
};

const statValue: React.CSSProperties = {
  fontSize: '28px', fontWeight: 700, color: 'var(--color-black)', lineHeight: 1,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--color-gray-300)',
  borderRadius: '8px', fontSize: '14px',
  color: 'var(--color-black)', background: 'var(--color-white)',
  boxSizing: 'border-box',
};

const emptyState: React.CSSProperties = {
  background: 'var(--color-white)', textAlign: 'center',
  padding: '60px 32px', borderRadius: '12px',
  border: '1px solid var(--color-gray-200)',
};

const modalTitle: React.CSSProperties = {
  fontSize: '20px', fontWeight: 700,
  color: 'var(--color-black)', marginBottom: '24px',
};

const formGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px',
};

const deliverySectionStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
  marginTop: '8px',
};

const hintText: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-gray-500)',
  marginTop: '4px',
};
