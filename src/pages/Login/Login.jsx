import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import {
  Shield, User, Lock, Eye, EyeOff, AlertCircle, Droplets,
  Mail, UserPlus, LogIn, CheckCircle, Clock, ArrowLeft,
} from 'lucide-react';
import './Login.css';

// ── Mode: 'login' | 'signup' ─────────────────────────────────────────────
export default function Login() {
  const [mode, setMode] = useState('login');          // login | signup
  const [activeTab, setActiveTab] = useState('user'); // user | admin

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Signup fields
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Tab switch ────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    setPendingApproval(false);
    setLoginEmail(''); setLoginPassword('');
    setSignupFullName(''); setSignupEmail('');
    setSignupPassword(''); setSignupConfirm('');
  };

  // ── Switch mode ───────────────────────────────────────────
  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccessMsg('');
    setPendingApproval(false);
    setLoginEmail(''); setLoginPassword('');
    setSignupFullName(''); setSignupEmail('');
    setSignupPassword(''); setSignupConfirm('');
  };

  // ── Login handler ──────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email address and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(loginEmail.trim(), loginPassword, activeTab);
      login(res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Signup handler ─────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!signupFullName.trim()) { setError('Please enter your full name.'); return; }
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      setError('Please enter a valid email address.'); return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        full_name: signupFullName.trim(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        role: activeTab,
      });

      if (res?.status === 'pending') {
        setPendingApproval(true);
        setSuccessMsg(res?.message || `Your admin request has been submitted! An approval email was sent to ${signupEmail}.`);
      } else {
        const userObj = res?.user || {
          name: signupFullName.trim(),
          email: signupEmail.trim().toLowerCase(),
          role: activeTab,
        };
        login(userObj);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="login-root">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-blob blob1" />
        <div className="login-bg-blob blob2" />
        <div className="login-bg-blob blob3" />
        <div className="login-grid" />
      </div>

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Droplets size={32} color="#fff" />
          </div>
          <div>
            <h1 className="login-brand-name">HydroShield</h1>
            <p className="login-brand-sub">AI Flood Management System</p>
          </div>
        </div>

        <div className="login-card">
          {/* Tab Switcher (User / Admin) */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => switchTab('user')}
            >
              <User size={14} />
              User
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === 'admin' ? 'active admin' : ''}`}
              onClick={() => switchTab('admin')}
            >
              <Shield size={14} />
              Administrator
            </button>
            <div className={`login-tab-indicator ${activeTab === 'admin' ? 'right' : 'left'}`} />
          </div>



          {/* ── LOGIN FORM ─────────────────────────────────── */}
          {mode === 'login' && (
            <>
              <div className="login-header">
                <div className={`login-role-icon ${activeTab}`}>
                  {activeTab === 'admin' ? <Shield size={28} /> : <User size={28} />}
                </div>
                <h2 className="login-title">
                  {activeTab === 'admin' ? 'Administrator' : 'User Access'}
                </h2>
                <p className="login-desc">
                  {activeTab === 'admin'
                    ? 'Access to full HydroShield System'
                    : 'Access HydroShield'}
                </p>
              </div>

              <form className="login-form" onSubmit={handleLogin}>
                <div className="lf-group">
                  <label className="lf-label">Email Address</label>
                  <div className="lf-input-wrap">
                    <Mail size={15} className="lf-icon" />
                    <input
                      id="login-email"
                      type="email"
                      className="lf-input"
                      placeholder="user@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="lf-group">
                  <label className="lf-label">Password</label>
                  <div className="lf-input-wrap">
                    <Lock size={15} className="lf-icon" />
                    <input
                      id="login-password"
                      type={showLoginPwd ? 'text' : 'password'}
                      className="lf-input"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button type="button" className="lf-eye" onClick={() => setShowLoginPwd(v => !v)} tabIndex={-1}>
                      {showLoginPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="login-error">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button
                  id="login-submit-btn"
                  type="submit"
                  className={`login-btn ${activeTab}`}
                  disabled={loading}
                >
                  {loading ? <span className="login-spinner" /> : (activeTab === 'admin' ? <Shield size={16} /> : <User size={16} />)}
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="login-switch-hint">
                  Don't have an account?{' '}
                  <button type="button" className="login-link-btn" onClick={() => switchMode('signup')}>
                    Create one →
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── SIGNUP FORM ─────────────────────────────────── */}
          {mode === 'signup' && !pendingApproval && (
            <>
              <div className="login-header">
                <div className={`login-role-icon ${activeTab}`}>
                  {activeTab === 'admin' ? <Shield size={26} /> : <UserPlus size={26} />}
                </div>
                <h2 className="login-title">
                  {activeTab === 'admin' ? 'Create Admin Account' : 'Create User Account'}
                </h2>
                <p className="login-desc">
                  {activeTab === 'admin'
                    ? 'Sign up for full HydroShield Admin access.'
                    : 'Sign up to access flood monitoring.'}
                </p>
              </div>

              <form className="login-form" onSubmit={handleSignup}>
                {/* Full Name */}
                <div className="lf-group">
                  <label className="lf-label">Full Name</label>
                  <div className="lf-input-wrap">
                    <User size={15} className="lf-icon" />
                    <input
                      id="signup-fullname"
                      type="text"
                      className="lf-input"
                      placeholder="e.g. Arjun Kumar"
                      value={signupFullName}
                      onChange={e => setSignupFullName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="lf-group">
                  <label className="lf-label">Email Address</label>
                  <div className="lf-input-wrap">
                    <Mail size={15} className="lf-icon" />
                    <input
                      id="signup-email"
                      type="email"
                      className="lf-input"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Two password fields in a row */}
                <div className="lf-row">
                  <div className="lf-group">
                    <label className="lf-label">Password</label>
                    <div className="lf-input-wrap">
                      <Lock size={15} className="lf-icon" />
                      <input
                        id="signup-password"
                        type={showSignupPwd ? 'text' : 'password'}
                        className="lf-input"
                        placeholder="Min 6 chars"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className="lf-eye" onClick={() => setShowSignupPwd(v => !v)} tabIndex={-1}>
                        {showSignupPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="lf-group">
                    <label className="lf-label">Confirm</label>
                    <div className="lf-input-wrap">
                      <Lock size={15} className="lf-icon" />
                      <input
                        id="signup-confirm"
                        type={showConfirmPwd ? 'text' : 'password'}
                        className="lf-input"
                        placeholder="Repeat password"
                        value={signupConfirm}
                        onChange={e => setSignupConfirm(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className="lf-eye" onClick={() => setShowConfirmPwd(v => !v)} tabIndex={-1}>
                        {showConfirmPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="login-error">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button
                  id="signup-submit-btn"
                  type="submit"
                  className={`login-btn ${activeTab}`}
                  disabled={loading}
                >
                  {loading ? <span className="login-spinner" /> : <UserPlus size={16} />}
                  {loading
                    ? 'Creating Account...'
                    : (activeTab === 'admin' ? 'Create Admin Account' : 'Create User Account')}
                </button>

                <p className="login-switch-hint">
                  Already have an account?{' '}
                  <button type="button" className="login-link-btn" onClick={() => switchMode('login')}>
                    Sign in →
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── PENDING APPROVAL STATE ────────────────────── */}
          {mode === 'signup' && pendingApproval && (
            <div className="login-pending">
              <div className="login-pending-icon">
                <Clock size={36} color="#7c3aed" />
              </div>
              <h2 className="login-title" style={{ color: '#7c3aed' }}>Request Submitted!</h2>
              <p className="login-desc" style={{ marginBottom: '20px' }}>
                {successMsg}
              </p>
              <div className="login-pending-steps">
                <div className="lps-step done">
                  <CheckCircle size={15} color="#16a34a" />
                  <span>Account request submitted to database</span>
                </div>
                <div className="lps-step done">
                  <CheckCircle size={15} color="#16a34a" />
                  <span>Approval email sent to administrator</span>
                </div>
                <div className="lps-step pending">
                  <Clock size={15} color="#7c3aed" />
                  <span>Awaiting administrator approval…</span>
                </div>
                <div className="lps-step pending">
                  <Mail size={15} color="#94a3b8" />
                  <span>Confirmation email will be sent to you</span>
                </div>
              </div>
              <button
                type="button"
                className="login-btn user"
                style={{ marginTop: '20px' }}
                onClick={() => switchMode('login')}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
