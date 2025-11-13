import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { mockProjects } from '../data/mockData';

const DashboardWithProjectsPage: React.FC = () => {
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

  const handleProjectClick = (projectId: string) => {
    console.log('Opening project:', projectId);
  };

  return (
    <div className="page">
      <Header />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Ваши проекты</h1>
          <button className="btn btn-secondary" onClick={handleNewProject}>
            Новый проект
          </button>
        </div>

        <div className="projects-grid">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              className="project-card hover-lift"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="project-thumbnail">
                <img src={project.images[0]} alt={project.name} />
              </div>
              <div className="project-info">
                <div className="project-name">Название</div>
                <div className="project-date">Дата</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardWithProjectsPage;


