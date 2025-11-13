import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register, isAuthenticated, error, clearError } = useAuth();

  // Перенаправление если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Очистка ошибок при смене режима
  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (error) {
      // Ошибка уже обработана в контексте
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeToggle = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <div className="login-hero-content">
          <h1>3D-что-то</h1>
          <p>
            Преобразуйте свои изображения в 3D-модели. Творите и создавайте элементы игр, 
            объекты анимации и многое другое с нашим сервисом.
          </p>
        </div>
      </div>
      
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
          
          {error && (
            <div className="error-message" style={{ 
              color: '#e74c3c', 
              backgroundColor: '#fdf2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Почта</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              minLength={6}
            />
            {!isLogin && (
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Минимум 6 символов
              </small>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
          
          <div className="form-links">
            <a href="#" onClick={(e) => { e.preventDefault(); handleModeToggle(); }}>
              {isLogin ? 'Регистрация' : 'Вход'}
            </a>
            {isLogin && (
              <a href="#" onClick={(e) => e.preventDefault()}>
                Забыли пароль?
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
