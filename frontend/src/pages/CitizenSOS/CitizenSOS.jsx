import React, { useState, useRef } from 'react';
import { sosAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  AlertTriangle, Upload, MapPin, FileText,
  CheckCircle, Send, Image, Navigation
} from 'lucide-react';

export default function CitizenSOS() {
  const [name, setName]                   = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription]     = useState('');
  const [image, setImage]                 = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [location, setLocation]           = useState(null);
  const [locLoading, setLocLoading]       = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(null);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGetLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        toast.success('GPS location captured!');
      },
      () => {
        setLocLoading(false);
        toast.error('Could not get GPS location. Please allow location access.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { toast.error('Please describe the emergency'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      if (name.trim())          formData.append('name',    name.trim());
      if (contactNumber.trim()) formData.append('contact', contactNumber.trim());
      if (location) {
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
      }
      if (image) formData.append('image', image);

      const res = await sosAPI.submit(formData);
      setSubmitted(res?.data || { status: 'RECEIVED', message: 'Incident received and forwarded to Disaster Management Team' });
      toast.success('Emergency SOS submitted successfully!');
    } catch (e) {
      toast.error(`Submission failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div className="success-icon" style={{ margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="var(--status-safe)" />
          </div>
          <h2 style={{ fontFamily: 'Rajdhani', fontSize: '28px', color: 'var(--status-safe)', marginBottom: '8px' }}>
            Incident Received
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {submitted.message || 'Your emergency has been logged and forwarded to the Disaster Management Team.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Incident ID', value: submitted.id || 'N/A' },
              { label: 'Status', value: submitted.status || 'RECEIVED' },
              { label: 'Forwarded To', value: 'Disaster Management Team' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--glass-bg-light)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: 'var(--cyan)' }}>{value}</span>
              </div>
            ))}
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
          onClick={() => { setSubmitted(null); setName(''); setContactNumber(''); setDescription(''); setImage(null); setImagePreview(null); setLocation(null); }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container stagger-children">
      <div className="page-header">
        <h1 className="page-title">Citizen SOS Emergency Portal</h1>
        <p className="page-subtitle">Report flood emergencies — your report is instantly forwarded to disaster management</p>
        <div className="glow-line" />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon-wrapper"><AlertTriangle size={16} /></div>
              Emergency Report Form
            </div>
            <span className="badge badge-active"><span className="pulse-dot green" />LIVE</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="sos-name">
                Reporter Name *
              </label>
              <input
                id="sos-name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Contact Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="sos-contact">
                Contact Number *
              </label>
              <input
                id="sos-contact"
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={12} style={{ display: 'inline', marginRight: '6px' }} />
                Emergency Description *
              </label>
              <textarea
                className="form-input"
                id="sos-description"
                placeholder="Describe the emergency situation, flood level, number of people affected, immediate dangers..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">
                <Image size={12} style={{ display: 'inline', marginRight: '6px' }} />
                Upload Flood Image (optional)
              </label>
              <div
                className={`upload-zone ${imagePreview ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'relative', minHeight: imagePreview ? '200px' : '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={28} color="var(--text-muted)" />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click to upload or drag & drop</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PNG, JPG, WEBP up to 10MB</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} id="sos-image" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
            </div>

            {/* GPS Location */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={12} style={{ display: 'inline', marginRight: '6px' }} />
                GPS Location
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  id="get-location-btn"
                  className="btn btn-ghost"
                  onClick={handleGetLocation}
                  disabled={locLoading}
                  style={{ flexShrink: 0 }}
                >
                  <Navigation size={14} />
                  {locLoading ? 'Getting location...' : 'Share GPS Location'}
                </button>
                {location && (
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--cyan)' }}>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="submit-sos-btn"
              className="btn btn-danger"
              disabled={submitting}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
            >
              <Send size={18} />
              {submitting ? 'Submitting Emergency...' : '🚨 Submit Emergency SOS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
