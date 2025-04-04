import React, { useState } from 'react';
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

const iconSize = 24;

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('');

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  // Define the main content with Layout and all pages
  const MainContent = () => (
    <Layout selectedTabChanger={handleTabChange}>
      <AnnualCorporateScorecard 
        title="Scorecards"
        icon={<BoardSplitRegular />}
        tabs={['My Scorecard', 'Team Scorecard']}
        selectedTab={selectedTab}
      />
      <Teams 
        title="Teams"
        icon={<PeopleTeamRegular />}
        tabs={['My Team', 'All Teams']}
        selectedTab={selectedTab}
      />
      <ManagePage 
        title="Manage"
        icon={<GridRegular />}
        tabs={['Companies', 'Companies Super Users', 'Companies Licenses']}
        selectedTab={selectedTab}
      />
    </Layout>
  );

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
                  <MainContent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scorecards" 
              element={
                <ProtectedRoute>
                  <AnnualCorporateScorecard 
                    title="Scorecards"
                    icon={<BoardSplitRegular />}
                    tabs={['My Scorecard', 'Team Scorecard']}
                    selectedTab={selectedTab}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teams" 
              element={
                <ProtectedRoute>
                  <Teams 
                    title="Teams"
                    icon={<PeopleTeamRegular />}
                    tabs={['My Team', 'All Teams']}
                    selectedTab={selectedTab}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage" 
              element={
                <ProtectedRoute>
                  <ManagePage 
                    title="Manage"
                    icon={<GridRegular />}
                    tabs={['Companies', 'Companies Super Users', 'Companies Licenses']}
                    selectedTab={selectedTab}
                  />
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
