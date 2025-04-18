import React, { useState } from 'react';
import Teams from './teams';
import SuperUser from './super_user';
import { PageProps } from '@/types';

const TeamsPage: React.FC<PageProps> = (props) => {

  return (
    <div className="space-y-6">
      {/* Conditional Rendering */}
      {props.selectedTab === 'Teams' && <Teams />}
      {props.selectedTab === 'Super User' && <SuperUser />}
    </div>
  );
};

export default TeamsPage;