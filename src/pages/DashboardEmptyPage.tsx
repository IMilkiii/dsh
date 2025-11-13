import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardEmptyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNewProject = () => {
    navigate('/project/new');
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-content">
          <div className="header-logo"></div>
          <div className="header-actions">
            <div className="user-avatar" title={`Профиль: ${user?.email || 'Пользователь'}`}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="empty-state">
          <h2>У вас еще нет проектов, давайте сделаем новый.</h2>
          <p>Прикрепите от 1 изображения</p>
          <button className="btn btn-secondary" onClick={handleNewProject}>
            Новый проект
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmptyPage;


