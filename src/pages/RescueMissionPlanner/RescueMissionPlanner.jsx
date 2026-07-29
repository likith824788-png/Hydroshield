import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { geminiAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  Anchor, Siren, Plane, Heart, Home,
  Clock, Sparkles, MapPin, Phone, AlertCircle, Users, Package
} from 'lucide-react';

function ResourceCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div
      className="glass-card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color }}>
        <Icon size={24} />
      </div>
      <div style={{ fontFamily: 'Rajdhani', fontSize: '36px', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}> {unit}</span>}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

/** Pre-configured Infrastructure Knowledge Base by City */
const CITY_INFRASTRUCTURE = {
  'Bengaluru, India': {
    hospitals: [
      { name: 'Manipal Hospital (HAL Old Airport Rd)', dist: '1.8 km', beds: '45 Emergency Beds', contact: '+91 80 2502 4444', level: 'Level 1 Trauma Center' },
      { name: 'Apollo Hospital (Jayanagar)', dist: '3.2 km', beds: '30 ICU Beds', contact: '+91 80 2630 4050', level: 'Super Specialty' },
      { name: 'Fortis Hospital (Bannerghatta)', dist: '4.5 km', beds: '25 ER Beds', contact: '+91 80 6621 4444', level: 'Emergency Center' },
      { name: 'Victoria Hospital (Fort)', dist: '5.1 km', beds: '60 General Ward', contact: '+91 80 2670 1150', level: 'Public Multi-Specialty' },
    ],
    shelters: [
      { name: 'Kanteerava Indoor Stadium Relief Camp', dist: '1.2 km', capacity: '1,500 Persons', status: 'Active Relief Hub', foodWater: 'Supplies Ready' },
      { name: 'HAL Community Evacuation Hall', dist: '2.4 km', capacity: '800 Persons', status: 'High Capacity', foodWater: 'Medical Desk Active' },
      { name: 'Jayanagar National High School Camp', dist: '3.8 km', capacity: '500 Persons', status: 'Ready', foodWater: 'Ration Standby' },
      { name: 'Malleswaram Public Community Center', dist: '4.9 km', capacity: '600 Persons', status: 'Operational', foodWater: 'Power Generator On' },
    ]
  },
  'Chennai, India': {
    hospitals: [
      { name: 'Apollo Main Hospital (Greams Rd)', dist: '1.4 km', beds: '50 Emergency Beds', contact: '+91 44 2829 0200', level: 'Level 1 Trauma Center' },
      { name: 'Rajiv Gandhi Government General Hospital', dist: '2.6 km', beds: '120 General Ward', contact: '+91 44 2530 5000', level: 'State Disaster Center' },
      { name: 'MIOT International (Manapakkam)', dist: '4.1 km', beds: '35 ICU Beds', contact: '+91 44 4200 2288', level: 'Multi-Specialty' },
      { name: 'Kauvery Hospital (Alwarpet)', dist: '4.8 km', beds: '20 ER Beds', contact: '+91 44 4000 6000', level: 'Emergency Ward' },
    ],
    shelters: [
      { name: 'Jawaharlal Nehru Stadium Flood Camp', dist: '1.5 km', capacity: '2,000 Persons', status: 'Primary Relief Hub', foodWater: 'Ration & Water Active' },
      { name: 'Mylapore Community Relief Shelter', dist: '2.8 km', capacity: '750 Persons', status: 'High Capacity', foodWater: 'Medical Desk Active' },
      { name: 'Guindy Indoor Sports Complex Center', dist: '3.9 km', capacity: '900 Persons', status: 'Operational', foodWater: 'Power Generator On' },
      { name: 'Velachery Community Hall Shelter', dist: '5.2 km', capacity: '600 Persons', status: 'Standby', foodWater: 'Supplies Ready' },
    ]
  },
  'Madurai, India': {
    hospitals: [
      { name: 'Government Rajaji Hospital (GRH)', dist: '1.5 km', beds: '80 ICU & ER Beds', contact: '+91 452 253 2535', level: 'Level 1 Emergency' },
      { name: 'Apollo Speciality Hospital (KK Nagar)', dist: '2.9 km', beds: '25 ICU Beds', contact: '+91 452 258 0808', level: 'Super Specialty' },
      { name: 'Meenakshi Mission Hospital', dist: '4.2 km', beds: '40 ER Beds', contact: '+91 452 258 8741', level: 'Trauma & ICU' },
    ],
    shelters: [
      { name: 'Tamukkam Ground Flood Relief Camp', dist: '1.1 km', capacity: '1,200 Persons', status: 'Primary Relief Hub', foodWater: 'Supplies Ready' },
      { name: 'KK Nagar Community Evacuation Center', dist: '2.5 km', capacity: '600 Persons', status: 'Active', foodWater: 'Medical Desk Active' },
      { name: 'Anna Nagar Indoor Sports Complex', dist: '3.7 km', capacity: '800 Persons', status: 'Operational', foodWater: 'Power Generator On' },
    ]
  },
  'Coimbatore, India': {
    hospitals: [
      { name: 'KMCH Hospital (Avinashi Rd)', dist: '2.1 km', beds: '45 Emergency Beds', contact: '+91 422 432 3800', level: 'Level 1 Trauma Center' },
      { name: 'Coimbatore Medical College Hospital (CMCH)', dist: '2.8 km', beds: '90 General Ward', contact: '+91 422 230 1393', level: 'State Disaster Center' },
      { name: 'PSG Hospitals (Peelamedu)', dist: '3.6 km', beds: '30 ICU Beds', contact: '+91 422 257 0170', level: 'Super Specialty' },
    ],
    shelters: [
      { name: 'Nehru Stadium Flood Relief Shelter', dist: '1.4 km', capacity: '1,500 Persons', status: 'Primary Relief Hub', foodWater: 'Supplies Ready' },
      { name: 'Peelamedu Community Evacuation Hall', dist: '3.1 km', capacity: '700 Persons', status: 'Active', foodWater: 'Ration Standby' },
      { name: 'RS Puram Municipal Center', dist: '4.0 km', capacity: '500 Persons', status: 'Operational', foodWater: 'Medical Desk Active' },
    ]
  },
  'Salem, India': {
    hospitals: [
      { name: 'Government Mohan Kumaramangalam Hospital', dist: '1.6 km', beds: '70 General & ER Beds', contact: '+91 427 221 1555', level: 'Level 1 Emergency' },
      { name: 'Manipal Hospital (Dalmia Board)', dist: '3.0 km', beds: '20 ICU Beds', contact: '+91 427 234 6600', level: 'Super Specialty' },
    ],
    shelters: [
      { name: 'Salem Municipal Indoor Stadium Camp', dist: '1.2 km', capacity: '1,000 Persons', status: 'Primary Relief Hub', foodWater: 'Supplies Ready' },
      { name: 'Hasthampatti Evacuation Center', dist: '2.7 km', capacity: '500 Persons', status: 'Active', foodWater: 'Ration Active' },
    ]
  },
  'Anantapur, India': {
    hospitals: [
      { name: 'Government General Hospital (GGH Anantapur)', dist: '1.3 km', beds: '60 General & ER Beds', contact: '+91 8554 274 022', level: 'Level 1 Emergency' },
      { name: 'KIMS Saveera Hospital', dist: '2.9 km', beds: '25 ICU Beds', contact: '+91 8554 233 444', level: 'Multi-Specialty' },
    ],
    shelters: [
      { name: 'Anantapur Municipal Sports Complex Hub', dist: '1.0 km', capacity: '1,100 Persons', status: 'Primary Relief Hub', foodWater: 'Supplies Ready' },
      { name: 'Clock Tower Community Evacuation Shelter', dist: '2.4 km', capacity: '600 Persons', status: 'Active', foodWater: 'Medical Desk Active' },
    ]
  },
  'Hyderabad, India': {
    hospitals: [
      { name: 'Yashoda Hospital (Somajiguda)', dist: '1.7 km', beds: '50 ER & ICU Beds', contact: '+91 40 4567 4567', level: 'Level 1 Trauma Center' },
      { name: 'Osmania General Hospital (Afzal Gunj)', dist: '2.9 km', beds: '100 General Ward', contact: '+91 40 2460 0121', level: 'State Disaster Hospital' },
      { name: 'Apollo Hospitals (Jubilee Hills)', dist: '4.3 km', beds: '40 ICU Beds', contact: '+91 40 2360 7777', level: 'Super Specialty' },
    ],
    shelters: [
      { name: 'LB Stadium Flood Evacuation Center', dist: '1.5 km', capacity: '2,500 Persons', status: 'Primary Relief Hub', foodWater: 'Ration & Water Active' },
      { name: 'Begumpet Community Relief Hall', dist: '3.0 km', capacity: '800 Persons', status: 'Active', foodWater: 'Medical Desk Active' },
    ]
  },
  'Trivandram, India': {
    hospitals: [
      { name: 'Government Medical College Hospital', dist: '1.9 km', beds: '90 Emergency Beds', contact: '+91 471 252 8300', level: 'State Disaster Center' },
      { name: 'KIMSHEALTH (Anayara)', dist: '3.4 km', beds: '35 ICU Beds', contact: '+91 471 294 1000', level: 'Multi-Specialty' },
    ],
    shelters: [
      { name: 'Central Stadium Flood Relief Camp', dist: '1.3 km', capacity: '1,800 Persons', status: 'Primary Relief Hub', foodWater: 'Ration Active' },
      { name: 'PTP Nagar Community Evacuation Center', dist: '2.8 km', capacity: '650 Persons', status: 'Active', foodWater: 'Medical Desk Active' },
    ]
  }
};

