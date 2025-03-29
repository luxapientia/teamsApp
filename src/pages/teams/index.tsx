import React, { useState } from 'react';
import TeamsTabContent from './TeamsTabContent';
import { PageProps } from '@/types';

const Teams: React.FC<PageProps> = (props) => {

  return (
    <div className="space-y-6">
      {/* Conditional Rendering */}
      {props.selectedTab === 'Teams' && <TeamsTabContent />}
    </div>
  );
};

export default Teams;