// Auth Button Component
// Displays sign-in/sign-out button based on auth state

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthButton.css';

const AuthButton = () => {
  const { user, signOut, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="auth-button">
        <div className="auth-loading">Loading...</div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="auth-button">
        <div className="auth-warning">
          ⚠️ Firebase not configured
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-button">
        <div className="user-info">
          <img
            src={user.photoURL || '/vite.svg'}
            alt={user.displayName}
            className="user-avatar"
          />
          <span className="user-name">{user.displayName}</span>
        </div>
        <button className="sign-out-btn" onClick={signOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-button">
      <Link to="/auth" className="sign-in-btn">Register</Link>
    </div>
  );
};

export default AuthButton;

