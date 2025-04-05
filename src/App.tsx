import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ConsentPage } from './components/ConsentPage';
import Layout from './layouts/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Login } from './pages/auth/Login';
import { Unauthorized } from './pages/auth/Unauthorized';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards';
import Teams from './pages/teams';
import { ManagePage } from './pages/manage';
import { BoardSplitRegular, GridRegular, PeopleTeamRegular } from '@fluentui/react-icons';
import { ToastProvider } from './contexts/ToastContext';
import Main from './Main';
import { initializeTeams } from './utils/teamsUtils';

const App: React.FC = () => {
  useEffect(() => {
    const initTeams = async () => {
      try {
        await initializeTeams();
      } catch (error) {
        console.error('Teams initialization failed:', error);
      }
    };

    initTeams();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth-end" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App; 
