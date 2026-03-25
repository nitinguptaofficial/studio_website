'use client';

import { useState, useEffect } from 'react';
import { API_URL, fetchWithAuth } from '@/app/lib/api';

interface Stats {
  contacts: number;
  unreadContacts: number;
  portfolio: number;
  services: number;
  testimonials: number;
  events: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contactsRes, portfolioRes, servicesRes, testimonialsRes, eventsRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/contacts`),
          fetchWithAuth(`${API_URL}/portfolio`),
          fetchWithAuth(`${API_URL}/services?all=true`),
          fetchWithAuth(`${API_URL}/testimonials`),
          fetchWithAuth(`${API_URL}/events`),
        ]);

        const contacts = await contactsRes.json();
        const portfolio = await portfolioRes.json();
        const services = await servicesRes.json();
        const testimonials = await testimonialsRes.json();
        const events = await eventsRes.json();

        setStats({
          contacts: contacts.length,
          unreadContacts: contacts.filter((c: any) => !c.read).length,
          portfolio: portfolio.length,
          services: services.length,
          testimonials: testimonials.length,
          events: Array.isArray(events) ? events.length : 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--color-black)',
        marginBottom: '8px',
      }}>
        Dashboard Overview
      </h1>
      <p style={{ color: 'var(--color-gray-500)', marginBottom: '32px' }}>
        Welcome back. Here is a summary of your studio&apos;s data.
      </p>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {/* Stat Cards */}
          <div style={cardStyle}>
            <p style={cardLabel}>New Messages</p>
            <p style={{ ...cardValue, color: stats?.unreadContacts ? '#ef4444' : 'var(--color-black)' }}>
              {stats?.unreadContacts}
            </p>
          </div>
          <div style={cardStyle}>
            <p style={cardLabel}>Total Contacts</p>
            <p style={cardValue}>{stats?.contacts}</p>
          </div>
          <div style={cardStyle}>
            <p style={cardLabel}>Portfolio Items</p>
            <p style={cardValue}>{stats?.portfolio}</p>
          </div>
          <div style={cardStyle}>
            <p style={cardLabel}>Active Services</p>
            <p style={cardValue}>{stats?.services}</p>
          </div>
          <div style={cardStyle}>
            <p style={cardLabel}>Testimonials</p>
            <p style={cardValue}>{stats?.testimonials}</p>
          </div>
          <div style={cardStyle}>
            <p style={cardLabel}>Events</p>
            <p style={cardValue}>{stats?.events}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: 'var(--color-white)',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-gray-200)',
};

const cardLabel = {
  fontSize: '14px',
  color: 'var(--color-gray-500)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '8px',
  fontWeight: 600,
};

const cardValue = {
  fontSize: '32px',
  fontWeight: 700,
  color: 'var(--color-black)',
  lineHeight: 1,
};
