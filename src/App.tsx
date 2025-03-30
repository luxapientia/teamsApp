import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Unauthorized } from './pages/auth/Unauthorized';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards';
import Teams from './pages/teams';
import { ManagePage } from './pages/manage';
import { BoardSplitRegular, GridRegular, PeopleTeamRegular } from '@fluentui/react-icons';
import { Provider } from 'react-redux';
import { store } from './store';
import Main from './Main';
import { ToastProvider } from './contexts/ToastContext';

const iconSize = 24;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/main"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App; 
