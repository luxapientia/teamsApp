import { useEffect, useState } from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards';
import { ManagePage } from './pages/manage';
import { GridRegular, Alert24Regular, LearningApp24Regular, DocumentText24Regular, ClipboardCheckmark24Regular, DataTrending24Regular, Handshake24Regular, PeopleTeam24Regular, Globe24Regular, Home24Regular } from '@fluentui/react-icons';
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
import { fetchTeams, fetchTeamOwner } from './store/slices/teamsSlice';
import { api } from './services/api';
import Dashboard from './pages/dashboard';
import EmployeeDevPlan from './pages/employee_dev_plan';
import TeamsPage from './pages/teams';
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
  const [isDevMember, setIsDevMember] = useState(false);
  const [TeamOwnerStatus, setTeamOwnerStatus] = useState(false);

  // Separate effect for isDevMember
  useEffect(() => {
    if (user) {
      setIsDevMember(!!user.isDevMember);
    }
  }, [user]);

  // Separate effect for team owner status
  useEffect(() => {
    const fetchTeamOwnerFromDB = async () => {
      if (user?.id) {
        try {
          const teamInfo = await api.get(`/users/is_team_owner/${user.id}`);
          const result = teamInfo.data.data;
          setTeamOwnerStatus(result.isTeamOwner);
        } catch (error) {
          console.error('Error fetching team owner:', error);
          setTeamOwnerStatus(false);
        }
      }
    };
    fetchTeamOwnerFromDB();
  }, [user?.id]);

  return (
    <Layout selectedTabChanger={selectedTabChanger}>
      {(TeamOwnerStatus || isAppOwner || isSuperUser) && <Dashboard
        title="Dashboard"
        icon={<Home24Regular fontSize={iconSize} />}
        tabs={['Dashboard']}
        selectedTab={selectedTab}
      />}
      <NotificationPage
        title="Notifications"
        icon={<Alert24Regular fontSize={iconSize} />}
        tabs={[]}
        selectedTab={selectedTab}
      />
      {<EmployeeDevPlan
        title="Employee Development Plan"
        icon={<LearningApp24Regular fontSize={iconSize} />}
        tabs={(isSuperUser || isAppOwner) ?
          (isDevMember ?
            ['Organization Development Team', 'Enable Employees Development', 'Training & Courses Management', 'Annual Organization Development Plans', 'Employees Training', 'My Training Dashboard'] :
            ['Organization Development Team', 'My Training Dashboard']) :
          (isDevMember ?
            ['Enable Employees Development', 'Training & Courses Management', 'Annual Organization Development Plans', 'Employees Training', 'My Training Dashboard'] :
            ['My Training Dashboard'])}
        selectedTab={selectedTab}
      />}
      <MyPerformanceAssessment
        title="My Performance Assessment"
        icon={<ClipboardCheckmark24Regular fontSize={iconSize} />}
        tabs={TeamOwnerStatus ?
          (isAppOwner || isSuperUser ?
            ['My Assessments', 'My Performances', 'Team Performances', 'Manage Performance Assessment'] :
            ['My Assessments', 'My Performances', 'Team Performances']
          ) :
          (isAppOwner || isSuperUser ?
            ['My Assessments', 'My Performances', 'Manage Performance Assessment'] :
            ['My Assessments', 'My Performances']
          )}
        selectedTab={selectedTab}
      />
      <MyPerformanceAgreement
        title="My Performance Agreement"
        icon={<Handshake24Regular fontSize={iconSize} />}
        tabs={isAppOwner || isSuperUser ?
          ['My Performance Agreements', 'Manage Performance Agreement'] :
          ['My Performance Agreements']}
        selectedTab={selectedTab}
      />
      {(isAppOwner || isSuperUser) && (
        <OrganizationPerformance
          title="Organization Performance"
          icon={<DataTrending24Regular fontSize={iconSize} />}
          tabs={['Performance Evaluations', 'Organization Performance']}
          selectedTab={selectedTab}
        />)}
      {(isAppOwner || isSuperUser) && (
        <AnnualCorporateScorecard
          title="Annual Corporate Scorecard"
          icon={<Globe24Regular fontSize={iconSize} />}
          tabs={['Quarterly Corporate Scorecards', 'Annual Corporate Scorecards']}
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
        <TeamsPage
          title='Teams'
          icon={<PeopleTeam24Regular fontSize={iconSize} />}
          tabs={['Teams', 'Super User']}
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
