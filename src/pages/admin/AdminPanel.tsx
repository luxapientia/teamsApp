import React, { useState } from 'react';
import Contracting from './Contracting';
import Assessments from './Assessments';
import Teams from './Teams';
import { PageProps } from '@/types';

const AdminPanel: React.FC<PageProps> = (props) => {

  return (
    <div className="p-6 space-y-6">
      {/* Conditional Rendering */}
      {props.selectedTab === 'Performance Contracting Periods' && <Contracting />}
      {props.selectedTab === 'Performance Assessments Periods' && <Assessments />}
      {props.selectedTab === 'Teams' && <Teams />}
    </div>
  );
};

export default AdminPanel;