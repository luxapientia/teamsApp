import React from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards/AnnualCorporateScorecard';
import { AdminPanel } from './pages/admin/';
import { ManagePage } from './pages/manage';
import { GridRegular, PeopleTeamRegular } from '@fluentui/react-icons';
import { Provider } from 'react-redux';
import { store } from './store';

const iconSize = 24;

function App() {
  return (
    <Provider store={store}>
      <Layout>
        {/* <AdminPanel /> */}
        <ManagePage title="Manage Companies" icon={<GridRegular fontSize={iconSize}/>} tabs={['Companies', 'Users']} />
        <AnnualCorporateScorecard title="Annual Corporate Scorecard" icon={<PeopleTeamRegular fontSize={iconSize}/>} tabs={['Quarterly Targets', 'Annual Targets']} />
      </Layout>
    </Provider>
  );
}

export default App; 