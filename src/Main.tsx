import React, { useEffect, useState } from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards';
import Teams from './pages/teams';
import { ManagePage } from './pages/manage';
import { BoardSplitRegular, GridRegular, PeopleTeamRegular } from '@fluentui/react-icons';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './contexts/AuthContext';

const iconSize = 24;

function Main() {
  const [selectedTab, setSelectedTab] = useState('');
  const { user } = useAuth();
  const isAppOwner = user?.email === 'admin@siliconsoftwaresolutions.onmicrosoft.com';
  console.log(isAppOwner,'dffd')
  const selectedTabChanger = (tab: string) => {
    setSelectedTab(tab);
  }

  return (
    <Provider store={store}>
      <Layout selectedTabChanger={selectedTabChanger}>
        {/* <AdminPanel /> */}
        {isAppOwner && (
          <ManagePage 
            title="Manage Companies" 
            icon={<GridRegular fontSize={iconSize} />} 
            tabs={['Companies', 'Companies Super Users', 'Companies Licenses']} 
            selectedTab={selectedTab} 
          />
        )}
        <AnnualCorporateScorecard 
          title="Annual Corporate Scorecard" 
          icon={<PeopleTeamRegular fontSize={iconSize} />} 
          tabs={['Quarterly Targets', 'Annual Targets']} 
          selectedTab={selectedTab} 
        />
        <Teams 
          title='Teams' 
          icon={<BoardSplitRegular fontSize={iconSize} />} 
          tabs={['Teams']}
          selectedTab={selectedTab}
        />
      </Layout>
    </Provider>
  );
}

export default Main; 