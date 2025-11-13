import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

interface LocationState {
  projectId?: number;
}

const ResultPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  useEffect(() => {
    const loadProject = async () => {
      if (!state.projectId) {
        setIsLoading(false);
        return;
      }

      try {
        // Проверяем статус генерации
        const status = await api.getGenerationStatus(state.projectId);
        
        // Загружаем проект
        const projectData = await api.getProject(state.projectId);
        setProject(projectData.project);
        
        // Если генерация еще идет, проверяем периодически
        if (status.status === 'generating') {
          const interval = setInterval(async () => {
            try {
              const newStatus = await api.getGenerationStatus(state.projectId!);
              if (newStatus.status !== 'generating') {
                clearInterval(interval);
                const updatedProject = await api.getProject(state.projectId!);
                setProject(updatedProject.project);
              }
            } catch (e) {
              console.error('Error checking status:', e);
            }
          }, 3000); // Проверяем каждые 3 секунды

          return () => clearInterval(interval);
        }
      } catch (e) {
        console.error('Error loading project:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [state.projectId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDownload = async () => {
    if (!project?.model_path) {
      alert('Модель еще не готова');
      return;
    }

    setIsDownloading(true);
    try {
      const modelUrl = api.getFileUrl(project.model_path);
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = project.name ? `${project.name}.ply` : '3d-model.ply';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Ошибка скачивания файла');
    } finally {
      setIsDownloading(false);
    }
  };


  const modelUrl = project?.model_path ? api.getFileUrl(project.model_path) : null;
  const previewUrl = project?.preview_path ? api.getFileUrl(project.preview_path) : null;
  const isGenerating = project?.status === 'generating';

  return (
    <div className="page">
      <Header />

      <div className="page-content">
        <div className="container">
          <button 
            className="btn btn-outline" 
            onClick={handleBack}
            style={{ marginBottom: '24px' }}
          >
            Назад
          </button>
          
          {isLoading ? (
            <div className="empty-state">
              <h2>Загрузка...</h2>
            </div>
          ) : isGenerating ? (
            <div className="empty-state">
              <div style={{ 
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <h2>Генерация 3D модели...</h2>
              <p>Это может занять несколько минут</p>
            </div>
          ) : (
            <div className="success-message">
              <h2>Готово! 3D модель создана</h2>
              
              {previewUrl && (
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <img 
                    src={previewUrl} 
                    alt="3D Model Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
              )}
              
              <div style={{ marginTop: '32px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownload}
                  disabled={isDownloading || !modelUrl}
                  style={{ minWidth: '200px', marginRight: '12px' }}
                >
                  {isDownloading ? (
                    <>
                      <span style={{ 
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #6c757d',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></span>
                      Скачивание...
                    </>
                  ) : (
                    'Скачать 3D модель'
                  )}
                </button>
                {state.projectId && (
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/project/${state.projectId}`)}
                    style={{ minWidth: '200px' }}
                  >
                    Перейти к проекту
                  </button>
                )}
              </div>

              {!modelUrl && (
                <div style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>
                  Модель еще обрабатывается. Обновите страницу через несколько секунд.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResultPage;
