import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Thermometer, Droplets, Wind, CloudRain, MapPin,
  AlertTriangle, Activity, Waves, TrendingUp, Shield
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis
} from 'recharts';
import './Dashboard.css';

/** Map OpenWeather condition description → emoji */
function getWeatherIcon(condition) {
  if (!condition) return '🌡️';
  const c = condition.toLowerCase();
  if (c.includes('thunder'))                        return '⛈️';
  if (c.includes('drizzle') || c.includes('mist')) return '🌦️';
  if (c.includes('heavy rain') || c.includes('extreme rain')) return '🌧️';
  if (c.includes('rain'))                           return '🌧️';
  if (c.includes('snow') || c.includes('sleet'))   return '❄️';
  if (c.includes('fog') || c.includes('haze'))     return '🌫️';
  if (c.includes('overcast'))                       return '☁️';
  if (c.includes('broken clouds') || c.includes('scattered clouds')) return '⛅';
  if (c.includes('few clouds') || c.includes('partly'))              return '🌤️';
  if (c.includes('clear'))                          return '☀️';
  return '🌡️';
}


function StatusBadge({ level }) {
  const map = {
    SAFE:     { cls: 'badge-safe',     dot: 'green'  },
    LOW:      { cls: 'badge-low',      dot: 'yellow' },
    MODERATE: { cls: 'badge-moderate', dot: 'orange' },
    HIGH:     { cls: 'badge-high',     dot: 'red'    },
  };
  const s = map[level] || map.SAFE;
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`pulse-dot ${s.dot}`} />
      {level}
    </span>
  );
}

function GaugeMeter({ value, max = 100, color = '#00d4ff', label }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = 74;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <div className="gauge-container">
      <svg viewBox="0 0 200 108" style={{ width: '100%', maxHeight: '125px', overflow: 'visible' }}>
        {/* Background Arc */}
        <path
          d="M 26 88 A 74 74 0 0 1 174 88"
          fill="none"
          stroke="rgba(0, 0, 0, 0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d="M 26 88 A 74 74 0 0 1 174 88"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s' }}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-value" style={{ color }}>
          {value.toFixed(1)}<span className="gauge-pct">%</span>
        </span>
        <span className="gauge-label">
          FLOOD<br />PROBABILITY
        </span>
      </div>
    </div>
  );
}

