import React from 'react';
import Companies from './Companies';
import SuperUsers from './SuperUsers';
import CompanyLicenses from './CompanyLicenses';
import { PageProps } from '../../types/page';

const ManagePage: React.FC<PageProps> = (props) => {

  return (
    <div className="p-6 space-y-6">
      {/* Conditional Rendering */}
      {props.selectedTab === 'Companies' && <Companies />}
      {props.selectedTab === 'Companies Super Users' && <SuperUsers />}
      {props.selectedTab === 'Companies Licenses' && <CompanyLicenses />}
    </div>
  );
};

export default ManagePage; 