/** Dynamic Fallback Generator for custom cities */
function getInfrastructureForCity(cityName, priority) {
  const cityKey = Object.keys(CITY_INFRASTRUCTURE).find(
    c => c.toLowerCase().includes((cityName || '').toLowerCase().split(',')[0])
  ) || 'Bengaluru, India';

  const raw = CITY_INFRASTRUCTURE[cityKey] || CITY_INFRASTRUCTURE['Bengaluru, India'];
  const count = (priority === 'CRITICAL' || priority === 'HIGH') ? 4 : (priority === 'MEDIUM') ? 3 : 2;

  return {
    hospitals: raw.hospitals.slice(0, count),
    shelters:  raw.shelters.slice(0, count),
    cityName:  cityName || cityKey,
  };
}

/** Build and trigger browser download of the plain-text rescue plan */
function downloadRescuePlan(plan, location) {
  if (!plan) return;
  const zones = plan.evacuation_zones?.join('\n  - ') || 'None';
  const actions = plan.priority_actions?.map((act, i) => `${i + 1}. ${act}`).join('\n') || 'None';
  const channels = plan.communication_channels?.join(', ') || 'None';

  const content = [
    '='.repeat(60),
    'HYDROSHIELD AI RESCUE MISSION PLAN',
    '='.repeat(60),
    `Generated At   : ${new Date().toLocaleString()}`,
    `Target Location: ${location || 'Unknown'}`,
    `Est. Rescue Time: ${plan.estimated_rescue_time_hours ?? '—'} hours`,
    '',
    '-'.repeat(60),
    'OPERATIONAL SUMMARY',
    '-'.repeat(60),
    plan.summary || 'None',
    '',
    '-'.repeat(60),
    'RESOURCE ALLOCATION',
    '-'.repeat(60),
    `  - Rescue Boats       : ${plan.rescue_boats ?? 0}`,
    `  - Ambulances         : ${plan.ambulances ?? 0}`,
    `  - Helicopters        : ${plan.helicopters ?? 0}`,
    `  - Drones             : ${plan.drones ?? 0}`,
    `  - Rescue Teams       : ${plan.rescue_teams ?? 0}`,
    `  - Medical Personnel  : ${plan.medical_personnel ?? 0}`,
    `  - Food Packets       : ${plan.food_packets ?? 0}`,
    `  - Water Bottles      : ${plan.water_bottles ?? 0}`,
    `  - Life Jackets       : ${plan.life_jackets ?? 0}`,
    `  - First Aid Kits     : ${plan.first_aid_kits ?? 0}`,
    '',
    '-'.repeat(60),
    'EVACUATION ZONES',
    '-'.repeat(60),
    `  - ${zones}`,
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
    '='.repeat(60),
    'HydroShield AI Flood Management System — Emergency Operations',
    '='.repeat(60),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `HydroShield_Rescue_Plan_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function RescueMissionPlanner() {
  const { prediction, settings } = useApp();
  const resources = prediction?.rescue_resources || {};
  const level     = prediction?.level || 'SAFE';
  const priority  = resources.priority || 'LOW';

  const priorityColor = {
    CRITICAL: '#ff3030', HIGH: '#ff8c00', MEDIUM: '#ffd700', LOW: '#00ff88'
  }[priority] || '#00d4ff';

  const currentLocation = settings?.location_name || prediction?.location_name || 'Bengaluru, India';
  const infra = getInfrastructureForCity(currentLocation, priority);

  // ETA Calculation: LOW/SAFE -> 0 min, MEDIUM -> 45 min, HIGH/CRITICAL -> 75 min
  const isLowRisk = priority === 'LOW' || priority === 'SAFE' || level === 'LOW' || level === 'SAFE';
  const displayEta = isLowRisk
    ? 0
    : (resources.eta_minutes && resources.eta_minutes > 0
        ? resources.eta_minutes
        : (priority === 'HIGH' || priority === 'CRITICAL' ? 75 : 45));

  const [generating, setGen] = useState(false);

  const handleGenerate = async () => {
    setGen(true);
    toast.loading('Generating AI rescue plan...', { id: 'rescue-plan' });
    try {
      const res = await geminiAPI.getRescuePlan({
        priority:             priority,
        flood_level:          level,
        probability:          prediction?.probability ?? 0,
        location:             currentLocation,
        affected_areas:       prediction?.affected_areas || [],
        affected_population:  null,
      });
      if (res?.plan?.error) {
        toast.error(res.plan.error, { id: 'rescue-plan' });
      } else {
        const generatedPlan = res?.plan || null;
        if (generatedPlan) {
          localStorage.setItem('hydroshield_last_rescue_plan', JSON.stringify({
            plan: generatedPlan,
            location: currentLocation,
            priority: priority,
            level: level,
            probability: prediction?.probability ?? 0,
            timestamp: new Date().toISOString(),
            affected_areas: prediction?.affected_areas || [],
          }));
          downloadRescuePlan(generatedPlan, currentLocation);
          toast.success('Rescue plan generated & saved to Mission Report page!', { id: 'rescue-plan' });
        }
      }
    } catch (e) {
      toast.error(`Plan generation failed: ${e.message}`, { id: 'rescue-plan' });
    } finally {
      setGen(false);
    }
  };

  return (
    <div className="page-container stagger-children">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">AI Rescue Mission Planner</h1>
          <p className="page-subtitle">Intelligent resource allocation and rescue operation coordination</p>
        </div>
        <button
          id="generate-rescue-plan-btn"
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={16} className={generating ? 'spinning' : ''} />
          {generating ? 'Generating...' : 'Generate Rescue Plan'}
        </button>
      </div>
      <div className="glow-line" />

      {/* Priority Banner */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${priorityColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MISSION PRIORITY</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '24px', fontWeight: 700, color: priorityColor }}>
            {priority}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--cyan)" /> {currentLocation.split(',')[0]} Operations
          </span>
        </div>
      </div>

      {/* Default Resource Grid (from prediction) */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <ResourceCard icon={Anchor} label="Rescue Boats Required"  value={resources.rescue_boats ?? 0} color="#00d4ff" />
        <ResourceCard icon={Siren}  label="Ambulances Required"    value={resources.ambulances   ?? 0} color="#ff3030" />
        <ResourceCard icon={Plane}  label="Drone Medicine Delivery" value={resources.drones       ?? 0} color="#7b4fff" />
      </div>

      {/* Dynamic Infrastructure Grid: Nearest Hospitals & Nearest Shelters (ALWAYS KEPT VISIBLE) */}
      <div className="grid-2">
        {/* Nearest Hospitals */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">
              <div className="card-icon-wrapper" style={{ background: 'rgba(255,48,48,0.15)', color: '#ff3030' }}>
                <Heart size={16} />
              </div>
              Nearest Hospital ({currentLocation.split(',')[0]})
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', background: `${priorityColor}22`, color: priorityColor, border: `1px solid ${priorityColor}44` }}>
              {infra.hospitals.length} Standby
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {infra.hospitals.map((hosp, i) => (
              <div
                key={i}
                className="glass-card-sm"
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${i === 0 ? '#ff3030' : '#0284c7'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {hosp.name}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cyan)', background: '#f0f9ff', padding: '2px 8px', borderRadius: '100px', border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                    {hosp.dist}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                    <Heart size={12} /> {hosp.beds}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7' }}>
                    <AlertCircle size={12} /> {hosp.level}
                  </span>
                  <a
                    href={`tel:${hosp.contact.replace(/\s+/g, '')}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' }}
                  >
                    <Phone size={12} /> {hosp.contact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Shelters */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">
              <div className="card-icon-wrapper" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                <Home size={16} />
              </div>
              Nearest Shelter ({currentLocation.split(',')[0]})
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', background: `${priorityColor}22`, color: priorityColor, border: `1px solid ${priorityColor}44` }}>
              {infra.shelters.length} Ready
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {infra.shelters.map((shelter, i) => (
              <div
                key={i}
                className="glass-card-sm"
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${i === 0 ? '#16a34a' : '#0284c7'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {shelter.name}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cyan)', background: '#f0f9ff', padding: '2px 8px', borderRadius: '100px', border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                    {shelter.dist}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <Users size={12} /> {shelter.capacity}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7' }}>
                    <Home size={12} /> {shelter.status}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontWeight: 500, marginLeft: 'auto' }}>
                    <Package size={12} /> {shelter.foodWater}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
