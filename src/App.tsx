import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardEmptyPage from './pages/DashboardEmptyPage';
import DashboardWithProjectsPage from './pages/DashboardWithProjectsPage';
import ProjectCreationPage from './pages/ProjectCreationPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PreviewPage from './pages/PreviewPage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={<MainPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/empty"
            element={
              <ProtectedRoute>
                <DashboardEmptyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/projects"
            element={
              <ProtectedRoute>
                <DashboardWithProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/create"
            element={
              <ProtectedRoute>
                <ProjectCreationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview"
            element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

