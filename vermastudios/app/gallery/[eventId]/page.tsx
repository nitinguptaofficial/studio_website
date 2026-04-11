'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import '../gallery.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EventPublicInfo {
  id: string;
  title: string;
}

interface GalleryData {
  id: string;
  title: string;
  clientName: string;
  eventDate: string;
  driveFolderUrl: string | null;
  category: string | null;
}

interface DriveImage {
  id: string;
  name: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export default function GalleryPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const [stage, setStage] = useState<'loading' | 'notfound' | 'access' | 'gallery'>('loading');
  const [eventInfo, setEventInfo] = useState<EventPublicInfo | null>(null);
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [inputError, setInputError] = useState(false);

  // Gallery images from Drive
  const [images, setImages] = useState<DriveImage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const fetchPublicInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/public-info`);
      if (!res.ok) { setStage('notfound'); return; }
      const data = await res.json();
      setEventInfo(data);
      setStage('access');
    } catch {
      setStage('notfound');
    }
  }, [eventId]);

  useEffect(() => { if (eventId) fetchPublicInfo(); }, [eventId, fetchPublicInfo]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Please enter the access code.');
      setInputError(true);
      setTimeout(() => setInputError(false), 600);
      return;
    }
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid access code. Please try again.');
        setInputError(true);
        setTimeout(() => setInputError(false), 600);
        setVerifying(false);
        return;
      }
      const data: GalleryData = await res.json();
      setGalleryData(data);
      setStage('gallery');

      // Fetch first 30 images from Drive
      if (data.driveFolderUrl) {
        setImagesLoading(true);
        try {
          const previewRes = await fetch(`${API_URL}/events/${eventId}/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessCode: accessCode.trim() }),
          });
          if (previewRes.ok) {
            const previewData = await previewRes.json();
            setImages(previewData.images || []);
            setTotalCount(previewData.totalCount || 0);
          }
        } catch { /* Images just won't load */ }
        finally { setImagesLoading(false); }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!galleryData) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${galleryData.title.replace(/[^a-z0-9]/gi, '_')}_Photos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again or contact your photographer.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Loading ──
  if (stage === 'loading') {
    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        <div className="gallery-loading">
          <div className="gallery-spinner" />
          <p className="gallery-loading-text">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (stage === 'notfound') {
    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        <div className="gallery-notfound">
          <div className="gallery-notfound-icon">📷</div>
          <h1 className="gallery-notfound-title">Gallery Not Found</h1>
          <p className="gallery-notfound-text">This gallery doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // ── Access Code Screen ──
  if (stage === 'access') {
    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        <div className="access-screen">
          <div className="access-card">
            <p className="access-logo">Verma Studios</p>
            <h1 className="access-title">{eventInfo?.title || 'Photo Gallery'}</h1>
            <p className="access-subtitle">Enter the access code shared by your photographer</p>
            <form onSubmit={handleVerify}>
              <div className="access-input-group">
                <input
                  id="gallery-access-code-input"
                  type="text"
                  className={`access-input ${inputError ? 'error' : ''}`}
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="• • • • • •"
                  maxLength={12}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              {error && <p className="access-error">{error}</p>}
              <button id="gallery-verify-btn" type="submit" className="access-btn" disabled={verifying}>
                {verifying ? 'Verifying...' : 'View Gallery'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Gallery View ──
  if (stage === 'gallery' && galleryData) {
    const formattedDate = new Date(galleryData.eventDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const remaining = totalCount - images.length;

    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        {/* Lightbox */}
        {lightboxSrc && (
          <div
            onClick={() => setLightboxSrc(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'zoom-out' }}
          >
            <img src={lightboxSrc} alt="Full size" style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
            <button onClick={() => setLightboxSrc(null)} style={{ position: 'absolute', top: '16px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px' }}>✕</button>
          </div>
        )}

        <div className="gallery-container">
          {/* Header */}
          <header className="gallery-header">
            <p className="gallery-header-logo">Verma Studios</p>
            <h1 className="gallery-event-title">{galleryData.title}</h1>
            <div className="gallery-meta">
              <span className="gallery-meta-item"><span className="gallery-meta-icon">👤</span>{galleryData.clientName}</span>
              <span className="gallery-meta-item"><span className="gallery-meta-icon">📅</span>{formattedDate}</span>
              {galleryData.category && (
                <span className="gallery-meta-item"><span className="gallery-meta-icon">🏷️</span>{galleryData.category}</span>
              )}
              {totalCount > 0 && (
                <span className="gallery-meta-item"><span className="gallery-meta-icon">📷</span>{totalCount} Photos</span>
              )}
            </div>
          </header>

          <div className="gallery-content">
            {/* Download Banner */}
            {galleryData.driveFolderUrl && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,191,165,0.12) 0%, rgba(139,94,122,0.12) 100%)',
                border: '1px solid rgba(0,191,165,0.25)',
                borderRadius: '16px',
                padding: '24px 32px',
                marginBottom: '32px',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center' as const,
              }}>
                {remaining > 0 ? (
                  <>
                    <p style={{ color: '#ede8f2', fontSize: '15px', lineHeight: 1.6, maxWidth: '560px' }}>
                      Showing <strong>{images.length}</strong> preview photos.{' '}
                      <strong>{remaining} more photo{remaining !== 1 ? 's' : ''}</strong> available — download the full gallery below.
                    </p>
                  </>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                    All {totalCount} photos are shown below.
                  </p>
                )}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="access-btn"
                  style={{ maxWidth: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {downloading ? (
                    <>⏳ Preparing Download…</>
                  ) : (
                    <>⬇️ Download All {totalCount > 0 ? `${totalCount} ` : ''}Photos (.zip)</>
                  )}
                </button>
                {downloading && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    This may take a moment depending on the number of photos. Please wait…
                  </p>
                )}
              </div>
            )}

            {/* Image Grid */}
            {imagesLoading ? (
              <div className="gallery-loading" style={{ minHeight: '300px' }}>
                <div className="gallery-spinner" />
                <p className="gallery-loading-text">Loading your photos…</p>
              </div>
            ) : images.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
              }}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setLightboxSrc(img.thumbnailUrl)}
                    style={{
                      aspectRatio: '4/3',
                      overflow: 'hidden',
                      borderRadius: '10px',
                      cursor: 'zoom-in',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    <img
                      src={img.thumbnailUrl}
                      alt={img.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            ) : galleryData.driveFolderUrl ? (
              <div className="gallery-embed-fallback">
                <div className="gallery-embed-fallback-icon">📷</div>
                <p className="gallery-embed-fallback-text">
                  No photos have been uploaded to this gallery yet. Please check back later or contact your photographer.
                </p>
              </div>
            ) : (
              <div className="gallery-embed-fallback">
                <div className="gallery-embed-fallback-icon">📷</div>
                <p className="gallery-embed-fallback-text">
                  Your gallery is being prepared. Your photographer will share the link once photos are ready.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="gallery-footer">
            <p className="gallery-footer-logo">Verma Studios</p>
            <div className="gallery-footer-divider" />
            <p className="gallery-footer-text">© {new Date().getFullYear()} Verma Studios. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}
