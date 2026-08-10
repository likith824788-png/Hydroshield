import React, { useEffect, useState } from 'react';
import { missionReportAPI } from '../../api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import {
  FileText, RefreshCw, Waves, MapPin, Package,
  Heart, Home, AlertTriangle, Activity, Clock, Download,
  ListChecks, ShieldCheck, Droplets, Anchor, Siren, Plane, Users
} from 'lucide-react';

/** Build and download a plain-text report file */
function downloadReport(report) {
  const resources = report.resources_allocated
    ? Object.entries(report.resources_allocated).map(([k, v]) => `  - ${k.replace(/_/g, ' ').toUpperCase()}: ${v}`).join('\n')
    : '  None';
  const areas     = report.affected_areas?.join(', ') || 'None';
  const hospitals = report.hospitals_assigned?.join(', ') || 'None';
  const shelters  = report.shelters_assigned?.join(', ')  || 'None';
  const actions   = report.priority_actions?.map((act, i) => `${i + 1}. ${act}`).join('\n') || 'None';
  const zones     = report.evacuation_zones?.join(', ') || 'None';
  const channels  = report.communication_channels?.join(', ') || 'None';

  const content = [
    '='.repeat(60),
    'HYDROSHIELD MISSION REPORT & AI RESCUE PLAN SUMMARY',
    '='.repeat(60),
    `Report ID          : ${report.id}`,
    `Generated At       : ${new Date(report.generated_at).toLocaleString()}`,
    `Location           : ${report.location}`,
    `Emergency Level    : ${report.emergency_level || 'SAFE'}`,
    `Mission Priority   : ${report.priority || 'LOW'}`,
    `Est. Rescue Time   : ${report.estimated_rescue_time_hours ?? 0} hours`,
    `Mission Status     : ${report.mission_status}`,
    '',
    '-'.repeat(60),
    'OPERATIONAL SUMMARY',
    '-'.repeat(60),
    report.summary || 'Standard hydrological monitoring active.',
    '',
    '-'.repeat(60),
    'FLOOD METRICS',
    '-'.repeat(60),
    `Flood Probability  : ${report.flood_probability}%`,
    `Affected Areas     : ${areas}`,
    '',
    '-'.repeat(60),
    'RESOURCES ALLOCATED FROM LAST GENERATED RESCUE PLAN',
    '-'.repeat(60),
    resources,
    '',
    '-'.repeat(60),
    'EVACUATION ZONES',
    '-'.repeat(60),
    zones,
    '',
    '-'.repeat(60),
    'PRIORITY ACTIONS',
    '-'.repeat(60),
    actions,
    '',
    '-'.repeat(60),
    'COMMUNICATION CHANNELS',
    '-'.repeat(60),
    channels,
    '',
    '-'.repeat(60),
    'HOSPITALS ASSIGNED',
    '-'.repeat(60),
    hospitals,
    '',
    '-'.repeat(60),
    'SHELTERS ASSIGNED',
    '-'.repeat(60),
    shelters,
    '',
    '='.repeat(60),
    'HydroShield AI Flood Management System — Emergency Operations Report',
    '='.repeat(60),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `HydroShield_Mission_Report_${report.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function MissionReport() {
  const { settings } = useApp();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async (isManual = false) => {
    setLoading(true);
    if (isManual) {
      toast.loading('Generating fresh mission report...', { id: 'report-gen' });
    }
    try {
      // 1. Check for saved rescue plan from last generation
      let savedPlanObj = null;
      try {
        const raw = localStorage.getItem('hydroshield_last_rescue_plan');
        if (raw) savedPlanObj = JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }

      // 2. Fetch base telemetry report
      const res = await missionReportAPI.get();
      const baseReport = res?.data || {};

      // 3. Merge metrics from the last generated rescue plan
      if (savedPlanObj && savedPlanObj.plan) {
        const p = savedPlanObj.plan;
        const mergedReport = {
          ...baseReport,
          id: baseReport.id || `REP-${Date.now().toString(36).toUpperCase()}`,
          generated_at: savedPlanObj.timestamp || baseReport.generated_at || new Date().toISOString(),
          location: savedPlanObj.location || settings?.location_name || baseReport.location || 'Bengaluru, India',
          emergency_level: savedPlanObj.level || baseReport.emergency_level || 'SAFE',
          priority: savedPlanObj.priority || 'LOW',
          flood_probability: savedPlanObj.probability ?? baseReport.flood_probability ?? 0,
          mission_status: baseReport.mission_status || 'ACTIVE',
          summary: p.summary || baseReport.summary || 'Standard hydrological monitoring active.',
          estimated_rescue_time_hours: p.estimated_rescue_time_hours ?? 0,
          resources_allocated: {
            rescue_boats: p.rescue_boats ?? baseReport.resources_allocated?.rescue_boats ?? 0,
            ambulances: p.ambulances ?? baseReport.resources_allocated?.ambulances ?? 0,
            helicopters: p.helicopters ?? 0,
            drones: p.drones ?? baseReport.resources_allocated?.drones ?? 0,
            rescue_teams: p.rescue_teams ?? 0,
            medical_personnel: p.medical_personnel ?? 0,
            food_packets: p.food_packets ?? 0,
            water_bottles: p.water_bottles ?? 0,
            life_jackets: p.life_jackets ?? 0,
            first_aid_kits: p.first_aid_kits ?? 0,
          },
          affected_areas: p.evacuation_zones?.length ? p.evacuation_zones : (savedPlanObj.affected_areas || baseReport.affected_areas || []),
          evacuation_zones: p.evacuation_zones || [],
          priority_actions: p.priority_actions || [],
          communication_channels: p.communication_channels || [],
          hospitals_assigned: baseReport.hospitals_assigned || [],
          shelters_assigned: baseReport.shelters_assigned || [],
        };
        setReport(mergedReport);
        if (isManual) {
          toast.success('Mission report updated & downloading!', { id: 'report-gen' });
          downloadReport(mergedReport);
        }
      } else if (res?.data) {
        setReport(res.data);
        if (isManual) {
          toast.success('Report generated! Downloading...', { id: 'report-gen' });
          downloadReport(res.data);
        }
      } else {
        if (isManual) toast.error('Could not generate report', { id: 'report-gen' });
      }
    } catch (e) {
      if (isManual) toast.error(`Report generation failed: ${e.message}`, { id: 'report-gen' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const level = report?.emergency_level || 'SAFE';
  const levelColor = { SAFE: '#16a34a', LOW: '#ca8a04', MODERATE: '#ea580c', HIGH: '#dc2626' }[level] || '#0284c7';

  return (
    <div className="page-container stagger-children">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Mission Report</h1>
          <p className="page-subtitle">Auto-generated operational summary based on last generated AI rescue plan & telemetry</p>
        </div>
        <div>
          {report && (
            <button
              id="download-report-btn"
              className="btn btn-primary"
              onClick={() => downloadReport(report)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} /> Download File
            </button>
          )}
        </div>
      </div>
      <div className="glow-line" />

      {loading && !report ? (
        <div className="loading-spinner"><div className="spinner" /><span>Generating mission report...</span></div>
      ) : report ? (
        <>
          {/* Report Header Card */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px', borderLeft: `4px solid ${levelColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>MISSION REPORT ID</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--cyan)', fontWeight: 600 }}>{report.id}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className={`badge badge-${level.toLowerCase()}`}>
                  <span className={`pulse-dot ${{ SAFE:'green',LOW:'yellow',MODERATE:'orange',HIGH:'red' }[level]}`} />
                  EMERGENCY LEVEL: {level}
                </span>
                <span className={`badge ${report.mission_status === 'ACTIVE' ? 'badge-active' : 'badge-processing'}`}>
                  <span className={`pulse-dot ${report.mission_status === 'ACTIVE' ? 'green' : 'cyan'}`} />
                  {report.mission_status}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Generated: {new Date(report.generated_at).toLocaleString()}</span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Location: {report.location}</span>
            </div>
          </div>

          {/* Operational Summary */}
          {report.summary && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderTop: '3px solid var(--cyan)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                AI Rescue Plan Operational Summary
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {report.summary}
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Key Metrics */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon-wrapper"><Activity size={16} /></div>
                  Key Metrics
                </div>
              </div>

              {[
                { icon: Waves, label: 'Flood Probability', value: `${report.flood_probability}%`, color: levelColor },
                { icon: MapPin, label: 'Affected Areas', value: `${report.affected_areas?.length || 0} zones`, color: '#0284c7' },
                { icon: AlertTriangle, label: 'Emergency Level', value: level, color: levelColor },
                { icon: Activity, label: 'Mission Status', value: report.mission_status, color: '#16a34a' },
                { icon: Clock, label: 'Est. Rescue Time', value: `${report.estimated_rescue_time_hours ?? 0} hrs`, color: '#7b4fff' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="data-row">
                  <div className="data-row-label">
                    <div className="data-row-icon" style={{ color }}><Icon size={15} /></div>
                    {label}
                  </div>
                  <span className="mono" style={{ color, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Resources Allocated */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon-wrapper"><Package size={16} /></div>
                  Resources Allocated (Last Plan)
                </div>
              </div>
              <div className="grid-2" style={{ gap: '10px' }}>
                {report.resources_allocated && Object.entries(report.resources_allocated).map(([key, val]) => (
                  <div key={key} className="glass-card-sm" style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: '24px', fontWeight: 700, color: 'var(--cyan)' }}>{val}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Actions */}
            {report.priority_actions?.length > 0 && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon-wrapper"><ListChecks size={16} /></div>
                    Priority Actions
                  </div>
                </div>
                <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {report.priority_actions.map((act, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {act}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Evacuation Zones */}
            {report.evacuation_zones?.length > 0 && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <div className="card-icon-wrapper"><MapPin size={16} /></div>
                    Evacuation Zones
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {report.evacuation_zones.map((zone, i) => (
                    <span key={i} style={{ padding: '6px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '100px', fontSize: '12px', color: '#0284c7', fontWeight: 500 }}>
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hospitals */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon-wrapper"><Heart size={16} /></div>
                  Hospitals Assigned
                </div>
              </div>
              {(!report.hospitals_assigned || report.hospitals_assigned.length === 0) ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>No hospitals assigned (Level: SAFE)</div>
              ) : (
                report.hospitals_assigned.map((h, i) => (
                  <div key={i} className="area-item" style={{ marginBottom: '6px' }}>
                    <span className="area-item-dot" style={{ background: '#dc2626' }} />
                    {h}
                  </div>
                ))
              )}
            </div>

            {/* Shelters */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon-wrapper"><Home size={16} /></div>
                  Shelters Assigned
                </div>
              </div>
              {(!report.shelters_assigned || report.shelters_assigned.length === 0) ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>No emergency shelters assigned (Level: SAFE)</div>
              ) : (
                report.shelters_assigned.map((s, i) => (
                  <div key={i} className="area-item" style={{ marginBottom: '6px' }}>
                    <span className="area-item-dot" style={{ background: '#16a34a' }} />
                    {s}
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      ) : (
        <div className="error-state"><AlertTriangle size={16} /> Failed to generate report. Please click 'Generate New Report' to retry.</div>
      )}
    </div>
  );
}
