import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  MapPin, Compass, Navigation, Layers, Shield,
  CloudRain, Waves, Activity, RefreshCw, CheckCircle, AlertTriangle
} from 'lucide-react';

const INDIA_CITIES = [
  { name: 'Bengaluru, India',  lat: 12.9716, lng: 77.5946, level: 'SAFE',     prob: 10.9, rain: '0 mm', river: '2.1m' },
  { name: 'Chennai, India',    lat: 13.0827, lng: 80.2707, level: 'MODERATE', prob: 48.5, rain: '14 mm', river: '4.8m' },
  { name: 'Madurai, India',    lat: 9.9252,  lng: 78.1198, level: 'LOW',      prob: 22.0, rain: '3 mm',  river: '2.9m' },
  { name: 'Coimbatore, India', lat: 11.0168, lng: 76.9558, level: 'SAFE',     prob: 12.4, rain: '0 mm', river: '1.8m' },
  { name: 'Salem, India',      lat: 11.6643, lng: 78.1460, level: 'SAFE',     prob: 8.2,  rain: '0 mm', river: '1.5m' },
  { name: 'Anantapur, India',  lat: 14.6819, lng: 77.6006, level: 'SAFE',     prob: 5.0,  rain: '0 mm', river: '1.2m' },
  { name: 'Hyderabad, India',  lat: 17.3850, lng: 78.4867, level: 'MODERATE', prob: 52.0, rain: '18 mm', river: '5.2m' },
  { name: 'Trivandram, India', lat: 8.5241,  lng: 76.9366, level: 'HIGH',     prob: 78.0, rain: '42 mm', river: '7.6m' },
  { name: 'Mumbai, India',     lat: 19.0760, lng: 72.8777, level: 'HIGH',     prob: 82.5, rain: '55 mm', river: '8.4m' },
  { name: 'Kolkata, India',    lat: 22.5726, lng: 88.3639, level: 'MODERATE', prob: 61.0, rain: '24 mm', river: '6.1m' },
  { name: 'Delhi, India',      lat: 28.6139, lng: 77.2090, level: 'LOW',      prob: 28.0, rain: '5 mm',  river: '3.4m' },
];

