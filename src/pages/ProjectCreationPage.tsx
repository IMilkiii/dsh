import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '../hooks/useFileUpload';
import Header from '../components/Header';
import api from '../services/api';

const ProjectCreationPage: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [creationMode, setCreationMode] = useState<'images' | 'text'>('images');
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const {
    uploadedImages,
    isUploading,
    addImages,
    removeImage,
    canAddMore,
    hasImages
  } = useFileUpload();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    addImages(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };


  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert('Пожалуйста, введите название проекта');
      return;
    }

    if (creationMode === 'images' && !hasImages) {
      alert('Пожалуйста, загрузите хотя бы одно изображение');
      return;
    }

    if (creationMode === 'text' && !textInput.trim()) {
      alert('Пожалуйста, введите текст для генерации');
      return;
    }

    setIsProcessing(true);

    try {
      let preview;
      
      if (creationMode === 'images') {
        // Генерация предпросмотра по первой картинке
        const firstFile = uploadedImages[0].file;
        preview = await api.generatePreview(firstFile);
      } else {
        // Генерация предпросмотра по тексту
        preview = await api.generateTextPreview(textInput);
      }

      // Переходим на страницу предпросмотра с данными
      navigate('/project/preview', { state: { 
        previewUrl: preview.previewUrl, 
        projectName,
        is_public: isPublic,
        creationMode,
        images: creationMode === 'images' ? uploadedImages.map(i => i.file) : [],
        textInput: creationMode === 'text' ? textInput : ''
      }});
    } catch (e) {
      console.error('Ошибка генерации предпросмотра:', e);
      const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
      alert(`Не удалось выполнить предпросмотр: ${errorMessage}. Попробуйте еще раз.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUploadSlot = (index: number) => {
    const image = uploadedImages[index];
    
    return (
      <div
        key={index}
        className={`upload-slot ${image ? 'has-image' : ''}`}
        onClick={() => !image && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {image ? (
          <>
            <img src={image.preview} alt={`Upload ${index + 1}`} />
            <button
              className="upload-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(image.id);
              }}
            >
              ×
            </button>
          </>
        ) : (
          <div className="upload-placeholder">
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
            <div>Загрузить изображение</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <Header showBackButton={true} onBackClick={handleBack} />

      <div className="page-content">
        <div className="container">
          <div style={{ display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Левая часть - загрузка изображений или ввод текста */}
            <div style={{ flex: 1 }}>
              {/* Переключатель режимов */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button
                    className={`btn ${creationMode === 'images' ? 'btn-secondary' : 'btn-outline'}`}
                    onClick={() => setCreationMode('images')}
                  >
                    📷 Изображения
                  </button>
                  <button
                    className={`btn ${creationMode === 'text' ? 'btn-secondary' : 'btn-outline'}`}
                    onClick={() => setCreationMode('text')}
                  >
                    📝 Текст
                  </button>
                </div>
              </div>

              {creationMode === 'images' ? (
                <div className="upload-grid">
                  {[0, 1, 2, 3].map(renderUploadSlot)}
                </div>
              ) : (
                <div className="card">
                  <div className="form-group">
                    <label className="form-label" htmlFor="textInput">
                      Описание для генерации 3D-модели
                    </label>
                    <textarea
                      id="textInput"
                      className="form-input"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Опишите, какую 3D-модель вы хотите создать. Например: 'Красный спортивный автомобиль', 'Деревянный дом с садом', 'Робот-помощник' и т.д."
                      rows={8}
                      style={{ resize: 'vertical', minHeight: '200px' }}
                    />
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      Чем подробнее описание, тем лучше результат
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Правая часть - форма */}
            <div style={{ flex: 0, minWidth: '300px' }}>
              <div className="card">
                <div className="form-group">
                  <label className="form-label" htmlFor="projectName">Название проекта</label>
                  <input
                    type="text"
                    id="projectName"
                    className="form-input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Введите название проекта"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label" htmlFor="visibility">Публикация</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="visibility"
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <span>{isPublic ? 'Публичный проект — будет виден в ленте' : 'Приватный проект — не будет публиковаться'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  {creationMode === 'images' && (
                    <button
                      className="btn btn-outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canAddMore || isUploading}
                    >
                      {isUploading ? 'Загрузка...' : 'Добавить'}
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={handleCreateProject}
                    disabled={
                      !projectName.trim() || 
                      (creationMode === 'images' && !hasImages) || 
                      (creationMode === 'text' && !textInput.trim()) || 
                      isProcessing
                    }
                  >
                    {isProcessing ? 'Обработка...' : 'Создать'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <div style={{ 
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '16px', color: '#666' }}>
                {creationMode === 'images' 
                  ? 'Обрабатываем ваши изображения...' 
                  : 'Генерируем 3D-модель по вашему описанию...'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectCreationPage;
