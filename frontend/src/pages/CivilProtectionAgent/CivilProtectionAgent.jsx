import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { geminiAPI, broadcastAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  Shield, AlertTriangle, Users, Home, Heart, Radio,
  Brain, Send, Megaphone, CheckSquare, Square, MapPin, Building, X
} from 'lucide-react';

const PREDEFINED_MESSAGES = [
  '🚨 Evacuate immediately to the nearest shelter.',
  '⚠️ Flood warning issued. Move to higher ground now.',
  '🆘 Emergency shelter is open at the community center.',
  '🚗 Roads are blocked. Do not travel. Stay indoors.',
  '📻 Stay tuned to emergency broadcasts for updates.',
  '🏥 Medical assistance is available at the relief camp.',
  '💧 Do not drink tap water. Use only bottled or boiled water.',
  '🔔 Mandatory evacuation order issued for low-lying areas.',
];

const PRESET_CITIES = [
  'Bengaluru, India',
  'Madurai, India',
  'Coimbatore, India',
  'Salem, India',
  'Anantapur, India',
  'Hyderabad, India',
  'Trivandram, India',
  'Chennai, India',
];

function StatusRow({ icon: Icon, label, value, status, color }) {
  return (
    <div className="data-row" style={{ padding: '14px 0' }}>
      <div className="data-row-label">
        <div className="data-row-icon" style={{ color }}>
          <Icon size={16} />
        </div>
        {label}
      </div>
      <div style={{ display: 'flex', align: 'center', gap: '10px', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>{value}</span>
        {status && (
          <span className={`badge badge-${status.toLowerCase()}`} style={{ fontSize: '10px' }}>
            <span className={`pulse-dot ${{ ACTIVE:'green', STANDBY:'yellow', ALERT:'red', AVAILABLE:'green', FULL:'orange' }[status] || 'cyan'}`} />
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CivilProtectionAgent() {
  const { prediction, settings } = useApp();
  const { isAdmin } = useAuth();
  const level = prediction?.level || 'SAFE';

  const emergencyAlertStatus = level === 'HIGH' ? 'ALERT' : level === 'MODERATE' ? 'STANDBY' : 'ACTIVE';
  const evacuationStatus     = level === 'HIGH' ? 'IN PROGRESS' : 'STANDBY';

  // ── AI Recommendations (Box 1) ─────────────────────────────
  const [aiAdvice, setAiAdvice]           = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    setLoadingAdvice(true);

    geminiAPI.getCivilAdvice({
      flood_level:    level,
      location:       settings?.location_name || 'Unknown',
      probability:    prediction?.probability ?? 0,
      affected_areas: prediction?.affected_areas || [],
    }).then(res => {
      if (isMounted) setAiAdvice(res?.advice || 'No recommendations returned.');
    }).catch(err => {
      console.error(err);
      if (isMounted) setAiAdvice('1. Issue flood warning broadcasts.\n2. Deploy emergency units.\n3. Prepare relief shelters.');
    }).finally(() => {
      if (isMounted) setLoadingAdvice(false);
    });

    return () => { isMounted = false; };
  }, [isAdmin, level, settings?.location_name, prediction?.probability]);

  // Parse recommendation lines
  const adviceItems = aiAdvice
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // ── Multi-Selection State ──────────────────────────────────
  const [selectedAiIndices, setSelectedAiIndices]   = useState([]);
  const [selectedQuickMsgs, setSelectedQuickMsgs]   = useState([]);
  const [customMsg, setCustomMsg]                   = useState('');
  const [sending, setSending]                       = useState(false);

  // Target Selection Modal state
  const [showTargetModal, setShowTargetModal]       = useState(false);
  const [targetCity, setTargetCity]                 = useState(settings?.location_name || PRESET_CITIES[0]);
  const [targetLocality, setTargetLocality]         = useState('__ALL__');

  // Multi-select AI toggle
  const toggleAiIndex = (index) => {
    setSelectedAiIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllAi = () => {
    if (selectedAiIndices.length === adviceItems.length) {
      setSelectedAiIndices([]);
    } else {
      setSelectedAiIndices(adviceItems.map((_, i) => i));
    }
  };

  // Multi-select Quick Message toggle
  const toggleQuickMsg = (msg) => {
    setSelectedQuickMsgs(prev =>
      prev.includes(msg) ? prev.filter(m => m !== msg) : [...prev, msg]
    );
  };

  // Combine selected messages
  const selectedAdviceTexts = selectedAiIndices
    .map(idx => adviceItems[idx])
    .filter(Boolean);

  const combinedParts = [];
  if (selectedAdviceTexts.length > 0) combinedParts.push(...selectedAdviceTexts);
  if (selectedQuickMsgs.length > 0)   combinedParts.push(...selectedQuickMsgs);
  if (customMsg.trim())               combinedParts.push(customMsg.trim());

  const finalMessage = combinedParts.join('\n\n');

  // Load configured cities from localStorage
  const getCityList = () => {
    try {
      const saved = localStorage.getItem('hydroshield_community_cities');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRESET_CITIES;
  };

  const cityList = getCityList();

  // Load localities for a chosen city
  const getLocalitiesForCity = (city) => {
    try {
      const raw = localStorage.getItem('hydroshield_community');
      if (raw) {
        const community = JSON.parse(raw);
        if (community[city]) return Object.keys(community[city]);
      }
    } catch (e) {}
    return ['Locality 1', 'Locality 2', 'Locality 3', 'Locality 4', 'Locality 5'];
  };

  const currentCityLocalities = getLocalitiesForCity(targetCity);

  // Get recipient emails for selected target city and locality
  const getTargetEmails = (city, locality) => {
    try {
      const raw = localStorage.getItem('hydroshield_community');
      if (!raw) return [];
      const community = JSON.parse(raw);
      const cityData  = community[city] || {};

      if (locality === '__ALL__') {
        const emails = [];
        Object.values(cityData).forEach(locEmails => {
          (locEmails || []).forEach(e => { if (e) emails.push(e); });
        });
        return [...new Set(emails)];
      } else {
        const emails = cityData[locality] || [];
        return [...new Set(emails)];
      }
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const targetEmails = getTargetEmails(targetCity, targetLocality);

  const handleOpenTargetModal = () => {
    if (!finalMessage) {
      toast.error('Please select AI suggestions, quick messages, or type a custom message.');
      return;
    }
    setShowTargetModal(true);
  };

  const handleConfirmSendAlert = async () => {
    if (targetEmails.length === 0) {
      toast.error(`No civilian emails registered in ${targetLocality === '__ALL__' ? targetCity : `${targetLocality}, ${targetCity}`}.`);
      return;
    }

    setSending(true);
    toast.loading('Sending broadcast alert...', { id: 'broadcast' });
    try {
      const targetLabel = targetLocality === '__ALL__' ? targetCity : `${targetLocality}, ${targetCity}`;
      const res = await broadcastAPI.sendAlert({
        message:    finalMessage,
        recipients: targetEmails,
        location:   targetLabel,
      });
      toast.success(`Alert sent to ${res?.recipients_count ?? targetEmails.length} civilians in ${targetLabel}!`, { id: 'broadcast' });
      
      setShowTargetModal(false);
      setCustomMsg('');
      setSelectedQuickMsgs([]);
      setSelectedAiIndices([]);
    } catch (e) {
      toast.error(`Failed to send alert: ${e.message}`, { id: 'broadcast' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">Civil Protection Agent</h1>
        <p className="page-subtitle">Emergency response coordination, evacuation management and resource tracking</p>
        <div className="glow-line" />
      </div>

      {level === 'HIGH' && (
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', borderLeft: '3px solid var(--status-high)', background: 'rgba(255,48,48,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="var(--status-high)" />
            <div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--status-high)' }}>EMERGENCY ALERT ACTIVE</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>High flood probability detected — All civil protection units on high alert</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Emergency Status */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Shield size={16} /></div>
              Emergency Status
            </div>
          </div>
          <StatusRow icon={Radio}         label="Emergency Alert"   value={emergencyAlertStatus}   status={level === 'HIGH' ? 'ALERT' : 'ACTIVE'}  color="#ff3030" />
          <StatusRow icon={Users}         label="Evacuation Status" value={evacuationStatus}         status={level === 'HIGH' ? 'ALERT' : 'STANDBY'} color="#ff8c00" />
          <StatusRow icon={Home}          label="Shelter Capacity"  value="—"                        status="AVAILABLE" color="#00ff88" />
          <StatusRow icon={Heart}         label="Hospitals Ready"   value="—"                        status="ACTIVE"    color="#00d4ff" />
          <StatusRow icon={Users}         label="Emergency Teams"   value="0 Teams Deployed"         status="STANDBY"   color="#7b4fff" />
          <StatusRow icon={AlertTriangle} label="SOS Incidents"     value="Monitoring Active"        status="ACTIVE"    color="#ffd700" />
        </div>

        {/* Resource Overview */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Users size={16} /></div>
              Resource Overview
            </div>
          </div>
          <div className="grid-2" style={{ gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Shelters Active',   value: '0', color: '#00ff88' },
              { label: 'Hospitals On Call', value: '0', color: '#00d4ff' },
              { label: 'Teams Deployed',    value: '0', color: '#7b4fff' },
              { label: 'Persons Sheltered', value: '0', color: '#ff8c00' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card-sm" style={{ padding: '14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '28px', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Active Shelters</div>
            {[
              { name: 'Community Hall Alpha',      capacity: 800  },
              { name: 'Sports Complex Zone B',     capacity: 1200 },
              { name: 'Government School Zone C',  capacity: 500  },
            ].map(({ name, capacity }) => (
              <div key={name} className="area-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="area-item-dot" style={{ background: '#00ff88' }} />
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capacity: {capacity}</div>
                  </div>
                </div>
                <span className="badge badge-active" style={{ fontSize: '9px' }}>AVAILABLE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Admin-only boxes ─────────────────────────────────── */}
      {isAdmin && (
        <div className="grid-2" style={{ marginTop: '24px' }}>

          {/* Box 1 — AI Recommendations (Multi-Selectable) */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <div className="card-icon-wrapper" style={{ background: 'rgba(123,79,255,0.15)', color: '#7b4fff' }}>
                  <Brain size={16} />
                </div>
                AI Recommendations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {adviceItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllAi}
                    style={{ background: 'none', border: '1px solid #c7d2fe', padding: '3px 8px', borderRadius: '6px', color: '#7b4fff', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {selectedAiIndices.length === adviceItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
                <span className={`badge badge-${level.toLowerCase()}`} style={{ fontSize: '10px' }}>
                  {level} RISK
                </span>
              </div>
            </div>

            {loadingAdvice ? (
              <div className="loading-spinner" style={{ padding: '40px 0' }}>
                <div className="spinner" />
                <span>Generating recommendations for {level} risk level...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {adviceItems.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                    No recommendations available.
                  </div>
                ) : (
                  adviceItems.map((item, index) => {
                    const isSelected = selectedAiIndices.includes(index);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleAiIndex(index)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: isSelected ? '#fff7ed' : '#f8fafc',
                          border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ fontSize: '13px', color: isSelected ? '#ea580c' : '#1e293b', lineHeight: '1.5', fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                          {item}
                        </div>
                        {isSelected ? (
                          <CheckSquare size={18} color="#ea580c" style={{ flexShrink: 0 }} />
                        ) : (
                          <Square size={18} color="#cbd5e1" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Box 2 — Alert Civilians */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <div className="card-icon-wrapper" style={{ background: 'rgba(234,88,12,0.15)', color: '#ea580c' }}>
                  <Megaphone size={16} />
                </div>
                Alert Civilians
              </div>
              <span className="admin-badge">A</span>
            </div>

            {/* Quick Messages (Multi-Selectable) */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Quick Messages (Click to select multiple)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {PREDEFINED_MESSAGES.map(msg => {
                const isSelected = selectedQuickMsgs.includes(msg);
                return (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => toggleQuickMsg(msg)}
                    style={{
                      padding: '6px 12px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer',
                      border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff7ed' : '#f8fafc',
                      color: isSelected ? '#ea580c' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    {isSelected && <CheckSquare size={13} color="#ea580c" />}
                    {msg}
                  </button>
                );
              })}
            </div>

            {/* Custom Message */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Custom Message
            </div>
            <textarea
              id="custom-alert-msg"
              className="form-input"
              rows={3}
              placeholder="Type additional custom alert message..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              style={{ marginBottom: '14px', resize: 'vertical' }}
            />

            {/* Message Summary Preview */}
            {finalMessage && (
              <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '14px', whiteSpace: 'pre-line' }}>
                <strong>Combined Message Preview ({combinedParts.length} item{combinedParts.length > 1 ? 's' : ''}):</strong>
                <div style={{ marginTop: '4px' }}>{finalMessage}</div>
              </div>
            )}

            {/* Send Alert Button */}
            <button
              id="send-alert-btn"
              className="btn"
              onClick={handleOpenTargetModal}
              disabled={sending || !finalMessage}
              style={{
                width: '100%', justifyContent: 'center',
                background: sending || !finalMessage ? '#f1f5f9' : '#ea580c',
                color: sending || !finalMessage ? '#94a3b8' : '#fff',
                border: 'none', padding: '12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700, cursor: sending || !finalMessage ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
              }}
            >
              <Send size={15} />
              {sending ? 'Sending Alert...' : 'Send Alert'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step-by-step Target Selection Modal ───────────────── */}
      {showTargetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '28px', borderRadius: '16px', background: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(234,88,12,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', fontFamily: 'Rajdhani' }}>
                    Select Broadcast Target
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Choose destination city & locality for emergency alert
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Step 1: Select City */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Step 1: Target City
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={targetCity}
                  onChange={e => {
                    setTargetCity(e.target.value);
                    setTargetLocality('__ALL__');
                  }}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
                >
                  {cityList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Select Locality */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Step 2: Target Locality
              </label>
              <select
                className="form-input"
                value={targetLocality}
                onChange={e => setTargetLocality(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <option value="__ALL__"> All Localities in {targetCity.split(',')[0]}</option>
                {currentCityLocalities.map(loc => (
                  <option key={loc} value={loc}> {loc}</option>
                ))}
              </select>
            </div>

            {/* Recipient Count Summary */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: targetEmails.length > 0 ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${targetEmails.length > 0 ? '#bbf7d0' : '#fecaca'}`,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Users size={18} color={targetEmails.length > 0 ? '#16a34a' : '#dc2626'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: targetEmails.length > 0 ? '#15803d' : '#991b1b' }}>
                  {targetEmails.length} Civilian Email{targetEmails.length === 1 ? '' : 's'} Found
                </div>
                <div style={{ fontSize: '11px', color: targetEmails.length > 0 ? '#166534' : '#b91c1c' }}>
                  {targetLocality === '__ALL__' ? `Broadcasting to all localities in ${targetCity}` : `Broadcasting to ${targetLocality} in ${targetCity}`}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowTargetModal(false)}
                style={{ padding: '9px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmSendAlert}
                disabled={sending || targetEmails.length === 0}
                style={{
                  background: sending || targetEmails.length === 0 ? '#cbd5e1' : '#ea580c',
                  color: '#ffffff', border: 'none', padding: '9px 18px',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                  cursor: sending || targetEmails.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Send size={14} /> Confirm & Send Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
