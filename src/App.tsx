import React, { useState } from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards/AnnualCorporateScorecard';
import { AdminPanel } from './pages/admin/';
import { ManagePage } from './pages/manage';
import { BoardSplitRegular, GridRegular, PeopleTeamRegular } from '@fluentui/react-icons';
import { Provider } from 'react-redux';
import { store } from './store';

const iconSize = 24;

function App() {
  const [selectedTab, setSelectedTab] = useState('');
  const selectedTabChanger = (tab: string) => {
    setSelectedTab(tab);
  }

  return (
    <Provider store={store}>
      <Layout selectedTabChanger={selectedTabChanger}>
        {/* <AdminPanel /> */}
        <ManagePage title="Manage Companies" icon={<GridRegular fontSize={iconSize} />} tabs={['Companies', 'Users']} selectedTab={selectedTab} />
        <AnnualCorporateScorecard title="Annual Corporate Scorecard" icon={<PeopleTeamRegular fontSize={iconSize} />} tabs={['Annual', 'Quarterly']} selectedTab={selectedTab} />
        <AdminPanel title='Admin Panel' icon={<BoardSplitRegular fontSize={iconSize} />} tabs={[
          'Performance Contracting Periods',
          'Performance Assessments Periods',
          'Teams',
          'Performance Rating Scale'
        ]}
          selectedTab={selectedTab}
        />
      </Layout>
    </Provider>
  );
}

export default App; 