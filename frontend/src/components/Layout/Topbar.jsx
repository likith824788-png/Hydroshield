import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Topbar.css';

const PAGE_TITLES = {
  '/':                   { title: 'Home Dashboard',           sub: 'Real-time Flood Intelligence' },
  '/hydrological-agent': { title: 'Hydrological Telemetry Agent', sub: 'Sensor & Weather Monitoring' },
  '/urban-agent':        { title: 'Urban Hydrodynamic Agent', sub: 'AI Flood Prediction Engine' },
  '/municipal-agent':    { title: 'Municipal Decision Agent', sub: 'Action Recommendation System' },
  '/civil-protection':   { title: 'Civil Protection Agent',  sub: 'Emergency Response Management' },
  '/citizen-sos':        { title: 'Citizen SOS',             sub: 'Emergency Report Portal' },
  '/rescue-planner':     { title: 'AI Rescue Mission Planner', sub: 'Resource Allocation & Routing' },
  '/agent-status':       { title: 'AI Agent Status',         sub: 'System Monitoring Dashboard' },
  '/mission-report':     { title: 'Mission Report',          sub: 'Operational Summary' },
  '/recent-updates':     { title: 'Recent Updates',          sub: 'Email Notification Log' },
  '/community-people':   { title: 'Community People',        sub: 'Civilian Email Management' },
  '/settings':           { title: 'Settings',                sub: 'System Configuration' },
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, refreshData, loadingWeather } = useApp();
  const [time, setTime] = useState(new Date());
  const [online, setOnline] = useState(navigator.onLine);

  const page = PAGE_TITLES[location.pathname] || { title: 'HydroShield', sub: '' };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span className="topbar-brand">HydroShield</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-page">{page.title}</span>
        </div>
        <p className="topbar-sub">{page.sub}</p>
      </div>

      <div className="topbar-right">
        <div className={`topbar-pill ${online ? 'online' : 'offline'}`}>
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{online ? 'Live' : 'Offline'}</span>
        </div>

        <div
          className="topbar-pill topbar-location-pill"
          onClick={() => navigate('/settings')}
          title="Click to configure location in Settings"
          style={{ cursor: 'pointer' }}
        >
          <MapPin size={12} color="#0284c7" />
          <span>{settings.location_name || 'Chennai, India'}</span>
        </div>

        <div className="topbar-clock">
          <Clock size={12} />
          <div className="clock-content">
            <span className="clock-time">{timeStr}</span>
            <span className="clock-date">{dateStr}</span>
          </div>
        </div>

        <button
          className={`topbar-refresh-btn ${loadingWeather ? 'spinning' : ''}`}
          onClick={refreshData}
          title="Refresh data"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </header>
  );
}
