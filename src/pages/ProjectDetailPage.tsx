import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editIsPublic, setEditIsPublic] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.getProject(Number(id));
        setProject(res.project);
        setEditName(res.project.name || '');
        setEditDescription(res.project.description || '');
        setEditIsPublic(res.project.is_public !== false);
      } catch (e: any) {
        setError(e?.message || 'Не удалось загрузить проект');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const previewImages: string[] = useMemo(() => {
    if (!project?.images) return [];
    return project.images.map((img: any) => api.getFileUrl(img.filePath));
  }, [project]);

  const resultFileUrl = useMemo(() => {
    if (!project?.resultFile) return '';
    return api.getFileUrl(project.resultFile);
  }, [project]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (!resultFileUrl) return;
    const link = document.createElement('a');
    link.href = resultFileUrl;
    link.download = project?.name ? `${project.name}.fbx` : 'model.fbx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(project?.name || '');
    setEditDescription(project?.description || '');
    setEditIsPublic(project?.is_public !== false);
  };

  const handleSave = async () => {
    if (!id || !project) return;
    
    setIsSaving(true);
    try {
      const updated = await api.updateProject(Number(id), {
        name: editName,
        description: editDescription,
        is_public: editIsPublic
      });
      setProject(updated.project || updated);
      setIsEditing(false);
    } catch (e: any) {
      alert('Ошибка сохранения: ' + (e?.message || 'Неизвестная ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page">
      <Header />

      <div className="page-content">
        <div className="container">
          <button className="btn btn-outline" onClick={handleBack} style={{ marginBottom: 16 }}>
            Назад
          </button>

          {isLoading ? (
            <div className="empty-state">
              <h2>Загрузка...</h2>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h2>{error}</h2>
            </div>
          ) : !project ? (
            <div className="empty-state">
              <h2>Проект не найден</h2>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
              <div>
                {isEditing ? (
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Название проекта</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Введите название"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Описание</label>
                      <textarea
                        className="form-input"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Введите описание"
                        rows={4}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={editIsPublic}
                          onChange={(e) => setEditIsPublic(e.target.checked)}
                        />
                        <span>Публичный проект</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={handleSave}
                        disabled={isSaving || !editName.trim()}
                      >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h1 style={{ margin: 0 }}>{project.name || 'Без названия'}</h1>
                      <button className="btn btn-outline" onClick={handleEdit} style={{ marginLeft: 16 }}>
                        Редактировать
                      </button>
                    </div>
                    <p style={{ color: '#6c757d' }}>{project.description || ''}</p>
                  </>
                )}

                {previewImages.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
                    {previewImages.map((src, idx) => (
                      <div key={idx} style={{ background: '#f8f9fa', borderRadius: 12, overflow: 'hidden', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={src} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: 24, marginTop: 16 }}>
                    <p>Нет превью изображений</p>
                  </div>
                )}
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#6c757d', fontSize: 13 }}>Статус</div>
                  <div style={{ fontWeight: 600 }}>{project.status || 'unknown'}</div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#6c757d', fontSize: 13 }}>Создан</div>
                  <div>{new Date(project.createdAt || project.created_at).toLocaleString()}</div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: '#6c757d', fontSize: 13 }}>Обновлён</div>
                  <div>{new Date(project.updatedAt || project.updated_at).toLocaleString()}</div>
                </div>

                <button className="btn btn-secondary" onClick={handleDownload} disabled={!resultFileUrl} style={{ width: '100%' }}>
                  Скачать результат
                </button>

                {!resultFileUrl && (
                  <div style={{ marginTop: 8, color: '#6c757d', fontSize: 13 }}>
                    Файл результата недоступен
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;


