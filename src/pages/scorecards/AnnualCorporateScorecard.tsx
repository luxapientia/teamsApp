import React, { useState, useEffect } from 'react';
import { AnnualScorecard, TargetTab } from '../../types';
import AnnualTargetTable from './components/AnnualTargetTable';
const AnnualCorporateScorecard = () => {
  const [selectedTab, setSelectedTab] = useState<TargetTab>(TargetTab.Annual);

  return (
    <div>
      {selectedTab === TargetTab.Annual ? (
        <AnnualTargetTable />
      ) : (
        <div>
          <h1>Quarterly Target Table</h1>
        </div>
      )}
    </div>
  );
};

export default AnnualCorporateScorecard; 