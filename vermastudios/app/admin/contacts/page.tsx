'use client';

import { useState, useEffect } from 'react';
import { API_URL, fetchWithAuth } from '@/app/lib/api';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/contacts`);
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetchWithAuth(`${API_URL}/contacts/${id}/read`, { method: 'PATCH' });
      fetchContacts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetchWithAuth(`${API_URL}/contacts/${id}`, { method: 'DELETE' });
      fetchContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Contact Submissions</h1>

      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-200)' }}>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Contact</th>
                <th style={{ padding: '16px' }}>Service</th>
                <th style={{ padding: '16px', width: '30%' }}>Message</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} style={{
                  borderBottom: '1px solid var(--color-gray-200)',
                  background: contact.read ? '#fff' : 'rgba(201, 169, 110, 0.05)',
                }}>
                  <td style={{ padding: '16px' }}>
                    {contact.read ? (
                      <span style={{ color: 'var(--color-gray-400)', fontSize: '12px', background: 'var(--color-gray-100)', padding: '4px 8px', borderRadius: '4px' }}>Read</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '12px', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>New</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-gray-600)' }}>
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{contact.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div>{contact.email}</div>
                    <div style={{ color: 'var(--color-gray-500)', fontSize: '12px' }}>{contact.phone}</div>
                  </td>
                  <td style={{ padding: '16px', textTransform: 'capitalize' }}>{contact.service || '-'}</td>
                  <td style={{ padding: '16px', color: 'var(--color-gray-600)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={contact.message}>
                    {contact.message}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {!contact.read && (
                        <button onClick={() => markAsRead(contact.id)} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--color-gray-100)', border: '1px solid var(--color-gray-200)', borderRadius: '4px', cursor: 'pointer' }}>
                          Mark Read
                        </button>
                      )}
                      <button onClick={() => deleteContact(contact.id)} style={{ padding: '6px 12px', fontSize: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No contact submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
