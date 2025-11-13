import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, onBackClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateProfile } = useAuth();

  const handlePersonalAccount = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="unified-header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <button className="back-btn" onClick={handleBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Назад
            </button>
          )}
          
          <div className="logo-section">
            <div className="logo-placeholder" onClick={() => navigate('/')}>
              <span>3D-что-то</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="header-icon-btn settings-btn" title="Настройки" onClick={async () => {
            if (!isAuthenticated) return;
            const current = user?.name || '';
            const next = window.prompt('Ваше имя (для отображения):', current);
            if (next === null) return;
            try {
              await updateProfile({ name: next.trim() || null });
            } catch (e) {
              alert('Не удалось сохранить имя');
            }
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
          </button>
          
          <button 
            className="personal-account-btn"
            onClick={handlePersonalAccount}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {isAuthenticated ? 'Личный кабинет' : 'Войти'}
          </button>
          
          {isAuthenticated && (
            <button className="logout-btn" onClick={handleLogout} title="Выйти">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
          
          <button className="header-icon-btn menu-btn" title="Меню">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
