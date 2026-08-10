import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { recommendationsAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  Building2, Zap, Navigation, AlertOctagon,
  Layers, CheckSquare, Square, Send, Clock, Plus, Trash2, Edit3
} from 'lucide-react';

const STANDARD_ACTIONS = [
  { id: 'std-1', label: 'Activate Pump Station Alpha & Beta', icon: Zap,          color: '#0284c7' },
  { id: 'std-2', label: 'Open Flood Gates A, B, C',           icon: Navigation,   color: '#16a34a' },
  { id: 'std-3', label: 'Close Roads: NH-44, Inner Ring Road', icon: AlertOctagon, color: '#ea580c' },
  { id: 'std-4', label: 'Deploy Temporary Flood Barriers',     icon: Layers,       color: '#7c3aed' },
  { id: 'std-5', label: 'Issue Mandatory Evacuation (Zone A)', icon: Building2,    color: '#dc2626' },
  { id: 'std-6', label: 'Alert Metro Medical Centers',         icon: Building2,    color: '#ca8a04' },
  { id: 'std-7', label: 'Activate Emergency Shelters',         icon: Building2,    color: '#16a34a' },
  { id: 'std-8', label: 'Deploy Rescue Boats to Standby',      icon: Navigation,   color: '#0284c7' },
];

