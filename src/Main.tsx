import { useEffect, useState, Suspense, lazy } from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import { GridRegular, Alert24Regular, DocumentText24Regular, ClipboardCheckmark24Regular, DataTrending24Regular, Handshake24Regular, PeopleTeam24Regular, Globe24Regular } from '@fluentui/react-icons';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './contexts/AuthContext';
import { fetchNotifications } from './store/slices/notificationSlice';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useSocket } from './hooks/useSocket';
import { SocketEvent } from './types/socket';

// Lazy load components
const AnnualCorporateScorecard = lazy(() => import('./pages/scorecards'));
const Teams = lazy(() => import('./pages/teams'));
const ManagePage = lazy(() => import('./pages/manage').then(module => ({ default: module.ManagePage })));
const OrganizationPerformance = lazy(() => import('./pages/organization_performance'));
const NotificationPage = lazy(() => import('./pages/notification'));
const MyPerformanceAgreement = lazy(() => import('./pages/my_performance_agreement'));
const MyPerformanceAssessment = lazy(() => import('./pages/my_performance_assessment'));
const Reports = lazy(() => import('./pages/reports'));

const iconSize = 24;

// Loading component for content
const ContentLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
    <div className="spinner"></div>
  </div>
);

function Main() {
  const [selectedTab, setSelectedTab] = useState('');
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const isAppOwner = user?.email === 'admin@siliconsoftwaresolutions.onmicrosoft.com';
  
  const selectedTabChanger = (tab: string) => {
    setSelectedTab(tab);
  }

  // Add socket subscription
  const { subscribe, unsubscribe } = useSocket(SocketEvent.NOTIFICATION, (data) => {
    dispatch(fetchNotifications());
  });

  useEffect(() => {
    dispatch(fetchNotifications());

    // Subscribe to notification events
    subscribe(SocketEvent.NOTIFICATION, (data) => {
      console.log(data, '----------');
      dispatch(fetchNotifications());
    });

    // Cleanup subscription
    return () => {
      unsubscribe(SocketEvent.NOTIFICATION);
    };
  }, [dispatch, subscribe, unsubscribe]);

  return (
    <Provider store={store}>
      <Layout selectedTabChanger={selectedTabChanger}>
        <Suspense fallback={<ContentLoader />}>
          {isAppOwner && (
            <ManagePage
              title="Manage Companies"
              icon={<GridRegular fontSize={iconSize} />}
              tabs={['Companies', 'Companies Super Users', 'Companies Licenses']}
              selectedTab={selectedTab}
            />
          )}
          <Reports
            title='Reports'
            icon={<DocumentText24Regular fontSize={iconSize} />}
            tabs={['Teams Performances', 'Teams Performance Assessments Completions', 'Teams Performance Agreements Completions', 'Teams Performance Assessments', 'Teams Performance Agreements']}
            selectedTab={selectedTab}
          />
          <MyPerformanceAssessment
            title='My Performance Assessment'
            icon={<ClipboardCheckmark24Regular fontSize={iconSize} />}
            tabs={['My Assessments', 'Team Performances']}
            selectedTab={selectedTab}
          />
          <MyPerformanceAgreement
            title='My Performance Agreement'
            icon={<Handshake24Regular fontSize={iconSize} />}
            tabs={['My Quarterly Targets']}
            selectedTab={selectedTab}
          />
          <OrganizationPerformance
            title='Organization Performance'
            icon={<DataTrending24Regular fontSize={iconSize} />}
            tabs={['Performance Evaluations', 'Organization Performance']}
            selectedTab={selectedTab}
          />
          <AnnualCorporateScorecard
            title="Annual Corporate Scorecard"
            icon={<Globe24Regular fontSize={iconSize} />}
            tabs={['Quarterly Targets', 'Annual Targets']}
            selectedTab={selectedTab}
          />
          <Teams
            title='Teams'
            icon={<PeopleTeam24Regular fontSize={iconSize} />}
            tabs={['Teams']}
            selectedTab={selectedTab}
          />
          <NotificationPage
            title='Notifications'
            icon={<Alert24Regular fontSize={iconSize} />}
            tabs={['Quarterly Targets', 'Performance Assessments']}
            selectedTab={selectedTab}
          />
        </Suspense>
      </Layout>
    </Provider>
  );
}

export default Main; 