export default function MapPage() {
  const { settings, prediction, setSettings, loadSettings } = useApp();

  // Active City and Coordinates
  const initialLat = settings?.latitude || 12.9716;
  const initialLng = settings?.longitude || 77.5946;
  const initialName = settings?.location_name || 'Bengaluru, India';

  const [activeLat, setActiveLat]   = useState(initialLat);
  const [activeLng, setActiveLng]   = useState(initialLng);
  const [activeCity, setActiveCity] = useState(initialName);
  const [zoomLevel, setZoomLevel]   = useState(11);
  const [selectedFilter, setFilter] = useState('ALL');

  // Update active coordinates when settings change
  useEffect(() => {
    if (settings?.latitude && settings?.longitude) {
      setActiveLat(settings.latitude);
      setActiveLng(settings.longitude);
      if (settings.location_name) setActiveCity(settings.location_name);
    }
  }, [settings]);

  // Color mapping helper: LOW (Green), MEDIUM (Orange), HIGH (Red)
  const getRiskColor = (lvl) => {
    const norm = (lvl || '').toUpperCase();
    if (norm === 'HIGH' || norm === 'CRITICAL') return { color: '#dc2626', bg: '#fef2f2', border: '#dc2626', label: 'HIGH' };
    if (norm === 'MEDIUM' || norm === 'MODERATE') return { color: '#ea580c', bg: '#fff7ed', border: '#ea580c', label: 'MEDIUM' };
    return { color: '#16a34a', bg: '#f0fdf4', border: '#16a34a', label: 'LOW' };
  };

  const handleSelectCity = (city) => {
    setActiveCity(city.name);
    setActiveLat(city.lat);
    setActiveLng(city.lng);
    setZoomLevel(11);
  };

  const handleFilterChange = (lvl) => {
    setFilter(lvl);
    if (lvl !== 'ALL') {
      const firstMatch = INDIA_CITIES.find(c => getRiskColor(c.level).label === lvl);
      if (firstMatch) {
        handleSelectCity(firstMatch);
      }
    }
  };

  const resetToIndiaView = () => {
    setActiveCity('India Overview');
    setActiveLat(20.5937);
    setActiveLng(78.9629);
    setZoomLevel(5);
  };

  const handleSetActiveLocation = async (city) => {
    try {
      const updated = {
        location_name: city.name,
        latitude: city.lat,
        longitude: city.lng,
        refresh_interval_seconds: settings?.refresh_interval_seconds || 30,
      };
      await settingsAPI.update(updated);
      setSettings(updated);
      await loadSettings();
      toast.success(`Active location updated to ${city.name}!`);
    } catch (e) {
      toast.error(`Failed to set location: ${e.message}`);
    }
  };

  const filteredCities = INDIA_CITIES.filter(c => {
    if (selectedFilter === 'ALL') return true;
    const r = getRiskColor(c.level).label;
    return r === selectedFilter;
  });

  // Calculate current risk for active location
  const currentRisk = getRiskColor(
    INDIA_CITIES.find(c => c.name === activeCity)?.level || prediction?.level || 'LOW'
  );

  return (
    <div className="page-container stagger-children">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">India Risk & Flood Telemetry Map</h1>
          <p className="page-subtitle">Geographical monitoring with latitude/longitude coordinate zoom and risk classification</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={resetToIndiaView}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Compass size={15} /> Reset India View
          </button>
        </div>
      </div>
      <div className="glow-line" />

      {/* Risk Filter & Active Target Banner */}
      <div className="glass-card" style={{ padding: '18px 24px', marginBottom: '20px', borderLeft: `5px solid ${currentRisk.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Risk Level Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Filter:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => {
              const active = selectedFilter === lvl;
              const lvlColor = lvl === 'HIGH' ? '#dc2626' : lvl === 'MEDIUM' ? '#ea580c' : lvl === 'LOW' ? '#16a34a' : 'var(--cyan)';
              return (
                <button
                  key={lvl}
                  type="button"
                  className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleFilterChange(lvl)}
                  style={{
                    padding: '4px 14px',
                    fontSize: '12px',
                    borderRadius: '100px',
                    borderColor: active ? lvlColor : undefined,
                    backgroundColor: active ? lvlColor : undefined,
                    color: active ? '#ffffff' : undefined,
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Active Target Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Location</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {activeCity}
              </div>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: '100px',
              background: currentRisk.bg, border: `2px solid ${currentRisk.color}`,
              color: currentRisk.color, fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentRisk.color, boxShadow: `0 0 8px ${currentRisk.color}` }} />
              {currentRisk.label} RISK
            </div>
          </div>
        </div>

        {/* Quick Select City Chips */}
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {INDIA_CITIES.map(city => {
            const isSelected = activeCity === city.name;
            const r = getRiskColor(city.level);

            return (
              <button
                key={city.name}
                type="button"
                className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleSelectCity(city)}
                style={{
                  padding: '6px 14px', fontSize: '12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px',
                  border: `2px solid ${r.color}`,
                  background: isSelected ? `${r.color}22` : '#ffffff',
                  color: isSelected ? r.color : '#334155',
                  fontWeight: isSelected ? 700 : 600,
                  boxShadow: isSelected ? `0 0 10px ${r.color}44` : 'none',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color }} />
                {city.name.split(',')[0]} ({city.prob}%)
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Frame with City Border Line & Dynamic Color Glow */}
      <div
        className="glass-card"
        style={{
          padding: '14px',
          marginBottom: '24px',
          borderRadius: '18px',
          position: 'relative',
          border: `3px solid ${currentRisk.color}`,
          boxShadow: `0 0 24px ${currentRisk.color}33, 0 4px 20px rgba(0,0,0,0.06)`,
          background: '#ffffff',
          transition: 'border 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px', marginBottom: '10px',
            background: currentRisk.bg, borderRadius: '10px', border: `1px solid ${currentRisk.color}44`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: currentRisk.color }}>
            <MapPin size={18} color={currentRisk.color} />
            <span>Active City Bounds: <b>{activeCity}</b> ({activeLat.toFixed(4)}° N, {activeLng.toFixed(4)}° E)</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setZoomLevel(prev => Math.min(prev + 2, 16))}
              style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}
            >
              Zoom In (+)
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setZoomLevel(prev => Math.max(prev - 2, 5))}
              style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}
            >
              Zoom Out (-)
            </button>
          </div>
        </div>

        <iframe
          key={`${activeLat}-${activeLng}-${zoomLevel}`}
          title="India Flood Risk Map"
          width="100%"
          height="530"
          style={{ border: 0, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${activeLat},${activeLng}&z=${zoomLevel}&output=embed`}
        />
      </div>

      {/* Indian Regional Telemetry Grid */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">
            <div className="card-icon-wrapper"><Layers size={16} /></div>
            Indian Flood Risk Telemetry Hubs ({filteredCities.length})
          </div>
        </div>

        <div className="grid-3" style={{ gap: '16px' }}>
          {filteredCities.map(city => {
            const r = getRiskColor(city.level);
            const isCurrentSettings = settings?.location_name === city.name;
            const isSelected = activeCity === city.name;

            return (
              <div
                key={city.name}
                className="glass-card-sm"
                style={{
                  padding: '0',
                  borderRadius: '14px',
                  border: `2.5px solid ${r.color}`,
                  boxShadow: isSelected ? `0 0 18px ${r.color}55` : `0 2px 8px ${r.color}22`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* Colored Header Strip */}
                <div style={{
                  background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)`,
                  padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.03em' }}>
                    {city.name.split(',')[0]}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.25)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {r.label} · {city.prob}%
                  </span>
                </div>

                {/* Body with tinted background */}
                <div style={{ background: r.bg, padding: '14px 16px', flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CloudRain size={13} color={r.color} /> Rainfall: <b style={{ color: '#0f172a' }}>{city.rain}</b>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Waves size={13} color={r.color} /> River Level: <b style={{ color: '#0f172a' }}>{city.river}</b>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color={r.color} /> <b style={{ color: '#475569' }}>{city.lat.toFixed(4)}°, {city.lng.toFixed(4)}°</b>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '0', borderTop: `1px solid ${r.color}33`, background: '#ffffff' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleSelectCity(city)}
                    style={{
                      flex: 1, padding: '9px 6px', fontSize: '12px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      borderRight: `1px solid ${r.color}22`, borderRadius: '0',
                      color: r.color,
                    }}
                  >
                    <Navigation size={13} /> Zoom Map
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleSetActiveLocation(city)}
                    disabled={isCurrentSettings}
                    style={{
                      flex: 1, padding: '9px 6px', fontSize: '12px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      borderRadius: '0',
                      color: isCurrentSettings ? '#16a34a' : r.color,
                      background: isCurrentSettings ? '#f0fdf4' : 'transparent',
                    }}
                  >
                    {isCurrentSettings ? <CheckCircle size={13} color="#16a34a" /> : <MapPin size={13} />}
                    {isCurrentSettings ? 'Active' : 'Set Active'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
