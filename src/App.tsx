import React from 'react';
import Layout from './layouts/Layout';
import './styles/globals.css';
import AnnualCorporateScorecard from './pages/scorecards/AnnualCorporateScorecard';
import { AdminPanel } from './pages/admin/';
import { ManagePage } from './pages/manage';
import { GridRegular, PeopleTeamRegular } from '@fluentui/react-icons';

const iconSize = 24;

function App() {
  return (
    <Layout>
      {/* <AdminPanel /> */}
      <ManagePage title="Manage Companies" icon={<GridRegular fontSize={iconSize}/>} tabs={['Companies', 'Users']} />
      <AnnualCorporateScorecard title="Annual Corporate Scorecard" icon={<PeopleTeamRegular fontSize={iconSize}/>} tabs={['Annual', 'Quarterly']} />
    </Layout>
  );
}

export default App; 