export default function MunicipalDecisionAgent() {
  const { prediction } = useApp();
  const [selectedActions, setSelectedActions] = useState(new Set());
  const [customActionText, setCustomActionText] = useState('');
  const [customActionsList, setCustomActionsList] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const level = prediction?.level || 'SAFE';
  const aiRecommendedActions = prediction?.recommended_actions || [
    'Activate primary pump stations',
    'Pre-position flood barriers',
    'Issue flood advisory to residents',
    'Verify emergency shelter readiness',
  ];

  const toggleActionText = (text) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(text)) {
        next.delete(text);
      } else {
        next.add(text);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set([
      ...aiRecommendedActions,
      ...STANDARD_ACTIONS.map(a => a.label),
      ...customActionsList,
    ]);
    setSelectedActions(all);
  };

  const clearAll = () => {
    setSelectedActions(new Set());
  };

  const handleAddCustomAction = () => {
    const trimmed = customActionText.trim();
    if (!trimmed) {
      toast.error('Please enter a recommendation text');
      return;
    }
    if (!customActionsList.includes(trimmed)) {
      setCustomActionsList(prev => [...prev, trimmed]);
      setSelectedActions(prev => new Set(prev).add(trimmed));
      setCustomActionText('');
      toast.success('Custom recommendation added!');
    } else {
      toast.error('Recommendation already in list');
    }
  };

  const handleRemoveCustomAction = (text) => {
    setCustomActionsList(prev => prev.filter(item => item !== text));
    setSelectedActions(prev => {
      const next = new Set(prev);
      next.delete(text);
      return next;
    });
  };

  const handleSend = async () => {
    const finalActions = Array.from(selectedActions);

    // If text box has unsaved text, include it directly
    if (customActionText.trim() && !finalActions.includes(customActionText.trim())) {
      finalActions.push(customActionText.trim());
    }

    if (finalActions.length === 0) {
      toast.error('Please select or type at least one recommendation');
      return;
    }

    setSending(true);
    try {
      await recommendationsAPI.send({
        actions: finalActions,
        severity: level,
        sent_by: 'Municipal Decision Agent',
      });
      setSent(true);
      toast.success(`Successfully dispatched ${finalActions.length} recommendation(s) to Control Room!`);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      toast.error(`Failed to send recommendations: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">Municipal Decision Agent</h1>
        <p className="page-subtitle">AI-generated & custom action recommendations for municipal disaster control room</p>
        <div className="glow-line" />
      </div>

      <div className="grid-2">
        {/* Left Column: AI Recommendations */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Building2 size={16} /></div>
              AI Recommended Actions (Click to Select)
            </div>
            <span className={`badge badge-${level.toLowerCase()}`}>
              <span className={`pulse-dot ${{ SAFE:'green',LOW:'yellow',MODERATE:'orange',HIGH:'red' }[level]}`} />
              {level}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {aiRecommendedActions.map((action, i) => {
              const isSelected = selectedActions.has(action);
              return (
                <div
                  key={i}
                  className={`action-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleActionText(action)}
                  style={{ padding: '12px 14px' }}
                >
                  <div className="action-card-icon" style={{ background: isSelected ? '#e0f2fe' : '#f1f5f9' }}>
                    <Building2 size={16} color={isSelected ? '#0284c7' : '#64748b'} />
                  </div>
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                    {action}
                  </span>
                  {isSelected
                    ? <CheckSquare size={18} color="#0284c7" />
                    : <Square size={18} color="#cbd5e1" />}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} />
            AI Generated · Click any item above to include it in the dispatch payload
          </div>
        </div>

        {/* Right Column: Standard Actions, Custom Text Box & Send */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><Send size={16} /></div>
              Select & Dispatch Recommendations
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={selectAll}>Select All</button>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={clearAll}>Clear All</button>
            </div>
          </div>

          {/* Standard Actions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto' }}>
            {STANDARD_ACTIONS.map(({ id, label, icon: Icon, color }) => {
              const isSelected = selectedActions.has(label);
              return (
                <div
                  key={id}
                  className={`action-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleActionText(label)}
                  style={{ padding: '10px 14px' }}
                >
                  <div className="action-card-icon" style={{ background: `${color}15`, width: '32px', height: '32px' }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span style={{ flex: 1, fontSize: '13px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                    {label}
                  </span>
                  {isSelected
                    ? <CheckSquare size={16} color="#0284c7" />
                    : <Square size={16} color="#cbd5e1" />}
                </div>
              );
            })}

            {/* Custom Added Actions */}
            {customActionsList.map((text, idx) => {
              const isSelected = selectedActions.has(text);
              return (
                <div
                  key={`custom-${idx}`}
                  className={`action-card ${isSelected ? 'selected' : ''}`}
                  style={{ padding: '10px 14px', borderLeft: '3px solid #0284c7' }}
                >
                  <div className="action-card-icon" style={{ background: '#e0f2fe', width: '32px', height: '32px' }}>
                    <Edit3 size={14} color="#0284c7" />
                  </div>
                  <span
                    style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}
                    onClick={() => toggleActionText(text)}
                  >
                    {text}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span onClick={() => toggleActionText(text)} style={{ cursor: 'pointer' }}>
                      {isSelected ? <CheckSquare size={16} color="#0284c7" /> : <Square size={16} color="#cbd5e1" />}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveCustomAction(text); }}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                      title="Remove custom action"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Text Box */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="custom-recommendation-input">
              <Edit3 size={12} style={{ display: 'inline', marginRight: '6px' }} />
              Type Custom Recommendation
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="custom-recommendation-input"
                type="text"
                className="form-input"
                placeholder="e.g. Deploy sandbags to Sector 4, dispatch emergency boat..."
                value={customActionText}
                onChange={e => setCustomActionText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddCustomAction(); }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleAddCustomAction}
                style={{ flexShrink: 0, padding: '10px 14px' }}
                title="Add to selection list"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          {sent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--status-safe-bg)', border: '1px solid var(--status-safe-border)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--status-safe)' }}>
              ✓ Recommendation successfully dispatched to Municipal Control Room & Resend email system
            </div>
          )}

          <button
            id="send-recommendation-btn"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '12px' }}
            onClick={handleSend}
            disabled={sending || (selectedActions.size === 0 && !customActionText.trim())}
          >
            <Send size={16} />
            {sending
              ? 'Sending Recommendations...'
              : `Send Recommendations (${selectedActions.size + (customActionText.trim() && !selectedActions.has(customActionText.trim()) ? 1 : 0)} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}
