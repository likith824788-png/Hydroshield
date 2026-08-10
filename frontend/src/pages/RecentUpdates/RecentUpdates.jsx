import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, RefreshCw, Mail, CheckCircle, XCircle, Clock,
  AlertTriangle, X, Map, ThumbsUp, ThumbsDown, Eye
} from 'lucide-react';

const TYPE_CONFIG = {
  'SOS Alert':              { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  'Municipal Recommendation': { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  'Civilian Alert':         { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  'General Alert':          { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
};

const STATUS_CONFIG = {
  sent:    { icon: CheckCircle, color: '#16a34a', label: 'Sent'    },
  failed:  { icon: XCircle,     color: '#dc2626', label: 'Failed'  },
  pending: { icon: Clock,       color: '#ca8a04', label: 'Pending' },
};

export default function RecentUpdates() {
  const [updates, setUpdates]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastSync, setLastSync]     = useState(null);
  const [previewEntry, setPreview]  = useState(null);   // email preview modal
  const [actions, setActions]       = useState({});     // { index: 'accepted' | 'rejected' }
  const navigate = useNavigate();

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/updates?limit=50');
      const json = await res.json();
      setUpdates(json?.data || []);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('[RecentUpdates]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
    const interval = setInterval(loadUpdates, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (index, action) => {
    setActions(prev => ({ ...prev, [index]: action }));
  };

  return (
    <div className="page-container stagger-children">
      {/* ── Email Preview Modal ─────────────────────────────── */}
      {previewEntry && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: '16px', width: '100%',
              maxWidth: '680px', maxHeight: '85vh', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{previewEntry.subject}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>To: {previewEntry.recipient}</div>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
                <X size={20} />
              </button>
            </div>
            {/* Modal body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {previewEntry.body_html ? (
                <div dangerouslySetInnerHTML={{ __html: previewEntry.body_html }} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
                  No email content available for this entry.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">Recent Updates</h1>
        <p className="page-subtitle">Live log of all email notifications dispatched via Resend</p>
        <div className="glow-line" />
      </div>

      {/* Summary bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { icon: Mail,         color: '#0284c7', count: updates.length,                                      label: 'Total'    },
            { icon: CheckCircle,  color: '#16a34a', count: updates.filter(u => u.status === 'sent').length,     label: 'Sent'     },
            { icon: XCircle,      color: '#dc2626', count: updates.filter(u => u.status === 'failed').length,   label: 'Failed'   },
            { icon: AlertTriangle,color: '#dc2626', count: updates.filter(u => u.type === 'SOS Alert').length,  label: 'SOS'      },
            { icon: Mail,         color: '#7c3aed', count: updates.filter(u => u.type === 'Municipal Recommendation').length, label: 'Municipal' },
          ].map(({ icon: Icon, color, count, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Icon size={14} color={color} />
              <span className="mono">{count}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastSync && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last synced: {lastSync}</span>}
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={loadUpdates} title="Refresh">
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading && updates.length === 0 ? (
        <div className="loading-spinner"><div className="spinner" /><span>Loading email log...</span></div>
      ) : updates.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Bell size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block' }} />
          <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            No emails dispatched yet
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Notifications will appear here after SOS submissions or Municipal alerts are sent.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {updates.map((entry, i) => {
            const typeStyle = TYPE_CONFIG[entry.type] || TYPE_CONFIG['General Alert'];
            const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            const ts        = entry.sent_at ? new Date(entry.sent_at + 'Z').toLocaleString() : '—';
            const action    = actions[i];

            return (
              <div
                key={i}
                className="glass-card animate-fade-up"
                style={{
                  padding: '16px 20px',
                  borderLeft: `4px solid ${typeStyle.color}`,
                  animationDelay: `${i * 0.04}s`,
                  opacity: action === 'rejected' ? 0.6 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                  {/* Type badge */}
                  <div style={{
                    flexShrink: 0, padding: '4px 10px', borderRadius: '100px',
                    background: typeStyle.bg, border: `1px solid ${typeStyle.border}`,
                    fontSize: '10px', fontWeight: 700, color: typeStyle.color,
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    alignSelf: 'center',
                  }}>
                    {entry.type}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.subject}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span><Mail size={11} style={{ display: 'inline', marginRight: '3px' }} />{entry.recipient}</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />{ts}</span>
                      {entry.id && <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--cyan)', fontSize: '11px' }}>ID: {entry.id}</span>}
                    </div>
                    {entry.error && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#dc2626', background: '#fef2f2', padding: '5px 10px', borderRadius: '6px' }}>
                        Error: {entry.error}
                      </div>
                    )}
                  </div>

                  {/* Right side: status + open + action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                    {/* Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: statusCfg.color }}>
                      <StatusIcon size={14} />
                      {statusCfg.label}
                    </div>

                    {/* Open email preview */}
                    <button
                      onClick={() => setPreview(entry)}
                      className="btn btn-ghost"
                      style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="View email"
                    >
                      <Eye size={13} /> View
                    </button>

                    {/* Municipal Recommendation → Accept / Reject */}
                    {entry.type === 'Municipal Recommendation' && !action && (
                      <>
                        <button
                          onClick={() => handleAction(i, 'accepted')}
                          style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ThumbsUp size={13} /> Accept
                        </button>
                        <button
                          onClick={() => handleAction(i, 'rejected')}
                          style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ThumbsDown size={13} /> Reject
                        </button>
                      </>
                    )}
                    {entry.type === 'Municipal Recommendation' && action && (
                      <span style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', color: action === 'accepted' ? '#16a34a' : '#dc2626', background: action === 'accepted' ? '#dcfce7' : '#fef2f2' }}>
                        {action === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                      </span>
                    )}

                    {/* SOS Alert → Rescue Plan */}
                    {entry.type === 'SOS Alert' && (
                      <button
                        onClick={() => navigate('/rescue-planner')}
                        style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, background: '#f0f9ff', border: '1px solid #0284c7', borderRadius: '8px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Map size={13} /> Rescue Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