function WeatherMetric({ icon: Icon, label, value, unit, color = 'var(--cyan)' }) {
  return (
    <div className="weather-metric glass-card-sm">
      <div className="weather-metric-icon" style={{ color }}>
        <Icon size={18} />
      </div>
      <div className="weather-metric-body">
        <span className="weather-metric-label">{label}</span>
        <span className="weather-metric-value">
          {value ?? '—'}<span className="metric-unit">{unit}</span>
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { weather, prediction, loadingWeather, loadingPrediction, weatherError } = useApp();

  const level = prediction?.level || prediction?.severity || 'SAFE';
  const prob  = prediction?.probability ?? 0;

  const gaugeColor = {
    SAFE: '#16a34a', LOW: '#ca8a04', MODERATE: '#ea580c', HIGH: '#dc2626'
  }[level] || '#0284c7';

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Flood Management Command Center</h1>
        <p className="page-subtitle">Real-time AI-powered hydrological intelligence system</p>
        <div className="glow-line" />
      </div>

      <div className={`status-banner status-banner-${level.toLowerCase()} glass-card`}>
        <div className="status-banner-left">
          <div className="status-banner-icon">
            <Shield size={28} />
          </div>
          <div>
            <div className="status-banner-title">CURRENT FLOOD STATUS</div>
            <StatusBadge level={level} />
          </div>
        </div>
        <div className="status-banner-right">
          <Activity size={16} />
          <span>System Operational · Auto-refresh every 30s</span>
        </div>
      </div>

      <div className="dashboard-grid stagger-children">
        <div className="glass-card dashboard-card weather-card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><CloudRain size={16} /></div>
              Live Weather
            </div>
            {loadingWeather && <div className="spinner" />}
          </div>

          {weatherError ? (
            <div className="error-state"><AlertTriangle size={16} /> {weatherError}</div>
          ) : (
            <>
              <div className="weather-condition-display">
                <span className="weather-condition-icon">{getWeatherIcon(weather?.condition)}</span>
                <div>
                  <div className="weather-temp">
                    {weather?.temperature ?? '—'}<span className="weather-temp-unit">°C</span>
                  </div>
                </div>
              </div>
              <div className="weather-metrics-grid">
                <WeatherMetric icon={CloudRain}  label="Rainfall"   value={weather?.precipitation}     unit=" mm"  color="#00d4ff" />
                <WeatherMetric icon={Droplets}   label="Humidity"   value={weather?.humidity}           unit="%"    color="#7b4fff" />
                <WeatherMetric icon={Wind}       label="Wind Speed" value={weather?.wind_speed}         unit=" km/h" color="#00ff88" />
                <WeatherMetric icon={Thermometer} label="Feels Like" value={weather?.apparent_temperature} unit="°C" color="#ff8c00" />
              </div>
            </>
          )}
        </div>

        <div className="glass-card dashboard-card prediction-card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Waves size={16} /></div>
              Flood Prediction
            </div>
            {loadingPrediction && <div className="spinner" />}
          </div>

          <GaugeMeter value={prob} color={gaugeColor} label="Flood Probability" />

          <div className="prediction-metrics">
            <div className="prediction-row">
              <span className="data-row-label"><TrendingUp size={14} /> Severity</span>
              <StatusBadge level={level} />
            </div>
            <div className="prediction-row">
              <span className="data-row-label"><Waves size={14} /> Est. Water Depth</span>
              <span className="mono" style={{ color: gaugeColor }}>
                {prediction?.estimated_water_depth ?? '—'} m
              </span>
            </div>
            <div className="prediction-row">
              <span className="data-row-label"><Activity size={14} /> Confidence</span>
              <span className="mono" style={{ color: 'var(--cyan)' }}>
                {prediction?.confidence ?? '—'}%
              </span>
            </div>
            <div className="prediction-row">
              <span className="data-row-label"><Droplets size={14} /> River Level</span>
              <span className="mono" style={{ color: 'var(--cyan)' }}>
                {prediction?.river_level ?? '—'} m
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card dashboard-card areas-card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><MapPin size={16} /></div>
              Affected Zones
            </div>
            <StatusBadge level={level} />
          </div>
          {(!prediction?.affected_areas || prediction.affected_areas.length === 0) ? (
            <div className="no-areas">
              <Shield size={32} color="var(--status-safe)" />
              <p>No flood-prone areas detected</p>
            </div>
          ) : (
            <div className="area-list">
              {prediction.affected_areas.map((area, i) => (
                <div key={i} className="area-item">
                  <span className="area-item-dot" />
                  {area}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
            <Droplets size={20} />
          </div>
          <div className="stat-mini-body">
            <span className="stat-mini-value">{weather?.recent_rainfall_6h ?? '—'}</span>
            <span className="stat-mini-label">6h Rainfall (mm)</span>
          </div>
        </div>

        <div className="glass-card stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'rgba(0,102,255,0.1)', color: '#0066ff' }}>
            <Wind size={20} />
          </div>
          <div className="stat-mini-body">
            <span className="stat-mini-value">{weather?.wind_direction ?? '—'}°</span>
            <span className="stat-mini-label">Wind Direction</span>
          </div>
        </div>

        <div className="glass-card stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'rgba(123,79,255,0.1)', color: '#7b4fff' }}>
            <Activity size={20} />
          </div>
          <div className="stat-mini-body">
            <span className="stat-mini-value">{prediction?.soil_moisture ?? '—'}%</span>
            <span className="stat-mini-label">Soil Moisture</span>
          </div>
        </div>

        <div className="glass-card stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'rgba(255,140,0,0.1)', color: '#ff8c00' }}>
            <Waves size={20} />
          </div>
          <div className="stat-mini-body">
            <span className="stat-mini-value">{prediction?.river_level ?? '—'} m</span>
            <span className="stat-mini-label">River Level</span>
          </div>
        </div>

      </div>
    </div>
  );
}
