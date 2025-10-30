import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth, googleProvider, getOrCreateRecaptcha } from '../firebase';
import './Auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPassword = (p) => typeof p === 'string' && p.length >= 8;

const Auth = () => {
  const [tab, setTab] = useState('google'); // google | email | phone
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // signin | signup

  // Phone form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const navigate = useNavigate();

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (e) {
      showToast(e?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!emailRegex.test(email)) {
      return showToast('Enter a valid email.');
    }
    if (mode === 'signup' && !strongPassword(password)) {
      return showToast('Password must be at least 8 characters.');
    }
    try {
      setLoading(true);
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (e) {
      showToast(e?.message || 'Email authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    if (!phone || phone.length < 8) return showToast('Enter a valid phone number with country code.');
    try {
      setLoading(true);
      const verifier = getOrCreateRecaptcha('recaptcha-container', 'invisible');
      const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(confirmationResult);
      showToast('OTP sent. Check your phone.', 'success');
    } catch (e) {
      showToast(e?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return showToast('Request OTP first.');
    if (!otp || otp.length < 6) return showToast('Enter the 6-digit OTP.');
    try {
      setLoading(true);
      await confirmation.confirm(otp);
      navigate('/dashboard');
    } catch (e) {
      showToast(e?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container glass">
        <div className="auth-header">
          <h1>Aero Velocity</h1>
          <p>Secure access to your F1 analytics</p>
        </div>

        <div className="tabs">
          <button className={`tab ${tab==='google'?'active':''}`} onClick={()=>setTab('google')}>Google</button>
          <button className={`tab ${tab==='email'?'active':''}`} onClick={()=>setTab('email')}>Email</button>
          <button className={`tab ${tab==='phone'?'active':''}`} onClick={()=>setTab('phone')}>Phone</button>
        </div>

        {tab === 'google' && (
          <div className="panel">
            <button className="primary-btn" onClick={handleGoogle} disabled={loading}>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>
          </div>
        )}

        {tab === 'email' && (
          <div className="panel">
            <div className="toggle">
              <span className={mode==='signin'?'on':''} onClick={()=>setMode('signin')}>Sign In</span>
              <span>/</span>
              <span className={mode==='signup'?'on':''} onClick={()=>setMode('signup')}>Sign Up</span>
            </div>
            <div className="form">
              <label>Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
              <label>Password</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Minimum 8 characters" />
              <button className="primary-btn" onClick={handleEmail} disabled={loading}>
                {loading ? (mode==='signup'?'Creating…':'Signing in…') : (mode==='signup'?'Create Account':'Sign In')}
              </button>
            </div>
          </div>
        )}

        {tab === 'phone' && (
          <div className="panel">
            <div id="recaptcha-container" />
            <div className="form">
              <label>Phone (with country code)</label>
              <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+91 98765 43210" />
              <div className="row">
                <button className="secondary-btn" onClick={requestOtp} disabled={loading}>Get OTP</button>
              </div>
              <label>Enter OTP</label>
              <input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="6-digit code" />
              <button className="primary-btn" onClick={verifyOtp} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        )}
      </div>
    </div>
  );
};

export default Auth;


