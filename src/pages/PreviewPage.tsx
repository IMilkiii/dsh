import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LocationState {
  previewUrl: string;
  projectName: string;
  is_public?: boolean;
  creationMode?: 'images' | 'text';
  images: File[];
  textInput?: string;
}

const PreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [previewUrl, setPreviewUrl] = useState<string>(state.previewUrl);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleDislike = async () => {
    setIsBusy(true);
    try {
      let res;
      if (state.creationMode === 'text' && state.textInput) {
        // Повторная генерация предпросмотра из текста
        res = await api.generateTextPreview(state.textInput);
      } else if (state.images && state.images.length > 0) {
        // Повторная генерация предпросмотра по первой картинке
        res = await api.generatePreview(state.images[0]);
      } else {
        throw new Error('Нет данных для генерации');
      }
      setPreviewUrl(res.previewUrl);
    } catch (e) {
      alert('Не удалось сгенерировать предпросмотр заново');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLike = async () => {
    setIsBusy(true);
    try {
      // 1) Создаем проект
      const created = await api.createProject({ 
        name: state.projectName, 
        is_public: state.is_public,
        text_input: state.textInput || undefined
      });
      const projectId = created.project.id ?? created.projectId ?? created.id;

      // 2) Загружаем изображения в проект (только если есть изображения)
      let imagePath = null;
      if (state.images && state.images.length > 0) {
        const uploadResult = await api.uploadProjectImages(projectId, state.images);
        // Берем путь к первому загруженному изображению
        if (uploadResult.files && uploadResult.files.length > 0) {
          imagePath = uploadResult.files[0].path;
        }
      }

      // 3) Запускаем генерацию 3D модели через SHAP-E
      await api.generateModel(projectId, {
        imagePath: imagePath || undefined,
        prompt: state.textInput || undefined,
        generationType: state.creationMode === 'text' ? 'text' : state.creationMode === 'images' ? 'image' : 'both'
      });

      // 4) Переходим на страницу результата с ID проекта
      navigate('/project/result', { state: { projectId } });
    } catch (e) {
      console.error('Ошибка создания проекта:', e);
      const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
      alert(`Не удалось создать проект: ${errorMessage}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleBack = () => navigate('/project/new');

  return (
    <div className="page">
      <header className="header">
        <div className="header-content">
          <div className="header-logo"></div>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleBack}>Назад</button>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 style={{ marginBottom: 16 }}>
            {state.creationMode === 'text' 
              ? 'Вам нравится сгенерированная 3D-модель по вашему описанию?' 
              : 'Вам нравится сгенерированная 3D-модель?'
            }
          </h2>
          <div className="card" style={{ padding: 16 }}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#666' }}>Нет предпросмотра</div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={handleDislike} disabled={isBusy}>
                Не нравится — сгенерировать снова
              </button>
              <button className="btn btn-secondary" onClick={handleLike} disabled={isBusy}>
                Нравится — создать проект
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;


