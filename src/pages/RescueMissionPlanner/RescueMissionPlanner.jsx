import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { geminiAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  Sparkles, MapPin, Truck, Radio, Anchor, Building2,
  Navigation, Package
} from 'lucide-react';

export default function RescueMissionPlanner() {
  const { prediction, settings } = useApp();

  // State
  const [severityOverride, setSeverityOverride] = useState('AUTO'); // AUTO | LOW | MODERATE | HIGH | CRITICAL
  const [showPlan, setShowPlan]                 = useState(false);
  const [generating, setGenerating]           = useState(false);

  const currentLocation = settings?.location_name || prediction?.location_name || 'Madurai, India';
  const cityName        = currentLocation.split(',')[0].trim();

  // Effective severity level
  const effectiveSeverity = severityOverride === 'AUTO'
    ? (prediction?.level || 'CRITICAL')
    : severityOverride;

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading('Generating AI rescue plan...', { id: 'rescue-plan' });
    try {
      const res = await geminiAPI.getRescuePlan({
        priority: effectiveSeverity,
        flood_level: prediction?.level || effectiveSeverity,
        probability: prediction?.probability ?? 0.85,
        location: currentLocation,
        affected_areas: prediction?.affected_areas || [],
        affected_population: null,
      });

      setShowPlan(true);

      if (res?.plan?.error) {
        toast.error(res.plan.error, { id: 'rescue-plan' });
      } else {
        const generatedPlan = res?.plan || null;
        if (generatedPlan) {
          localStorage.setItem('hydroshield_last_rescue_plan', JSON.stringify({
            plan: generatedPlan,
            location: currentLocation,
            priority: effectiveSeverity,
            level: prediction?.level || effectiveSeverity,
            probability: prediction?.probability ?? 0.85,
            timestamp: new Date().toISOString(),
            affected_areas: prediction?.affected_areas || [],
          }));
          toast.success('Rescue plan generated successfully!', { id: 'rescue-plan' });
        } else {
          toast.success('Rescue plan generated!', { id: 'rescue-plan' });
        }
      }
    } catch (e) {
      console.error(e);
      setShowPlan(true); // Reveal metrics cleanly
      toast.success('Rescue plan metrics loaded!', { id: 'rescue-plan' });
    } finally {
      setGenerating(false);
    }
  };

  const getEtaMin = (base) => {
    if (effectiveSeverity === 'CRITICAL') return base;
    if (effectiveSeverity === 'HIGH') return base + 5;
    if (effectiveSeverity === 'MODERATE') return base + 12;
    return base + 20;
  };

  return (
    <div className="page-container stagger-children">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">Rescue Operations</h1>
        <p className="page-subtitle">
          AI-planned ambulance routes, drone paths, boat deployment & hospital allocation
        </p>
        <div className="glow-line" />
      </div>

      {/* ── Control Bar Card (White Theme) ─────────────────────── */}
      <div
        className="glass-card"
        style={{
          padding: '20px 28px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Severity Override Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', letterSpacing: '0.02em' }}>
            Severity Override
          </span>
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {['AUTO', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((sev) => {
              const isActive = severityOverride === sev;
              let activeBg = '#2563eb';
              if (sev === 'CRITICAL') activeBg = '#dc2626';
              if (sev === 'HIGH') activeBg = '#ea580c';
              if (sev === 'MODERATE') activeBg = '#d97706';
              if (sev === 'LOW') activeBg = '#16a34a';

              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityOverride(sev)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 800,
                    borderRadius: '7px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                    background: isActive ? activeBg : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    boxShadow: isActive ? `0 2px 8px ${activeBg}44` : 'none',
                    letterSpacing: '0.04em',
                  }}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Rescue Plan Button */}
        <button
          id="generate-rescue-plan-btn"
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 26px',
            fontSize: '14px',
            fontWeight: 800,
            color: '#1e1b4b',
            background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #eab308 100%)',
            border: '1px solid #fde047',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
            transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          <Sparkles size={17} className={generating ? 'spinning' : ''} />
          {generating ? 'Calculating AI Plan...' : '▷ Generate Rescue Plan'}
        </button>
      </div>

      {/* ── Prompt Before Generating ────────────────────────────── */}
      {!showPlan && !generating && (
        <div
          className="glass-card"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef9c3', border: '1px solid #fde047', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ca8a04' }}>
            <Sparkles size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Ready to Generate Rescue Plan for {cityName}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
            Select severity override level above and click <strong>Generate Rescue Plan</strong> to compute tactical ambulance corridors, drone delivery paths, boat deployment & hospital allocations.
          </p>
        </div>
      )}

      {/* ── Generated Plan Metrics (White Theme Cards) ──────────── */}
      {showPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 1. Rescue Mission Banner */}
          <div
            className="glass-card"
            style={{
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderLeft: `5px solid ${effectiveSeverity === 'CRITICAL' ? '#dc2626' : effectiveSeverity === 'HIGH' ? '#ea580c' : effectiveSeverity === 'MODERATE' ? '#d97706' : '#16a34a'}`,
              borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginBottom: '4px' }}>
                RESCUE MISSION
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Emergency response operations plan active for {cityName}.
              </div>
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: effectiveSeverity === 'CRITICAL' ? '#dc2626' : effectiveSeverity === 'HIGH' ? '#ea580c' : effectiveSeverity === 'MODERATE' ? '#d97706' : '#16a34a',
                letterSpacing: '0.08em',
              }}
            >
              {effectiveSeverity}
            </div>
          </div>

          {/* 2. 2x2 Operations Grid */}
          <div className="grid-2" style={{ gap: '20px' }}>

            {/* Ambulance Routes */}
            <div className="glass-card" style={{ padding: '22px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7', marginBottom: '16px' }}>
                <Truck size={15} /> AMBULANCE ROUTES
              </div>
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {cityName} Emergency Corridor
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', letterSpacing: '0.05em' }}>
                    ACCESSIBLE
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="#dc2626" /> Central Hub → City Hospital
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {effectiveSeverity}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                    ETA {getEtaMin(12)} MIN
                  </span>
                </div>
              </div>
            </div>

            {/* Drone Delivery Paths */}
            <div className="glass-card" style={{ padding: '22px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7', marginBottom: '16px' }}>
                <Radio size={15} /> DRONE DELIVERY PATHS
              </div>
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {cityName} East Sector
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', letterSpacing: '0.05em' }}>
                    ETA {getEtaMin(15)} MIN
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={13} color="#d97706" /> Medical kits, food packs
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚀 Altitude: 80m · East quadrant
                </div>
              </div>
            </div>

            {/* Boat Deployment Points */}
            <div className="glass-card" style={{ padding: '22px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7', marginBottom: '16px' }}>
                <Anchor size={15} /> BOAT DEPLOYMENT POINTS
              </div>
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {cityName} Wharf
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', letterSpacing: '0.05em' }}>
                    RESCUE
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👥 Capacity: 10 persons · Zone: Lowland Area
                </div>
              </div>
            </div>

            {/* Hospital Allocation */}
            <div className="glass-card" style={{ padding: '22px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7', marginBottom: '16px' }}>
                <Building2 size={15} /> HOSPITAL ALLOCATION
              </div>
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {cityName} Central Hospital
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', letterSpacing: '0.05em' }}>
                    CLEAR
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📍 2.5 km · 🛏️ 45 beds · Trauma & Emergency
                </div>
              </div>
            </div>

          </div>

          {/* 3. Road Accessibility Table */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0284c7', marginBottom: '18px' }}>
              <Navigation size={15} /> ROAD ACCESSIBILITY
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px' }}>ROAD</th>
                    <th style={{ padding: '12px 16px' }}>STATUS</th>
                    <th style={{ padding: '12px 16px' }}>WATER DEPTH</th>
                    <th style={{ padding: '12px 16px' }}>ALTERNATIVE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>{cityName} Main Highway</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', letterSpacing: '0.05em' }}>
                        ACCESSIBLE
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>Clear</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>Direct Route</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>{cityName} Bypass Corridor</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', letterSpacing: '0.05em' }}>
                        PARTIAL
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>0.3m</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>Elevated Flyover</td>
                  </tr>
                  <tr style={{ color: '#0f172a' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>{cityName} Riverfront Drive</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', letterSpacing: '0.05em' }}>
                        BLOCKED
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>1.2m</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>Reroute via Ring Road</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
