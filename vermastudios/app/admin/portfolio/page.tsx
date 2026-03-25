'use client';

import { useState, useEffect, FormEvent } from 'react';
import { API_URL, getImageUrl, fetchWithAuth } from '@/app/lib/api';

interface PortfolioImage {
  id: number;
  url: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  featured: boolean;
  order: number;
  images: PortfolioImage[];
}

export default function PortfolioAdmin() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wedding');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState('0');
  const [files, setFiles] = useState<File[]>([]);

  const fetchItems = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/portfolio`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setTitle('');
    setCategory('Wedding');
    setDescription('');
    setFeatured(false);
    setOrder('0');
    setFiles([]);
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description || '');
    setFeatured(item.featured);
    setOrder(String(item.order));
    setFiles([]);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem && files.length === 0) {
      alert('Please select at least one image.');
      return;
    }
    if (files.length > 5) {
      alert('You can upload a maximum of 5 images.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('featured', String(featured));
    formData.append('order', order);
    
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const url = editingItem ? `${API_URL}/portfolio/${editingItem.id}` : `${API_URL}/portfolio`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, { method, body: formData });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchItems();
      } else {
        alert('Failed to save portfolio item.');
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    const formData = new FormData();
    formData.append('title', item.title);
    formData.append('category', item.category);
    formData.append('description', item.description || '');
    formData.append('featured', String(!item.featured));
    formData.append('order', String(item.order));

    try {
      await fetchWithAuth(`${API_URL}/portfolio/${item.id}`, { method: 'PUT', body: formData });
      fetchItems();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetchWithAuth(`${API_URL}/portfolio/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Portfolio Management</h1>
        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ padding: '10px 20px' }}
        >
          + Add New Item
        </button>
      </div>

      {loading ? (
        <p>Loading portfolio...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {items.map((item) => (
            <div key={item.id} style={{
              background: '#fff',
              border: item.featured ? '2px solid var(--color-gold)' : '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {item.featured && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'var(--color-gold)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  zIndex: 1,
                }}>
                  ★ Featured
                </div>
              )}
              
              {/* Image Preview Grid */}
              <div style={{ position: 'relative', height: '180px', display: 'flex' }}>
                {item.images && item.images.length > 0 ? (
                  <>
                    <div style={{
                      flex: 1,
                      backgroundImage: `url(${getImageUrl(item.images[0]?.url || item.imageUrl)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                    {item.images.length > 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        +{item.images.length - 1} Images
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ flex: 1, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#9ca3af' }}>No Images</span>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{item.title}</h3>
                  <span style={{ fontSize: '11px', background: 'var(--color-gray-100)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                    {item.category}
                  </span>
                </div>
                {item.description && (
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', flexGrow: 1, marginBottom: '16px' }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => toggleFeatured(item)}
                    style={{
                      flex: 1, padding: '8px', fontSize: '12px',
                      background: item.featured ? '#fef3c7' : 'var(--color-gray-100)',
                      color: item.featured ? '#92400e' : 'var(--color-gray-600)',
                      border: `1px solid ${item.featured ? '#fcd34d' : 'var(--color-gray-200)'}`,
                      borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    {item.featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    style={{
                      flex: 1, padding: '8px', fontSize: '12px', background: '#e0f2fe',
                      color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      flex: 1, padding: '8px', fontSize: '12px', background: '#fee2e2',
                      color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p style={{ color: 'var(--color-gray-500)', gridColumn: '1 / -1' }}>No portfolio items found. Add your first item!</p>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', padding: '32px', borderRadius: '12px',
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" style={{ padding: '10px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" style={{ padding: '10px' }}>
                    <option value="Wedding">Wedding</option>
                    <option value="Events">Events</option>
                    <option value="Portraits">Portraits</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Order</label>
                  <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="form-input" style={{ padding: '10px' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description (Optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" rows={2} style={{ padding: '10px' }} />
              </div>
              <div>
                <label style={labelStyle}>Images (Max 5) {editingItem ? '- Uploading new replaces existing' : ''}</label>
                {editingItem?.images && editingItem.images.length > 0 && files.length === 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {editingItem.images.map(img => (
                      <div key={img.id} style={{
                        width: '60px', height: '60px', borderRadius: '4px',
                        backgroundImage: `url(${getImageUrl(img.url)})`, backgroundSize: 'cover', backgroundPosition: 'center'
                      }} />
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const selectedFiles = Array.from(e.target.files).slice(0, 5);
                      setFiles(selectedFiles);
                    }
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-gray-200)' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Select up to 5 images. These will play as a slideshow on the frontend.'}
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Feature on Homepage
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {editingItem ? 'Update' : 'Upload & Save'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-outline" style={{ flex: 1, padding: '12px', color: 'var(--color-black)', borderColor: 'var(--color-gray-300)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block' as const, fontSize: '13px', marginBottom: '8px', fontWeight: 500 };
