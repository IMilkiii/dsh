import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import api from '../services/api';
import './MainPage.css';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'name' | 'author'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем все публичные проекты при монтировании компонента
  useEffect(() => {
    loadProjects();
  }, [searchQuery, sortBy, order]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      // Загружаем все публичные проекты для социальной ленты
      const res = await api.getAllProjects({ q: searchQuery || undefined, sort: sortBy, order });
      setProjects(res.projects || []);
    } catch (e) {
      console.error('Ошибка загрузки проектов:', e);
      // Не показываем ошибку пользователю, просто пустой массив
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="main-page">
      <Header />

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="sort-dropdown" style={{ display: 'flex', gap: 8 }}>
            <select className="sort-btn" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="created_at">Сначала новые</option>
              <option value="updated_at">Недавно обновленные</option>
              <option value="name">По названию</option>
              <option value="author">По автору</option>
            </select>
            <select className="sort-btn" value={order} onChange={(e) => setOrder(e.target.value as any)}>
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>
          
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <main className="projects-section">
        <div className="projects-header">
          <h1 className="projects-title">
            {isAuthenticated ? 'Лента проектов' : 'Добро пожаловать в 3D-что-то'}
          </h1>
        </div>

        {!isAuthenticated && (
          <div className="welcome-section">
            <div className="welcome-content">
              <h2>Преобразуйте свои изображения в 3D-модели</h2>
              <p>Творите и создавайте элементы игр, объекты анимации и многое другое с нашим сервисом.</p>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Начать работу
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка проектов...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h3>Пока нет проектов</h3>
            <p>Будьте первым, кто поделится своим 3D-проектом!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleProjectClick(String(project.id))}
              >
                <div className="project-thumbnail">
                  <img 
                    src={project.thumbnail || '/placeholder.png'} 
                    alt={project.name || 'Проект'} 
                  />
                </div>
                <div className="project-info">
                  <div className="project-name">{project.name || 'Без названия'}</div>
                  <div className="project-author">
                    <span className="author-label">Автор:</span>
                    <span className="author-name">{project.user?.name || project.user?.email || 'Неизвестно'}</span>
                  </div>
                  <div className="project-date">
                    {new Date(project.created_at || project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
