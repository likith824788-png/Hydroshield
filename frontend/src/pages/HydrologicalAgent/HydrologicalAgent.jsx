import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplets, Thermometer, Wind, CloudRain, Activity,
  Waves, Layers, Clock
} from 'lucide-react';

function DataRow({ icon: Icon, label, value, unit, color = 'var(--cyan)' }) {
  return (
    <div className="data-row">
      <div className="data-row-label">
        <div className="data-row-icon" style={{ color }}>
          <Icon size={16} />
        </div>
        {label}
      </div>
      <span className="data-row-value mono" style={{ color }}>
        {value ?? '—'} {unit}
      </span>
    </div>
  );
}

export default function HydrologicalAgent() {
  const { weather, prediction, loadingWeather } = useApp();
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">Hydrological Telemetry Agent</h1>
        <p className="page-subtitle">Real-time sensor data from weather and hydrological monitoring network</p>
        <div className="glow-line" />
      </div>

      <div className="grid-2">
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><CloudRain size={16} /></div>
              Weather Status
            </div>
            <span className="badge badge-active">
              <span className="pulse-dot green" />
              ACTIVE
            </span>
          </div>

          <DataRow icon={CloudRain}   label="Rainfall"       value={weather?.precipitation}      unit="mm"   color="#00d4ff" />
          <DataRow icon={Droplets}    label="Humidity"       value={weather?.humidity}           unit="%"    color="#7b4fff" />
          <DataRow icon={Thermometer} label="Temperature"    value={weather?.temperature}        unit="°C"   color="#ff8c00" />
          <DataRow icon={Wind}        label="Wind Speed"     value={weather?.wind_speed}         unit="km/h" color="#00ff88" />
          <DataRow icon={Wind}        label="Wind Direction" value={weather?.wind_direction}     unit="°"    color="#00ff88" />
          <DataRow icon={Thermometer} label="Feels Like"     value={weather?.apparent_temperature} unit="°C" color="#ffd700" />

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>Last Updated: {loadingWeather ? 'Updating...' : now}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Waves size={16} /></div>
              Hydrological Sensors
            </div>
            <span className="badge badge-active">
              <span className="pulse-dot green" />
              ACTIVE
            </span>
          </div>

          <DataRow icon={Waves}    label="River Level"        value={prediction?.river_level}   unit="m"   color="#00d4ff" />
          <DataRow icon={Layers}   label="Soil Moisture"      value={prediction?.soil_moisture} unit="%"   color="#7b4fff" />
          <DataRow icon={Droplets} label="6h Cumul. Rainfall" value={weather?.recent_rainfall_6h} unit="mm" color="#00ff88" />
          <DataRow icon={Activity} label="Flood Probability"  value={prediction?.probability}   unit="%"   color="#ff8c00" />

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>River Level Indicator</span>
              <span className="mono">{prediction?.river_level ?? 0}/12 m</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${(prediction?.river_level ?? 0) > 8 ? 'danger' : (prediction?.river_level ?? 0) > 5 ? 'warning' : ''}`}
                style={{ width: `${Math.min(((prediction?.river_level ?? 0) / 12) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Soil Saturation</span>
              <span className="mono">{prediction?.soil_moisture ?? 0}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${prediction?.soil_moisture ?? 0}%` }}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>Last Updated: {loadingWeather ? 'Updating...' : now}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Activity size={16} /></div>
              Agent Performance Metrics
            </div>
          </div>
          <div className="grid-4">
            {[
              { label: 'Temperature', value: weather?.temperature != null ? `${weather.temperature}°C` : '—', color: '#ff8c00' },
              { label: 'Humidity', value: weather?.humidity != null ? `${weather.humidity}%` : '—', color: '#7b4fff' },
              { label: 'Wind Speed', value: weather?.wind_speed != null ? `${weather.wind_speed} km/h` : '—', color: '#00ff88' },
              { label: 'Rainfall (1h)', value: weather?.precipitation != null ? `${weather.precipitation} mm` : '—', color: '#00d4ff' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card-sm" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '28px', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
