'use client';

import { useState, useEffect, FormEvent } from 'react';

const API = 'http://localhost:5000/api';

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  price: string;
  features: string;
  active: boolean;
  order: number;
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [order, setOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services?all=true`);
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setName(''); setDescription(''); setIcon(''); setPrice(''); setFeatures(''); setOrder('0'); setActive(true); setFile(null);
    setEditingService(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setIcon(service.icon || '');
    setPrice(service.price || '');
    setFeatures(service.features || '');
    setOrder(String(service.order));
    setActive(service.active);
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('icon', icon);
    formData.append('price', price);
    formData.append('features', features);
    formData.append('order', order);
    formData.append('active', String(active));
    if (file) formData.append('image', file);

    try {
      const url = editingService ? `${API}/services/${editingService.id}` : `${API}/services`;
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchServices();
      } else {
        alert('Failed to save service.');
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetch(`${API}/services/${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Services Management</h1>
        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + Add New Service
        </button>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-200)' }}>
                <th style={{ padding: '16px', width: '60px' }}>Image</th>
                <th style={{ padding: '16px', width: '50px' }}>Icon</th>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Description</th>
                <th style={{ padding: '16px' }}>Price</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} style={{ borderBottom: '1px solid var(--color-gray-200)', opacity: service.active ? 1 : 0.5 }}>
                  <td style={{ padding: '12px 16px' }}>
                    {service.imageUrl ? (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        backgroundImage: `url(${getImageUrl(service.imageUrl)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid var(--color-gray-200)',
                      }} />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        background: 'var(--color-gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'var(--color-gray-400)',
                      }}>
                        No img
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '24px' }}>{service.icon}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{service.name}</td>
                  <td style={{ padding: '16px', color: 'var(--color-gray-600)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {service.description}
                  </td>
                  <td style={{ padding: '16px' }}>{service.price || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background: service.active ? '#dcfce7' : '#f3f4f6',
                      color: service.active ? '#16a34a' : '#9ca3af',
                    }}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditModal(service)} style={{ padding: '6px 12px', fontSize: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => deleteService(service.id)} style={{ padding: '6px 12px', fontSize: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No services configured yet. Add your first service!
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
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Service Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="form-input" style={{ padding: '10px' }} />
                </div>
                <div>
                  <label style={labelStyle}>Icon (Emoji)</label>
                  <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className="form-input" style={{ padding: '10px' }} placeholder="e.g. 📸" />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" rows={3} style={{ padding: '10px', minHeight: '80px' }} />
              </div>

              <div>
                <label style={labelStyle}>Service Image {editingService ? '(Leave empty to keep current)' : '(Optional)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-gray-200)', borderRadius: '4px' }}
                />
                {editingService?.imageUrl && (
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '4px' }}>Current image: {editingService.imageUrl}</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Price (Optional)</label>
                  <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="form-input" style={{ padding: '10px' }} placeholder="e.g. ₹25,000" />
                </div>
                <div>
                  <label style={labelStyle}>Order / Sorting Index</label>
                  <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="form-input" style={{ padding: '10px' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Features (Comma separated)</label>
                <textarea value={features} onChange={(e) => setFeatures(e.target.value)} className="form-input" rows={2} style={{ padding: '10px', minHeight: '60px' }} placeholder="e.g. Pre-wedding shoot, Full-day coverage, Photo album..." />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active (visible on website)
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {editingService ? 'Update Service' : 'Save Service'}
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
