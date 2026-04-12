'use client';

import { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle';
import { API_URL, getImageUrl } from '@/app/lib/api';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
}

export default function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/about/team`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/about/timeline`).then(r => r.json()).catch(() => []),
    ]).then(([t, tl]) => {
      setTeam(t);
      setTimeline(tl);
    }).finally(() => setLoading(false));
  }, []);



  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '60vh',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&h=800&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 10, 0.7)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '16px',
          }}>Our Story</p>
          <h1 style={{ fontSize: '52px', fontWeight: 700, color: '#fafafa' }}>About Us</h1>
          <div className="gold-line" />
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              marginBottom: '12px',
            }}>Who We Are</p>
            <h2 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '24px', lineHeight: 1.2 }}>
              More Than Photographers,<br />We Are Storytellers
            </h2>
            <div className="gold-line gold-line-left" />
            <p style={{ fontSize: '15px', lineHeight: 1.9, color: 'var(--color-gray-600)', marginBottom: '20px', marginTop: '24px' }}>
              Verma Studio, established in 1991, has been a trusted name in professional photography for many years. Our experienced and dedicated team specializes in wedding photography, pre-wedding shoots, and engagement shoots.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.9, color: 'var(--color-gray-600)', marginBottom: '32px' }}>
              We focus on understanding our clients' requirements and capturing every special moment with creativity and perfection. With high-quality work, a creative vision, and a professional team, Verma Studio is committed to turning your precious moments into beautiful and lasting memories.
            </p>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-gold)' }}>8+</p>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Years</p>
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-gold)' }}>500+</p>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clients</p>
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-gold)' }}>15+</p>
                <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Awards</p>
              </div>
            </div>
          </div>
          <div style={{
            position: 'relative',
            height: '500px',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=500&fit=crop"
              alt="Verma Studio workspace"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              width: '200px',
              height: '200px',
              border: '3px solid var(--color-gold)',
              zIndex: -1,
            }} />
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
            .team-card {
              flex-direction: column !important;
              gap: 32px !important;
            }
            .team-image {
              flex: 0 0 auto !important;
              width: 100% !important;
              height: 400px !important;
            }
            .team-text {
              text-align: center;
            }
          }
        `}</style>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="section section-beige">
          <div className="container">
            <SectionTitle subtitle="The Team" title="Meet Our Creative Minds" />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '80px',
              maxWidth: '1000px',
              margin: '0 auto',
            }}>
              {team.map((member, index) => (
                <div key={member.id} className="team-card" style={{
                  display: 'flex',
                  flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                  alignItems: 'center',
                  gap: '60px',
                }}>
                  <div className="team-text" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-black)' }}>
                      {member.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--color-gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '24px',
                    }}>
                      {member.role}
                    </p>
                    <div style={{ fontSize: '15px', lineHeight: 1.9, color: 'var(--color-gray-600)', whiteSpace: 'pre-wrap' }}>
                      {member.bio}
                    </div>
                  </div>
                  <div className="team-image" style={{ 
                    flex: '0 0 400px', 
                    position: 'relative', 
                    height: '500px', 
                    overflow: 'hidden',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(member.imageUrl)}
                      alt={member.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionTitle subtitle="Our Journey" title="Milestones & Achievements" />
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {timeline.map((item, index) => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '32px',
                  paddingBottom: index < timeline.length - 1 ? '48px' : '0',
                  position: 'relative',
                }}>
                  {/* Year */}
                  <div style={{
                    minWidth: '80px',
                    textAlign: 'right',
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--color-gold)',
                    }}>{item.year}</span>
                  </div>
                  {/* Line */}
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: 'var(--color-gold)',
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: '6px',
                    }} />
                    {index < timeline.length - 1 && (
                      <div style={{
                        width: '1px',
                        flex: 1,
                        background: 'var(--color-gray-200)',
                      }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ paddingTop: '2px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-gray-500)' }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
