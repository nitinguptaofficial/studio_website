'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './gallery.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PublicEvent {
  id: string;
  title: string;
  clientName: string;
  eventDate: string;
  category: string | null;
  bannerImages: string[];
}

export default function GalleryHomePage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`${API_URL}/events/public/all`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        <div className="gallery-loading">
          <div className="gallery-spinner" />
          <p className="gallery-loading-text">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        <div className="gallery-notfound">
          <div className="gallery-notfound-icon">📸</div>
          <h1 className="gallery-notfound-title">{error ? 'Oops!' : 'No Events Found'}</h1>
          <p className="gallery-notfound-text">
            {error ? 'Something went wrong while fetching events.' : 'There are currently no events to display.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="gallery-ambient" />

      {/* Header */}
      <header className="gallery-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
        <p className="gallery-header-logo">Verma Studio</p>
        <h1 className="gallery-event-title">Client Galleries</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '500px', margin: '0 auto', fontSize: '15px' }}>
          Select your event to access the private photo gallery. You will need your unique access code.
        </p>
      </header>

      {/* Events Grid */}
      <div className="events-grid">
        {events.map((event) => {
          // Add fallback if no images were uploaded yet
          const images = event.bannerImages?.length > 0 
              ? event.bannerImages 
              : ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop'];

          // Duplicate once to make -50% translateX fully seamless
          const rollImages = [...images, ...images];

          return (
            <Link key={event.id} href={`/gallery/${event.id}`} className="event-card">
              <div className="event-card-banner-wrapper">
                <div 
                  className="event-card-banner-track" 
                  // If fewer than 2 images, don't animate or animation makes less sense, but will keep it for consistency.
                  style={{ animationDuration: `${Math.max(20, images.length * 4)}s` }}
                >
                  {rollImages.map((src, index) => {
                    const imageUrl = src.startsWith('http') ? src : `${API_URL?.replace('/api', '')}${src}`;
                    return (
                      <img 
                        key={index} 
                        src={imageUrl} 
                        alt={`${event.title} banner ${index}`} 
                        className="event-card-banner-img" 
                      />
                    );
                  })}
                </div>
              </div>
              <div className="event-card-body">
                <h3 className="event-card-title">{event.title}</h3>
                <div className="event-card-subtitle">
                  <span>{new Date(event.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {event.category && <span className="event-card-category">{event.category}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Footer */}
      <footer className="gallery-footer" style={{ marginTop: '0' }}>
        <p className="gallery-footer-logo">Verma Studio</p>
        <div className="gallery-footer-divider" />
        <p className="gallery-footer-text">
          © {new Date().getFullYear()} Verma Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
