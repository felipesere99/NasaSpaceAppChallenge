import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <h1 className="brand-title">NASA Weather</h1>
        </div>

        <nav className="header-nav">
          {user ? (
            <>
              <button 
                className="auth-btn profile-btn" 
                onClick={handleProfileClick}
                title={`Profile - ${user.username}`}
              >
                <User size={18} />
                <span className="username">{user.username}</span>
              </button>
              <button 
                className="auth-btn logout-btn" 
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Salir
              </button>
            </>
          ) : (
            <button 
              className="auth-btn login-btn" 
              onClick={() => navigate('/login')}
            >
              <LogIn size={18} />
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
