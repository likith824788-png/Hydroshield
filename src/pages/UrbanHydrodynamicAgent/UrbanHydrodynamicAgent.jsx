import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain, MapPin, Waves, TrendingUp, Activity, Target
} from 'lucide-react';

function GaugeLarge({ value, max = 100, color = '#00d4ff' }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 68;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '240px', margin: '0 auto 10px', textAlign: 'center' }}>
      <svg viewBox="0 0 200 100" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Background Arc */}
        <path
          d="M 26 85 A 68 68 0 0 1 174 85"
          fill="none"
          stroke="rgba(0, 0, 0, 0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d="M 26 85 A 68 68 0 0 1 174 85"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s' }}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '38px', fontWeight: 700, color, lineHeight: 1 }}>
          {value.toFixed(1)}<span style={{ fontSize: '20px' }}>%</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
          Flood Probability
        </div>
      </div>
    </div>
  );
}

export default function UrbanHydrodynamicAgent() {
  const { prediction, loadingPrediction } = useApp();

  const level = prediction?.level || 'SAFE';
  const prob  = prediction?.probability ?? 0;

  const gaugeColor = { SAFE: '#00ff88', LOW: '#ffd700', MODERATE: '#ff8c00', HIGH: '#ff3030' }[level] || '#00d4ff';
  const statusClass = { SAFE: 'badge-safe', LOW: 'badge-low', MODERATE: 'badge-moderate', HIGH: 'badge-high' }[level];
  const dotColor    = { SAFE: 'green', LOW: 'yellow', MODERATE: 'orange', HIGH: 'red' }[level];

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">Urban Hydrodynamic Agent</h1>
        <p className="page-subtitle">AI-powered urban flood dynamics prediction and area impact analysis</p>
        <div className="glow-line" />
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Left Card: AI Prediction Engine */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <div className="card-icon-wrapper"><Brain size={16} /></div>
              AI Prediction Engine
            </div>
            {loadingPrediction ? <div className="spinner" /> : (
              <span className={`badge ${statusClass}`}>
                <span className={`pulse-dot ${dotColor}`} />
                {level}
              </span>
            )}
          </div>

          {/* Speedometer Gauge Moved Up */}
          <GaugeLarge value={prob} color={gaugeColor} />

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { icon: TrendingUp, label: 'Flood Severity',    value: level,                              color: gaugeColor },
              { icon: Waves,      label: 'Est. Water Level',  value: `${prediction?.estimated_water_depth ?? '—'} m`, color: 'var(--cyan)' },
              { icon: Activity,   label: 'Confidence Score',  value: `${prediction?.confidence ?? '—'}%`,  color: '#00ff88' },
              { icon: Target,     label: 'River Level',       value: `${prediction?.river_level ?? '—'} m`, color: '#7b4fff' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="data-row">
                <div className="data-row-label">
                  <div className="data-row-icon" style={{ color }}><Icon size={15} /></div>
                  {label}
                </div>
                <span className="mono" style={{ color, fontSize: '14px', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Prediction Confidence</span>
              <span className="mono" style={{ color: '#00ff88' }}>{prediction?.confidence ?? 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${prediction?.confidence ?? 0}%`, background: 'linear-gradient(90deg, #00ff88, #00d4ff)' }} />
            </div>
          </div>
        </div>

        {/* Right Card: Predicted Flood-Prone Locations */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <div className="card-icon-wrapper"><MapPin size={16} /></div>
              Predicted Flood-Prone Locations
            </div>
            {prediction?.affected_areas?.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {prediction.affected_areas.length} zones
              </span>
            )}
          </div>

          {/* Places start coming directly from the TOP */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {(!prediction?.affected_areas || prediction.affected_areas.length === 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Activity size={36} color="var(--status-safe)" />
                <p style={{ margin: 0 }}>No affected areas predicted under current conditions.</p>
              </div>
            ) : (
              <div className="area-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prediction.affected_areas.map((area, i) => (
                  <div key={i} className="area-item" style={{ animationDelay: `${i * 0.05}s`, margin: 0 }}>
                    <span className="area-item-dot" style={{ background: gaugeColor }} />
                    <span style={{ flex: 1 }}>{area}</span>
                    <span className={`badge ${statusClass}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Fields - Anchored flush to the bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <div className="grid-2" style={{ gap: '10px' }}>
              {[
                { label: 'Areas Affected', value: prediction?.affected_areas?.length ?? 0, color: gaugeColor },
                { label: 'Flood Probability', value: prediction?.probability != null ? `${prediction.probability.toFixed(1)}%` : '0%', color: '#ff8c00' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card-sm" style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '24px', fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
