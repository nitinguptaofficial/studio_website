'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import '../gallery.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EventPublicInfo {
  id: number;
  title: string;
}

interface GalleryData {
  id: number;
  title: string;
  clientName: string;
  eventDate: string;
  driveFolderUrl: string | null;
  category: string | null;
}

/**
 * Extracts Google Drive folder ID from various URL formats.
 */
function extractFolderId(url: string): string | null {
  if (!url) return null;
  // Format: https://drive.google.com/drive/folders/FOLDER_ID
  const match1 = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  // Format: https://drive.google.com/drive/u/0/folders/FOLDER_ID
  const match2 = url.match(/\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  // Format: just the ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;
  return null;
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

  const fetchPublicInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/public-info`);
      if (!res.ok) {
        setStage('notfound');
        return;
      }
      const data = await res.json();
      setEventInfo(data);
      setStage('access');
    } catch {
      setStage('notfound');
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchPublicInfo();
  }, [eventId, fetchPublicInfo]);

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
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
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
          <p className="gallery-notfound-text">
            This gallery doesn&apos;t exist or has been removed. Please check the link and try again.
          </p>
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

              <button
                id="gallery-verify-btn"
                type="submit"
                className="access-btn"
                disabled={verifying}
              >
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
    const folderId = galleryData.driveFolderUrl ? extractFolderId(galleryData.driveFolderUrl) : null;
    const formattedDate = new Date(galleryData.eventDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="gallery-page">
        <div className="gallery-ambient" />
        <div className="gallery-container">
          {/* Header */}
          <header className="gallery-header">
            <p className="gallery-header-logo">Verma Studios</p>
            <h1 className="gallery-event-title">{galleryData.title}</h1>
            <div className="gallery-meta">
              <span className="gallery-meta-item">
                <span className="gallery-meta-icon">👤</span>
                {galleryData.clientName}
              </span>
              <span className="gallery-meta-item">
                <span className="gallery-meta-icon">📅</span>
                {formattedDate}
              </span>
              {galleryData.category && (
                <span className="gallery-meta-item">
                  <span className="gallery-meta-icon">🏷️</span>
                  {galleryData.category}
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="gallery-content">
            {/* Action Buttons */}
            <div className="gallery-actions">
              {galleryData.driveFolderUrl && (
                <>
                  <a
                    id="gallery-download-btn"
                    href={folderId ? `https://drive.google.com/uc?export=download&id=${folderId}` : galleryData.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gallery-download-btn"
                  >
                    <span>⬇️</span>
                    Download All Photos
                  </a>
                  <a
                    id="gallery-open-drive-btn"
                    href={galleryData.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gallery-open-drive-btn"
                  >
                    <span>📁</span>
                    Open in Google Drive
                  </a>
                </>
              )}
            </div>

            {/* Embedded Drive Folder */}
            {folderId ? (
              <div className="gallery-embed-wrapper">
                <iframe
                  className="gallery-embed-iframe"
                  src={`https://drive.google.com/embeddedfolderview?id=${folderId}#grid`}
                  title="Photo Gallery"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="gallery-embed-wrapper">
                <div className="gallery-embed-fallback">
                  <div className="gallery-embed-fallback-icon">📷</div>
                  <p className="gallery-embed-fallback-text">
                    Your photos are ready! Click the button above to view and download them from Google Drive.
                  </p>
                  {galleryData.driveFolderUrl && (
                    <a
                      href={galleryData.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gallery-download-btn"
                    >
                      <span>📁</span>
                      Open Google Drive Folder
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="gallery-footer">
            <p className="gallery-footer-logo">Verma Studios</p>
            <div className="gallery-footer-divider" />
            <p className="gallery-footer-text">
              © {new Date().getFullYear()} Verma Studios. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}
