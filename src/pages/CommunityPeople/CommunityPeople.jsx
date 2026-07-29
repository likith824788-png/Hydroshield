import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, MapPin, Building, Users, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

const DEFAULT_LOCALITIES = ['Locality 1', 'Locality 2', 'Locality 3', 'Locality 4', 'Locality 5'];

const DEFAULT_EMAILS = [
  '99240041335@klu.ac.in',
  '99240041000@klu.ac.in',
  '9924051040@klu.ac.in',
  '99240041297@klu.ac.in',
];

const STORAGE_KEY = 'hydroshield_community';
const STORAGE_CITIES_KEY = 'hydroshield_community_cities';

function buildInitialData(cityList) {
  const result = {};
  cityList.forEach(city => {
    result[city] = {};
    DEFAULT_LOCALITIES.forEach(loc => {
      // Initialize preset cities with default emails
      result[city][loc] = PRESET_CITIES.includes(city) ? [...DEFAULT_EMAILS] : [];
    });
  });
  return result;
}

export default function CommunityPeople() {
  const [cityList, setCityList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CITIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRESET_CITIES;
  });

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved); // Load EXACT user state from localStorage without auto-merging across localities
      }
    } catch (e) {
      console.error(e);
    }
    return buildInitialData(PRESET_CITIES);
  });

  const [activeCity, setActiveCity] = useState(PRESET_CITIES[0]);
  const [newEmail, setNewEmail]     = useState({}); // { [locality]: string }

  // Modal / Form state for Add City & Add Locality
  const [showAddCityModal, setShowAddCityModal]         = useState(false);
  const [cityNameInput, setCityNameInput]               = useState('');

  const [showAddLocalityModal, setShowAddLocalityModal] = useState(false);
  const [locNameInput, setLocNameInput]                 = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_CITIES_KEY, JSON.stringify(cityList));
    } catch (e) {
      console.error(e);
    }
  }, [data, cityList]);

  // ── Add City Handler (Initializes with EMPTY email lists) ─────
  const handleAddCity = (e) => {
    e?.preventDefault();
    const name = cityNameInput.trim();
    if (!name) return;
    const formattedName = name.includes(',') ? name : `${name}, India`;
    if (cityList.includes(formattedName)) {
      toast.error('City already exists');
      return;
    }

    const updatedCities = [...cityList, formattedName];
    setCityList(updatedCities);

    // Initialize new city with EMPTY email arrays
    setData(prev => ({
      ...prev,
      [formattedName]: {
        'Locality 1': [],
        'Locality 2': [],
        'Locality 3': [],
        'Locality 4': [],
        'Locality 5': [],
      }
    }));

    setActiveCity(formattedName);
    setCityNameInput('');
    setShowAddCityModal(false);
    toast.success(`City "${formattedName}" added with empty email lists.`);
  };

  // ── Add Locality Handler (Initializes with EMPTY email list) ───
  const handleAddLocality = (e) => {
    e?.preventDefault();
    const locName = locNameInput.trim();
    if (!locName) return;

    const existingLocs = Object.keys(data[activeCity] || {});
    if (existingLocs.includes(locName)) {
      toast.error(`Locality "${locName}" already exists in ${activeCity}`);
      return;
    }

    // Initialize new locality with EMPTY email array
    setData(prev => ({
      ...prev,
      [activeCity]: {
        ...(prev[activeCity] || {}),
        [locName]: [],
      }
    }));

    setLocNameInput('');
    setShowAddLocalityModal(false);
    toast.success(`Added empty locality "${locName}" to ${activeCity}!`);
  };

  // ── Add Email STRICTLY to the target locality alone ─────────
  const handleAddEmail = (city, locality) => {
    const email = newEmail[locality]?.trim();
    if (!email) return;
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const currentLocalityEmails = data[city]?.[locality] || [];
    if (currentLocalityEmails.includes(email)) {
      toast.error('Email already added to this locality');
      return;
    }

    // Mutate ONLY data[city][locality]
    setData(prev => {
      const cityData = { ...(prev[city] || {}) };
      cityData[locality] = [...(cityData[locality] || []), email];
      return {
        ...prev,
        [city]: cityData,
      };
    });

    setNewEmail(prev => ({ ...prev, [locality]: '' }));
    toast.success(`Added ${email} to ${locality} in ${city.split(',')[0]}`);
  };

  // ── Remove Email STRICTLY from the target locality alone ──────
  const handleRemoveEmail = (city, locality, emailToRemove) => {
    setData(prev => {
      const cityData = { ...(prev[city] || {}) };
      cityData[locality] = (cityData[locality] || []).filter(e => e !== emailToRemove);
      return {
        ...prev,
        [city]: cityData,
      };
    });
    toast.success(`Removed ${emailToRemove} from ${locality}`);
  };

  const handleResetToDefaults = () => {
    setCityList(PRESET_CITIES);
    const reset = buildInitialData(PRESET_CITIES);
    setData(reset);
    setActiveCity(PRESET_CITIES[0]);
    toast.success('Reset all cities and localities to default state!');
  };

  const getTotalEmailsCount = () => {
    let count = 0;
    Object.values(data).forEach(cityData => {
      Object.values(cityData || {}).forEach(emails => {
        count += (emails || []).length;
      });
    });
    return count;
  };

  const getCityEmailsCount = (city) => {
    let count = 0;
    Object.values(data[city] || {}).forEach(emails => {
      count += (emails || []).length;
    });
    return count;
  };

  const activeLocalities = Object.keys(data[activeCity] || {});

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">Community People Management</h1>
        <p className="page-subtitle">Manage locality email lists across cities for emergency civilian broadcasting</p>
        <div className="glow-line" />
      </div>

      {/* Summary Card */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Building size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cityList.length}</span> Cities Configured
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Users size={16} color="#00ff88" />
            <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{getTotalEmailsCount()}</span> Civilian Emails Registered
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleResetToDefaults}
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={13} /> Reset All Defaults
        </button>
      </div>

      {/* City Select Pills + Add City Button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', alignItems: 'center' }}>
        {cityList.map(city => {
          const isSelected = activeCity === city;
          const count = getCityEmailsCount(city);
          return (
            <button
              key={city}
              type="button"
              className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveCity(city)}
            >
              <MapPin size={14} />
              {city.split(',')[0]}
              <span className="badge" style={{ padding: '2px 6px', fontSize: '10px', background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)' }}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Add City Button */}
        <button
          id="add-city-pill-btn"
          type="button"
          className="btn"
          onClick={() => setShowAddCityModal(true)}
          style={{
            padding: '8px 16px', fontSize: '13px', borderRadius: '100px',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0, 212, 255, 0.12)', border: '1px dashed #00d4ff',
            color: 'var(--cyan)', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Add City
        </button>
      </div>

      {/* Inline Modal to Add City */}
      {showAddCityModal && (
        <form onSubmit={handleAddCity} className="glass-card" style={{ padding: '18px 24px', marginBottom: '24px', borderLeft: '3px solid var(--cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Add New City
            </span>
            <button type="button" onClick={() => setShowAddCityModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mumbai, India or Delhi..."
              value={cityNameInput}
              onChange={e => setCityNameInput(e.target.value)}
              autoFocus
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Add City
            </button>
          </div>
        </form>
      )}

      {/* Localities Grid for Selected City */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div className="card-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">
            <div className="card-icon-wrapper" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--cyan)' }}>
              <MapPin size={18} />
            </div>
            Localities in {activeCity}
          </div>

          {/* + Icon / Button for adding locality */}
          <button
            id="add-locality-header-btn"
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddLocalityModal(true)}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Add locality to this city"
          >
            <Plus size={15} /> Add Locality
          </button>
        </div>

        {/* Inline Modal to Add Locality */}
        {showAddLocalityModal && (
          <form onSubmit={handleAddLocality} className="glass-card-sm" style={{ padding: '16px 20px', marginBottom: '20px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>
                Add New Locality to {activeCity}
              </span>
              <button type="button" onClick={() => setShowAddLocalityModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Locality 6, Downtown, or Zone E..."
                value={locNameInput}
                onChange={e => setLocNameInput(e.target.value)}
                autoFocus
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Add Locality
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeLocalities.map(loc => {
            const emails = data[activeCity]?.[loc] || [];
            return (
              <div
                key={loc}
                className="glass-card-sm"
                style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    {loc}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {emails.length} email{emails.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Email Add Form */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder={`Add citizen email for ${loc}...`}
                    value={newEmail[loc] || ''}
                    onChange={e => setNewEmail({ ...newEmail, [loc]: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmail(activeCity, loc);
                      }
                    }}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAddEmail(activeCity, loc)}
                    style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {/* Emails List */}
                {emails.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', italic: 'true' }}>
                    No emails registered for this locality yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {emails.map(email => (
                      <div
                        key={email}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#1e293b',
                        }}
                      >
                        <Mail size={12} color="#0284c7" />
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(activeCity, loc, email)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '2px',
                            marginLeft: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove email"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
