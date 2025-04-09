import { useEffect, useState } from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards';
import Teams from './pages/teams';
import { ManagePage } from './pages/manage';
import { GridRegular, Alert24Regular, DocumentText24Regular, ClipboardCheckmark24Regular, DataTrending24Regular, Handshake24Regular, PeopleTeam24Regular, Globe24Regular, Home24Regular } from '@fluentui/react-icons';
import { useAuth } from './contexts/AuthContext';
import OrganizationPerformance from './pages/organization_performance';
import NotificationPage from './pages/notification';
import MyPerformanceAgreement from './pages/my_performance_agreement';
import MyPerformanceAssessment from './pages/my_performance_assessment';
import Reports from './pages/reports';
import { fetchNotifications } from './store/slices/notificationSlice';
import { useAppDispatch } from './hooks/useAppDispatch';
import { fetchAnnualTargets } from './store/slices/scorecardSlice';
import { useSocket } from './hooks/useSocket';
import { SocketEvent } from './types/socket';
import { fetchTeams } from './store/slices/teamsSlice';
import Dashboard from './pages/dashboard';
const iconSize = 24;

function Main() {
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const selectedTabChanger = (tab: string) => {
    setSelectedTab(tab);
  }

  // Add socket subscription
  const { subscribe, unsubscribe } = useSocket(SocketEvent.NOTIFICATION, (data) => {
    dispatch(fetchNotifications());
  });

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchAnnualTargets());
    dispatch(fetchTeams(user?.tenantId));
    // Subscribe to notification events
    subscribe(SocketEvent.NOTIFICATION, (data) => {
      dispatch(fetchNotifications());
    });

    // Cleanup subscription
    return () => {
      unsubscribe(SocketEvent.NOTIFICATION);
    };
  }, [dispatch, subscribe, unsubscribe]);

  const isSuperUser = user?.role === 'SuperUser';
  const isAppOwner = user?.email === process.env.REACT_APP_OWNER_EMAIL;

  return (
    <Layout selectedTabChanger={selectedTabChanger}>
      <Dashboard
        title="Dashboard"
        icon={<Home24Regular fontSize={iconSize} />}
        tabs={['Dashboard']}
        selectedTab={selectedTab}
      />
      <NotificationPage
        title="Notifications"
        icon={<Alert24Regular fontSize={iconSize} />}
        tabs={[]}
        selectedTab={selectedTab}
      />
      <MyPerformanceAssessment
        title="My Performance Assessment"
        icon={<ClipboardCheckmark24Regular fontSize={iconSize} />}
        tabs={['My Assessments', 'Team Performances']}
        selectedTab={selectedTab}
      />
      <MyPerformanceAgreement
        title="My Performance Agreement"
        icon={<Handshake24Regular fontSize={iconSize} />}
        tabs={['My Quarterly Targets']}
        selectedTab={selectedTab}
      />
      <OrganizationPerformance
        title="Organization Performance"
        icon={<DataTrending24Regular fontSize={iconSize} />}
        tabs={['Performance Evaluations', 'Organization Performance']}
        selectedTab={selectedTab}
      />
      {(isAppOwner || isSuperUser) && (
        <AnnualCorporateScorecard
          title="Annual Corporate Scorecard"
          icon={<DataTrending24Regular fontSize={iconSize} />}
          tabs={['Annual Corporate Scorecard']}
          selectedTab={selectedTab}
        />
      )}
      {(isAppOwner || isSuperUser) && (
        <Reports
          title='Reports'
          icon={<DocumentText24Regular fontSize={iconSize} />}
          tabs={['Teams Performances', 'Teams Performance Assessments Completions', 'Teams Performance Agreements Completions', 'Teams Performance Assessments', 'Teams Performance Agreements']}
          selectedTab={selectedTab}
        />
      )}
      {(isAppOwner || isSuperUser) && (
        <Teams
          title='Teams'
          icon={<PeopleTeam24Regular fontSize={iconSize} />}
          tabs={['Teams']}
          selectedTab={selectedTab}
        />
      )}
      {isAppOwner && (
        <ManagePage
          title="Manage Companies"
          icon={<GridRegular fontSize={iconSize} />}
          tabs={['Companies', 'Companies Super Users', 'Companies Licenses']}
          selectedTab={selectedTab}
        />
      )}
    </Layout>
  );
}

export default Main; 
