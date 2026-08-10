import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Waves, Grid2x2, Droplets, AlertTriangle } from 'lucide-react';

// ─── Flood Grid Generator ─────────────────────────────────────────────────────
function generateFloodGrid(affectedAreaPct, rows = 40, cols = 40) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const riverCenter = 4 + Math.sin(r / 3.5) * 6 + r * 0.55;
      const distFromRiver = Math.abs(c - riverCenter);
      const floodThreshold = (affectedAreaPct / 100) * 8;

      let depth = 'dry';
      if (distFromRiver < floodThreshold * 0.28) depth = 'deep';
      else if (distFromRiver < floodThreshold * 0.55) depth = 'moderate';
      else if (distFromRiver < floodThreshold) depth = 'shallow';

      cells.push({ r, c, depth });
    }
  }
  return cells;
}

const DEPTH_COLOR = {
  deep:     'rgba(29, 78, 216, 0.90)',
  moderate: 'rgba(59, 130, 246, 0.70)',
  shallow:  'rgba(147, 197, 253, 0.55)',
  dry:      'transparent',
};

const CELL_SIZE = 13;

// ─── Flood Grid (White Theme) ─────────────────────────────────────────────────
function FloodGridWithCity({ affectedAreaPct, cityName, riverLevel, level }) {
  const rows = 40, cols = 40;
  const cells = useMemo(() => generateFloodGrid(affectedAreaPct, rows, cols), [affectedAreaPct]);
  const W = cols * CELL_SIZE;
  const H = rows * CELL_SIZE;

  const levelColor = {
    SAFE: '#16a34a', LOW: '#ca8a04', MODERATE: '#ea580c', HIGH: '#dc2626', CRITICAL: '#b91c1c',
  }[level] || '#16a34a';

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {/* Sub-header */}
      <div
        style={{
          padding: '10px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <Waves size={13} color="#0284c7" />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
          2D Urban Inundation Raster — {cityName}
        </span>
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          Grid: {rows}×{cols} cells · River Stage: {parseFloat(riverLevel).toFixed(2)}m · Risk:{' '}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 800, color: levelColor }}>
          {level}
        </span>
      </div>

      {/* SVG Grid */}
      <div style={{ overflow: 'auto', background: '#f0f9ff', position: 'relative' }}>
        {/* Sector A label */}
        <div style={{
          position: 'absolute', top: '8px', left: '10px',
          fontSize: '9px', fontWeight: 800, color: '#94a3b8',
          letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 2,
          background: 'rgba(240,249,255,0.85)', padding: '2px 7px', borderRadius: '4px',
          border: '1px solid #e2e8f0',
        }}>
          SECTOR A (NORTH)
        </div>
        {/* Sector B label */}
        <div style={{
          position: 'absolute', bottom: '8px', right: '10px',
          fontSize: '9px', fontWeight: 800, color: '#94a3b8',
          letterSpacing: '0.1em', textTransform: 'uppercase', zIndex: 2,
          background: 'rgba(240,249,255,0.85)', padding: '2px 7px', borderRadius: '4px',
          border: '1px solid #e2e8f0',
        }}>
          SECTOR B (LOWLAND)
        </div>

        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        >
          {/* Background */}
          <rect width={W} height={H} fill="#f0f9ff" />

          {/* Grid lines */}
          {Array.from({ length: rows + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * CELL_SIZE} x2={W} y2={i * CELL_SIZE} stroke="#e0f2fe" strokeWidth={0.5} />
          ))}
          {Array.from({ length: cols + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={H} stroke="#e0f2fe" strokeWidth={0.5} />
          ))}

          {/* Flood cells */}
          {cells.map(({ r, c, depth }) => {
            if (depth === 'dry') return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * CELL_SIZE + 0.5}
                y={r * CELL_SIZE + 0.5}
                width={CELL_SIZE - 1}
                height={CELL_SIZE - 1}
                fill={DEPTH_COLOR[depth]}
                rx={1.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        padding: '10px 16px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        flexWrap: 'wrap',
      }}>
        {[
          { color: '#e0f2fe', border: '#bae6fd', label: 'Dry Ground' },
          { color: 'rgba(147,197,253,0.6)', border: '#93c5fd88', label: 'Shallow (<0.4m)' },
          { color: 'rgba(59,130,246,0.75)', border: '#3b82f688', label: 'Moderate (0.4-1.0m)' },
          { color: 'rgba(29,78,216,0.9)',   border: '#1d4ed888', label: 'Deep (>1.0m)' },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '13px', height: '13px', background: color, borderRadius: '3px', border: `1px solid ${border}` }} />
            <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UrbanHydrodynamicAgent() {
  const { prediction, settings } = useApp();

  const level    = prediction?.level || 'SAFE';
  const prob     = prediction?.probability ?? 0;
  const cityName = (settings?.location_name || prediction?.location_name || 'Madurai, India').split(',')[0].trim();

  const affectedAreaPct = useMemo(() => {
    if (prediction?.affected_area_pct != null) return prediction.affected_area_pct;
    return Math.min(prob * 0.65, 85);
  }, [prediction, prob]);

  const ROWS = 40, COLS = 40;
  const TOTAL_CELLS = ROWS * COLS;
  const cells = useMemo(() => generateFloodGrid(affectedAreaPct, ROWS, COLS), [affectedAreaPct]);
  const floodedCells = cells.filter(c => c.depth !== 'dry').length;
  const floodedPct   = ((floodedCells / TOTAL_CELLS) * 100).toFixed(1);

  const maxWaterDepth  = prediction?.max_water_depth_m ?? prediction?.estimated_water_depth ?? (affectedAreaPct / 35).toFixed(2);
  const meanFloodDepth = prediction?.mean_flood_depth_m ?? (maxWaterDepth * 0.45).toFixed(2);
  const confidence     = prediction?.confidence ?? 94;
  const riverLevel     = prediction?.river_level ?? 2.32;

  const levelColor = {
    SAFE: '#16a34a', LOW: '#ca8a04', MODERATE: '#ea580c', HIGH: '#dc2626', CRITICAL: '#b91c1c',
  }[level] || '#16a34a';

  const levelBg = {
    SAFE: '#f0fdf4', LOW: '#fefce8', MODERATE: '#fff7ed', HIGH: '#fef2f2', CRITICAL: '#fef2f2',
  }[level] || '#f0fdf4';

  const levelBorder = {
    SAFE: '#bbf7d0', LOW: '#fde68a', MODERATE: '#fed7aa', HIGH: '#fecaca', CRITICAL: '#fecaca',
  }[level] || '#bbf7d0';

  return (
    <div className="page-container stagger-children">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">Urban Hydrodynamic Agent</h1>
        <p className="page-subtitle">2D flood inundation raster simulation with AI-powered urban dynamics prediction</p>
        <div className="glow-line" />
      </div>

      {/* ── Main Layout: Map + Right Panel ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

        {/* LEFT: Inundation Map Card */}
        <div
          className="glass-card"
          style={{ padding: '0', overflow: 'hidden', background: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          {/* Card title row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}>
            <div className="card-icon-wrapper"><Grid2x2 size={15} /></div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Inundation Map
            </span>
          </div>

          <div style={{ padding: '16px', background: '#ffffff' }}>
            <FloodGridWithCity
              affectedAreaPct={affectedAreaPct}
              cityName={cityName}
              riverLevel={riverLevel}
              level={level}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Flood Severity Card */}
          <div
            className="glass-card"
            style={{
              padding: '24px',
              background: '#ffffff',
              border: `1px solid ${levelBorder}`,
              borderLeft: `5px solid ${levelColor}`,
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '10px' }}>
              FLOOD SEVERITY
            </div>
            <div style={{
              fontSize: '38px', fontWeight: 900,
              color: levelColor,
              letterSpacing: '0.06em', lineHeight: 1.1, marginBottom: '10px',
            }}>
              {level}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <span style={{ fontWeight: 700, color: levelColor }}>{floodedPct}%</span> of monitored grid inundated
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '14px', height: '6px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(parseFloat(floodedPct), 100)}%`,
                background: `linear-gradient(90deg, #93c5fd, ${levelColor})`,
                borderRadius: '100px',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>

          {/* Simulation Metrics Card */}
          <div
            className="glass-card"
            style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '18px' }}>
              Simulation Metrics
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Grid Dimensions',  value: `${ROWS} × ${COLS} cells`,                         bold: false, color: '#0f172a' },
                { label: 'Flooded Cells',    value: `${floodedCells} / ${TOTAL_CELLS}`,                bold: true,  color: '#0f172a' },
                { label: 'Max Water Depth',  value: `${parseFloat(maxWaterDepth).toFixed(2)} m`,        bold: true,  color: '#0f172a' },
                { label: 'Mean Flood Depth', value: `${parseFloat(meanFloodDepth).toFixed(2)} m`,       bold: false, color: '#0f172a' },
                { label: 'RF Risk Tier',     value: level,                                              bold: true,  color: levelColor },
                { label: 'RF Confidence',    value: `${confidence}%`,                                  bold: true,  color: '#16a34a' },
              ].map(({ label, value, bold, color }, i) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: bold ? 800 : 600, color }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* River Level Card */}
          <div
            className="glass-card"
            style={{
              padding: '18px 20px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: '#e0f2fe', border: '1px solid #bae6fd',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0284c7', flexShrink: 0,
            }}>
              <Droplets size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                River Stage
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0369a1' }}>
                {parseFloat(riverLevel).toFixed(2)} m
              </div>
            </div>
            {parseFloat(riverLevel) > 2.5 && (
              <div style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center',
                gap: '5px', fontSize: '11px', fontWeight: 800,
                color: '#ea580c', background: '#fff7ed',
                padding: '4px 10px', borderRadius: '20px', border: '1px solid #fed7aa',
              }}>
                <AlertTriangle size={13} /> ALERT
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
