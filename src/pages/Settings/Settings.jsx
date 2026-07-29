import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../api';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, MapPin, LogOut, Navigation, Compass, Search } from 'lucide-react';

const PRESET_CITIES = [
  { name: 'Bengaluru, India',  lat: 12.9716, lng: 77.5946 },
  { name: 'Madurai, India',    lat: 9.9252,  lng: 78.1198 },
  { name: 'Coimbatore, India', lat: 11.0168, lng: 76.9558 },
  { name: 'Salem, India',      lat: 11.6643, lng: 78.1460 },
  { name: 'Anantapur, India',  lat: 14.6819, lng: 77.6006 },
  { name: 'Hyderabad, India',  lat: 17.3850, lng: 78.4867 },
  { name: 'Trivandram, India', lat: 8.5241,  lng: 76.9366 },
  { name: 'Chennai, India',    lat: 13.0827, lng: 80.2707 },
];

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

export default function Settings() {
  const { settings: appSettings, setSettings, loadSettings } = useApp();
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ ...appSettings });
  const [saving, setSaving]         = useState(false);
  const [gettingGps, setGettingGps] = useState(false);
  const [geocoding, setGeocoding]   = useState(false);

  useEffect(() => {
    setForm({ ...appSettings });
  }, [appSettings]);

  const findMatchingCity = (lat, lng) => {
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null;
    return PRESET_CITIES.find(c =>
      Math.abs(c.lat - lat) < 0.05 && Math.abs(c.lng - lng) < 0.05
    );
  };

  const handleCitySelect = (cityName) => {
    const city = PRESET_CITIES.find(c => c.name === cityName);
    if (city) {
      setForm(prev => ({
        ...prev,
        location_name: city.name,
        latitude: city.lat,
        longitude: city.lng,
      }));
      toast.success(`Selected ${city.name} (${city.lat}, ${city.lng})`);
    } else {
      setForm(prev => ({ ...prev, location_name: cityName }));
    }
  };

  // ── Geocode custom entered city name ────────────────────────
  const handleLookupCityCoordinates = async () => {
    const name = form.location_name?.trim();
    if (!name) {
      toast.error('Please enter a city name to find coordinates.');
      return;
    }

    setGeocoding(true);
    toast.loading(`Finding coordinates for "${name}"...`, { id: 'geocode' });

    try {
      // 1. OpenWeather Direct Geocoding API
      const owRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(name)}&limit=1&appid=${OPENWEATHER_KEY}`);
      const owData = await owRes.json();

      if (owData && owData.length > 0) {
        const { lat, lon, name: city, country } = owData[0];
        const formattedName = `${city}, ${country}`;
        const finalLat = parseFloat(lat.toFixed(4));
        const finalLng = parseFloat(lon.toFixed(4));

        setForm(prev => ({
          ...prev,
          location_name: formattedName,
          latitude: finalLat,
          longitude: finalLng,
        }));
        toast.success(`Found coordinates: ${formattedName} (${finalLat}, ${finalLng})`, { id: 'geocode' });
        return;
      }

      // 2. Fallback to OpenStreetMap Nominatim API
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1`);
      const nomData = await nomRes.json();

      if (nomData && nomData.length > 0) {
        const finalLat = parseFloat(parseFloat(nomData[0].lat).toFixed(4));
        const finalLng = parseFloat(parseFloat(nomData[0].lon).toFixed(4));
        const formattedName = nomData[0].display_name.split(',')[0] + ', India';

        setForm(prev => ({
          ...prev,
          location_name: formattedName,
          latitude: finalLat,
          longitude: finalLng,
        }));
        toast.success(`Found coordinates: ${formattedName} (${finalLat}, ${finalLng})`, { id: 'geocode' });
        return;
      }

      toast.error(`Could not find coordinates for "${name}". Please enter latitude & longitude manually.`, { id: 'geocode' });
    } catch (e) {
      console.error(e);
      toast.error(`Geocoding failed: ${e.message}`, { id: 'geocode' });
    } finally {
      setGeocoding(false);
    }
  };

  // ── GPS Current Location Handler ─────────────────────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser GPS / Geolocation is not supported on this device.');
      return;
    }

    setGettingGps(true);
    toast.loading('Detecting current GPS coordinates... Please allow location permission in browser.', { id: 'gps' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));

        // Reverse geocode lat, lng to resolved city name
        let cityName = `${lat}, ${lng}`;
        try {
          const revRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHER_KEY}`);
          const revData = await revRes.json();
          if (revData && revData.length > 0) {
            const { name, country } = revData[0];
            cityName = `${name}, ${country}`;
          } else {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const nomData = await nomRes.json();
            if (nomData && nomData.address) {
              const city = nomData.address.city || nomData.address.town || nomData.address.village || nomData.address.state || 'Current Location';
              cityName = `${city}, ${nomData.address.country || 'India'}`;
            }
          }
        } catch (e) {
          console.error(e);
        }

        setForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location_name: cityName,
        }));

        toast.success(`GPS Location Acquired: ${cityName} (${lat}, ${lng})`, { id: 'gps' });
        setGettingGps(false);
      },
      (error) => {
        console.error(error);
        let errMsg = 'Failed to get GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = 'GPS Permission Denied. Please enable location permission in your browser address bar.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = 'GPS location unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errMsg = 'GPS location request timed out.';
        }
        toast.error(errMsg, { id: 'gps' });
        setGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleLatChange = (val) => {
    const num = isNaN(val) ? '' : val;
    setForm(prev => {
      const match = findMatchingCity(num, prev.longitude);
      return {
        ...prev,
        latitude: num,
        location_name: match ? match.name : prev.location_name,
      };
    });
  };

  const handleLngChange = (val) => {
    const num = isNaN(val) ? '' : val;
    setForm(prev => {
      const match = findMatchingCity(prev.latitude, num);
      return {
        ...prev,
        longitude: num,
        location_name: match ? match.name : prev.location_name,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(form);
      setSettings(form);
      await loadSettings();
      toast.success(`Location set to ${form.location_name} (${form.latitude}, ${form.longitude})`);
      navigate('/'); // Navigate to Dashboard after saving settings
    } catch (e) {
      toast.error(`Failed to save location settings: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure monitoring location coordinates and telemetry refresh interval</p>
        <div className="glow-line" />
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><MapPin size={16} /></div>
              Location Configuration
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Location Name Field + Geocode Search Button */}
            <div className="form-group">
              <label className="form-label" htmlFor="location-name">Location Name</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="location-name"
                  type="text"
                  className="form-input"
                  value={form.location_name ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, location_name: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLookupCityCoordinates();
                    }
                  }}
                  placeholder="e.g. Mumbai, Kolkata, New York..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLookupCityCoordinates}
                  disabled={geocoding}
                  style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                  title="Find latitude & longitude for this city"
                >
                  <Search size={14} className={geocoding ? 'spinning' : ''} />
                  {geocoding ? 'Finding...' : 'Find Coordinates'}
                </button>
              </div>
            </div>

            {/* Latitude Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="any"
                className="form-input"
                value={form.latitude ?? ''}
                onChange={e => handleLatChange(parseFloat(e.target.value))}
                placeholder="12.9716"
              />
            </div>

            {/* Longitude Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="any"
                className="form-input"
                value={form.longitude ?? ''}
                onChange={e => handleLngChange(parseFloat(e.target.value))}
                placeholder="77.5946"
              />
            </div>

            {/* GPS Current Location Option — Placed BEFORE Refresh Interval */}
            <div className="glass-card-sm" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Rajdhani', fontSize: '15px', fontWeight: 700, color: 'var(--cyan)' }}>
                  <Navigation size={16} /> Use Current GPS Location
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Enable browser GPS to automatically fill current latitude, longitude & city name
                </div>
              </div>
              <button
                id="use-current-location-btn"
                type="button"
                className="btn btn-primary"
                onClick={handleUseCurrentLocation}
                disabled={gettingGps}
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Compass size={14} className={gettingGps ? 'spinning' : ''} />
                {gettingGps ? 'Acquiring GPS...' : 'Detect Current Location'}
              </button>
            </div>

            {/* Refresh Interval */}
            <div className="form-group">
              <label className="form-label" htmlFor="refresh-interval">Telemetry Refresh Interval (seconds)</label>
              <input
                id="refresh-interval"
                type="number"
                className="form-input"
                value={form.refresh_interval_seconds ?? 30}
                onChange={e => setForm(prev => ({ ...prev, refresh_interval_seconds: parseInt(e.target.value, 10) || 30 }))}
                placeholder="30"
              />
            </div>

            {/* Quick City Pill Shortcuts */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Quick Select City Shortcuts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PRESET_CITIES.map(city => {
                  const isSelected = form.location_name === city.name;
                  return (
                    <button
                      key={city.name}
                      type="button"
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '100px' }}
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <MapPin size={12} />
                      {city.name.split(',')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="save-settings-btn"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px', fontSize: '15px' }}
            >
              <Save size={16} />
              {saving ? 'Saving Settings...' : 'Save Location Configuration'}
            </button>
          </div>
        </div>

        {/* Danger Zone — Logout (Middle aligned) */}
        <div className="glass-card" style={{ padding: '28px', marginTop: '20px', borderTop: '2px solid #fecaca', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>
              Sign Out
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              End your current session and return to the login screen.
            </div>
          </div>
          <button
            id="logout-btn"
            className="btn"
            onClick={handleLogout}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 28px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', color: '#dc2626', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s', margin: '0 auto',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; }}
            onMouseOut={e  => { e.currentTarget.style.background = '#fef2f2'; }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
