import React, { useEffect, useState } from 'react';
import { agentsAPI } from '../../api';
import { Bot, Droplets, Brain, Building2, Shield, Map, RefreshCw } from 'lucide-react';

const ICONS = {
  'droplets': Droplets, 'brain': Brain, 'building': Building2,
  'shield': Shield, 'map': Map,
};

const STATUS_CONFIG = {
  ACTIVE:     { cls: 'badge-active',     dot: 'green',  label: 'ACTIVE'     },
  PROCESSING: { cls: 'badge-processing', dot: 'cyan',   label: 'PROCESSING' },
  COMPLETED:  { cls: 'badge-completed',  dot: 'purple', label: 'COMPLETED'  },
};

export default function AgentStatus() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await agentsAPI.getStatus();
      setAgents(res?.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">AI Agent Status</h1>
        <p className="page-subtitle">System-wide AI agent monitoring and operational status dashboard</p>
        <div className="glow-line" />
      </div>

      {/* Summary Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {Object.entries({ ACTIVE: 'green', PROCESSING: 'cyan', COMPLETED: 'purple' }).map(([status, dotColor]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span className={`pulse-dot ${dotColor}`} />
              <span className="mono">{agents.filter(a => a.status === status).length}</span>
              <span>{status}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastUpdated && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last updated: {lastUpdated}</span>}
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={loadAgents}>
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Agent Cards */}
      {loading && agents.length === 0 ? (
        <div className="loading-spinner"><div className="spinner" /><span>Loading agents...</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {agents.map((agent, i) => {
            const Icon = ICONS[agent.icon] || Bot;
            const sc = STATUS_CONFIG[agent.status] || STATUS_CONFIG.ACTIVE;
            return (
              <div key={agent.id} className="glass-card animate-fade-up" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', animationDelay: `${i * 0.08}s` }}>
                {/* Agent Icon */}
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,212,255,0.2))', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--cyan)' }}>
                  <Icon size={24} />
                </div>

                {/* Agent Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{agent.description}</div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: '32px', flexShrink: 0 }}>
                  {[
                    { label: 'Tasks Done', value: agent.tasks_completed?.toLocaleString() },
                    { label: 'Uptime', value: `${agent.uptime_hours}h` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Status Badge */}
                <span className={`badge ${sc.cls}`} style={{ flexShrink: 0 }}>
                  <span className={`pulse-dot ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
