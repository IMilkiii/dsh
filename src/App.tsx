import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardEmptyPage from './pages/DashboardEmptyPage';
import DashboardWithProjectsPage from './pages/DashboardWithProjectsPage';
import ProjectCreationPage from './pages/ProjectCreationPage';
import ResultPage from './pages/ResultPage';
import PreviewPage from './pages/PreviewPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/empty" element={
              <ProtectedRoute>
                <DashboardEmptyPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/with-projects" element={
              <ProtectedRoute>
                <DashboardWithProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/project/new" element={
              <ProtectedRoute>
                <ProjectCreationPage />
              </ProtectedRoute>
            } />
            <Route path="/project/preview" element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            } />
            <Route path="/project/result" element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
