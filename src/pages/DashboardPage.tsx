import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import api from '../services/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.getProjects();
        setProjects(res.projects || []);
      } catch (e) {
        setError('Не удалось загрузить проекты');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (projectId: number) => {
    const confirmed = window.confirm('Удалить проект? Действие необратимо.');
    if (!confirmed) return;
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (e) {
      alert('Ошибка удаления проекта');
    }
  };

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

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="page">
      <Header />

      <div className="dashboard-content">
        {isLoading ? (
          <div className="empty-state">
            <h2>Загрузка проектов...</h2>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>{error}</h2>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>Повторить</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h2>У вас еще нет проектов, давайте сделаем новый.</h2>
            <p>Прикрепите от 1 изображения</p>
            <button className="btn btn-secondary" onClick={handleNewProject}>
              Новый проект
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-header">
              <h1 className="dashboard-title">Ваши проекты</h1>
              <button className="btn btn-secondary" onClick={handleNewProject}>
                Новый проект
              </button>
            </div>

            <div className="projects-grid">
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  className="project-card hover-lift"
                  onClick={() => handleProjectClick(String(project.id))}
                >
                  <div className="project-thumbnail">
                    <img src={project.thumbnail || '/placeholder.png'} alt={project.name} />
                  </div>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-date">{new Date(project.created_at || project.createdAt).toLocaleDateString()}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}>Удалить</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
