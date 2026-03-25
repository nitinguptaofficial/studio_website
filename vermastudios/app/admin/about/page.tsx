'use client';

import { useState, useEffect, FormEvent } from 'react';
import { API_URL, getImageUrl, fetchWithAuth } from '@/app/lib/api';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
}

interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
  order: number;
}

export default function AboutAdmin() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'timeline'>('team');

  // Team modal state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberBio, setMemberBio] = useState('');
  const [memberOrder, setMemberOrder] = useState('0');
  const [memberFile, setMemberFile] = useState<File | null>(null);

  // Timeline modal state
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventYear, setEventYear] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventOrder, setEventOrder] = useState('0');

  const fetchData = async () => {
    try {
      const [teamRes, timelineRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/about/team`),
        fetchWithAuth(`${API_URL}/about/timeline`),
      ]);
      setTeam(await teamRes.json());
      setTimeline(await timelineRes.json());
    } catch (error) {
      console.error('Failed to fetch about data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);



  // ==================== TEAM HANDLERS ====================
  const resetTeamForm = () => {
    setMemberName(''); setMemberRole(''); setMemberBio(''); setMemberOrder('0'); setMemberFile(null);
    setEditingMember(null);
  };

  const openAddTeam = () => { resetTeamForm(); setShowTeamModal(true); };

  const openEditTeam = (m: TeamMember) => {
    setEditingMember(m);
    setMemberName(m.name);
    setMemberRole(m.role);
    setMemberBio(m.bio);
    setMemberOrder(String(m.order));
    setMemberFile(null);
    setShowTeamModal(true);
  };

  const handleTeamSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', memberName);
    formData.append('role', memberRole);
    formData.append('bio', memberBio);
    formData.append('order', memberOrder);
    if (memberFile) formData.append('image', memberFile);

    const url = editingMember ? `${API_URL}/about/team/${editingMember.id}` : `${API_URL}/about/team`;
    const method = editingMember ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(url, { method, body: formData });
      if (res.ok) { setShowTeamModal(false); resetTeamForm(); fetchData(); }
      else alert('Failed to save team member.');
    } catch (error) { console.error('Error saving team member:', error); }
  };

  const deleteMember = async (id: number) => {
    if (!confirm('Delete this team member?')) return;
    await fetchWithAuth(`${API_URL}/about/team/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // ==================== TIMELINE HANDLERS ====================
  const resetTimelineForm = () => {
    setEventYear(''); setEventTitle(''); setEventDesc(''); setEventOrder('0');
    setEditingEvent(null);
  };

  const openAddTimeline = () => { resetTimelineForm(); setShowTimelineModal(true); };

  const openEditTimeline = (ev: TimelineEvent) => {
    setEditingEvent(ev);
    setEventYear(ev.year);
    setEventTitle(ev.title);
    setEventDesc(ev.description);
    setEventOrder(String(ev.order));
    setShowTimelineModal(true);
  };

  const handleTimelineSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = { year: eventYear, title: eventTitle, description: eventDesc, order: parseInt(eventOrder) };

    const url = editingEvent ? `${API_URL}/about/timeline/${editingEvent.id}` : `${API_URL}/about/timeline`;
    const method = editingEvent ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { setShowTimelineModal(false); resetTimelineForm(); fetchData(); }
      else alert('Failed to save timeline event.');
    } catch (error) { console.error('Error saving timeline:', error); }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Delete this timeline event?')) return;
    await fetchWithAuth(`${API_URL}/about/timeline/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>About Page Management</h1>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--color-gray-200)' }}>
        {(['team', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--color-gold)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-gray-500)',
              cursor: 'pointer',
              marginBottom: '-2px',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'team' ? '👥 Team Members' : '📅 Timeline'}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : activeTab === 'team' ? (
        /* ==================== TEAM TAB ==================== */
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={openAddTeam} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              + Add Team Member
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {team.map((member) => (
              <div key={member.id} style={{
                background: '#fff',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '200px',
                  backgroundImage: member.imageUrl ? `url(${getImageUrl(member.imageUrl)})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  background: member.imageUrl ? undefined : 'var(--color-gray-100)',
                  display: member.imageUrl ? undefined : 'flex',
                  alignItems: member.imageUrl ? undefined : 'center',
                  justifyContent: member.imageUrl ? undefined : 'center',
                }}>
                  {member.imageUrl && (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${getImageUrl(member.imageUrl)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  {!member.imageUrl && (
                    <span style={{ fontSize: '48px', opacity: 0.3 }}>👤</span>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{member.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{member.role}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: 1.5, marginBottom: '12px', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.bio}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditTeam(member)} style={{ flex: 1, padding: '8px', fontSize: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteMember(member.id)} style={{ flex: 1, padding: '8px', fontSize: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {team.length === 0 && (
              <p style={{ color: 'var(--color-gray-500)', gridColumn: '1 / -1' }}>No team members yet. Add your first team member!</p>
            )}
          </div>
        </>
      ) : (
        /* ==================== TIMELINE TAB ==================== */
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={openAddTimeline} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              + Add Timeline Event
            </button>
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--color-gray-100)', borderBottom: '1px solid var(--color-gray-200)' }}>
                  <th style={{ padding: '16px', width: '80px' }}>Year</th>
                  <th style={{ padding: '16px' }}>Title</th>
                  <th style={{ padding: '16px' }}>Description</th>
                  <th style={{ padding: '16px', width: '60px' }}>Order</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid var(--color-gray-200)' }}>
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--color-gold)' }}>{ev.year}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{ev.title}</td>
                    <td style={{ padding: '16px', color: 'var(--color-gray-600)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.description}</td>
                    <td style={{ padding: '16px' }}>{ev.order}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEditTimeline(ev)} style={{ padding: '6px 12px', fontSize: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteEvent(ev.id)} style={{ padding: '6px 12px', fontSize: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {timeline.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-500)' }}>No timeline events yet. Add your first milestone!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Team Member Modal */}
      {showTeamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <form onSubmit={handleTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input type="text" required value={memberName} onChange={(e) => setMemberName(e.target.value)} className="form-input" style={{ padding: '10px' }} />
                </div>
                <div>
                  <label style={labelStyle}>Role *</label>
                  <input type="text" required value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="form-input" style={{ padding: '10px' }} placeholder="e.g. Lead Photographer" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bio *</label>
                <textarea required value={memberBio} onChange={(e) => setMemberBio(e.target.value)} className="form-input" rows={3} style={{ padding: '10px' }} placeholder="Brief bio..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Photo {editingMember ? '(Leave empty to keep)' : ''}</label>
                  <input type="file" accept="image/*" onChange={(e) => setMemberFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '8px', border: '1px solid var(--color-gray-200)', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" value={memberOrder} onChange={(e) => setMemberOrder(e.target.value)} className="form-input" style={{ padding: '10px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>{editingMember ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => { setShowTeamModal(false); resetTeamForm(); }} className="btn btn-outline" style={{ flex: 1, padding: '12px', color: 'var(--color-black)', borderColor: 'var(--color-gray-300)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingEvent ? 'Edit Timeline Event' : 'Add Timeline Event'}
            </h2>
            <form onSubmit={handleTimelineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Year *</label>
                  <input type="text" required value={eventYear} onChange={(e) => setEventYear(e.target.value)} className="form-input" style={{ padding: '10px' }} placeholder="2024" />
                </div>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input type="text" required value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="form-input" style={{ padding: '10px' }} placeholder="e.g. Studio Founded" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea required value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} className="form-input" rows={3} style={{ padding: '10px' }} />
              </div>
              <div>
                <label style={labelStyle}>Display Order</label>
                <input type="number" value={eventOrder} onChange={(e) => setEventOrder(e.target.value)} className="form-input" style={{ padding: '10px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>{editingEvent ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => { setShowTimelineModal(false); resetTimelineForm(); }} className="btn btn-outline" style={{ flex: 1, padding: '12px', color: 'var(--color-black)', borderColor: 'var(--color-gray-300)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block' as const, fontSize: '13px', marginBottom: '8px', fontWeight: 500 };
