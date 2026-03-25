'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL, fetchWithAuth } from '@/app/lib/api';

interface Event {
  id: number;
  title: string;
  clientName: string;
  eventDate: string;
  price: string | null;
  category: string | null;
  status: string;
  description: string | null;
  notes: string | null;
  driveFolderLink: string | null;
  driveFileCount: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  upcoming: { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
};

const CATEGORIES = ['Wedding', 'Pre-Wedding', 'Birthday', 'Corporate', 'Baby Shower', 'Maternity', 'Other'];

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState<Event | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '', clientName: '', eventDate: '',
    price: '', category: '', status: 'upcoming',
    description: '', notes: '',
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

  const resetForm = () => setForm({
    title: '', clientName: '', eventDate: '',
    price: '', category: '', status: 'upcoming',
    description: '', notes: '',
  });

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
    });
    setShowEditModal(event);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: form.price || null, category: form.category || null }),
      });
      if (!res.ok) throw new Error('Failed to create event');
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
      const res = await fetchWithAuth(`${API_URL}/events/${showEditModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: form.price || null, category: form.category || null }),
      });
      if (!res.ok) throw new Error('Failed to update event');
      await fetchEvents();
      setShowEditModal(null);
      resetForm();
    } catch (err) {
      alert('Error updating event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event record?')) return;
    try {
      await fetchWithAuth(`${API_URL}/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('Error deleting event.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUploadModal || !fileInputRef.current?.files?.length) return;

    const files = Array.from(fileInputRef.current.files);
    const BATCH_SIZE = 100;
    setActionLoading(true);
    setUploadProgress('');

    try {
      let totalUploaded = 0;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const formData = new FormData();
        batch.forEach(file => formData.append('photos', file));
        setUploadProgress(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(files.length / BATCH_SIZE)} — ${totalUploaded} of ${files.length} photos done…`);

        const res = await fetchWithAuth(`${API_URL}/events/${showUploadModal.id}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }
        totalUploaded += batch.length;
      }

      setUploadProgress(`✅ All ${files.length} photos uploaded successfully!`);
      await fetchEvents();
      setTimeout(() => {
        setShowUploadModal(null);
        setUploadProgress('');
      }, 2000);
    } catch (err: any) {
      setUploadProgress(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const copyLink = (event: Event) => {
    if (!event.driveFolderLink) return;
    navigator.clipboard.writeText(event.driveFolderLink);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
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
            Manage events, upload photos to Google Drive, and share gallery links with clients.
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
          { label: 'Total Photos', value: events.reduce((a, e) => a + e.driveFileCount, 0).toLocaleString() },
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
                {['Title & Client', 'Date', 'Category', 'Status', 'Price', 'Photos', 'Drive Link', 'Actions'].map(h => (
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
                    <td style={tdStyle}>{event.price ? `₹${event.price}` : '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: event.driveFileCount > 0 ? '#065f46' : 'var(--color-gray-500)' }}>
                        {event.driveFileCount.toLocaleString()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {event.driveFolderLink ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <a href={event.driveFolderLink} target="_blank" rel="noopener noreferrer" style={linkBtn}>
                            Open Drive
                          </a>
                          <button onClick={() => copyLink(event)} style={iconBtn} title="Copy link">
                            {copiedId === event.id ? '✅' : '📋'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-gray-400)', fontSize: '13px' }}>No folder yet</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => setShowUploadModal(event)} style={btnUpload} title="Upload photos">
                          📤 Upload
                        </button>
                        <button onClick={() => openEdit(event)} style={btnEdit} title="Edit event">
                          ✏️
                        </button>
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
            {showCreateModal && (
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
                A Google Drive folder will be created automatically for this event (requires credentials in .env).
              </p>
            )}
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

      {/* ── Upload Photos Modal ── */}
      {showUploadModal && (
        <ModalOverlay onClose={() => { if (!actionLoading) { setShowUploadModal(null); setUploadProgress(''); } }}>
          <h2 style={modalTitle}>Upload Photos — {showUploadModal.title}</h2>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#065f46', fontWeight: 500 }}>
              📸 Currently {showUploadModal.driveFileCount.toLocaleString()} photos in Drive
            </p>
            {showUploadModal.driveFolderLink && (
              <a href={showUploadModal.driveFolderLink} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#15803d', textDecoration: 'underline' }}>
                View Google Drive Folder →
              </a>
            )}
          </div>
          <form onSubmit={handleUpload}>
            <div style={{ border: '2px dashed var(--color-gray-300)', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '20px', background: 'var(--color-gray-50)' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📁</p>
              <p style={{ fontWeight: 600, color: 'var(--color-black)', marginBottom: '4px' }}>
                Select photos to upload
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
                Supports JPEG, PNG, WebP, HEIC. Select any number of files — they will be uploaded in batches.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                id="photo-upload-input"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const count = e.target.files?.length ?? 0;
                  const label = document.getElementById('file-count-label');
                  if (label) label.textContent = count > 0 ? `${count.toLocaleString()} file${count === 1 ? '' : 's'} selected` : '';
                }}
              />
              <label htmlFor="photo-upload-input" style={{ ...btnPrimary, cursor: 'pointer', display: 'inline-block' }}>
                Browse Files
              </label>
              <p id="file-count-label" style={{ marginTop: '12px', fontSize: '14px', color: 'var(--color-gray-600)', fontWeight: 500 }}></p>
            </div>

            {uploadProgress && (
              <div style={{
                background: uploadProgress.startsWith('❌') ? '#fee2e2' : uploadProgress.startsWith('✅') ? '#d1fae5' : '#dbeafe',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
                fontSize: '14px', color: uploadProgress.startsWith('❌') ? '#991b1b' : uploadProgress.startsWith('✅') ? '#065f46' : '#1e40af',
                fontWeight: 500,
              }}>
                {uploadProgress}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { if (!actionLoading) { setShowUploadModal(null); setUploadProgress(''); } }} style={btnSecondary} disabled={actionLoading}>
                Close
              </button>
              <button type="submit" style={btnPrimary} disabled={actionLoading}>
                {actionLoading ? 'Uploading…' : '📤 Upload to Drive'}
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

const btnUpload: React.CSSProperties = {
  background: '#1d4ed8', color: '#fff',
  padding: '6px 10px', borderRadius: '6px', border: 'none',
  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
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

const linkBtn: React.CSSProperties = {
  background: '#f0fdf4', color: '#15803d',
  padding: '4px 10px', borderRadius: '6px',
  textDecoration: 'none', fontSize: '12px', fontWeight: 600,
  border: '1px solid #bbf7d0',
};

const iconBtn: React.CSSProperties = {
  background: 'transparent', border: 'none',
  cursor: 'pointer', fontSize: '16px', padding: '2px',
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
