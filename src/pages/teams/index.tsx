import React from 'react';
import Teams from './teams';
import SuperUser from './super_user';
import { PageProps } from '@/types';
import { Routes, Route, Navigate } from 'react-router-dom';

const TeamsPage: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="teams" replace />} />
        <Route path="teams" element={<Teams />} />
        <Route path="super-user" element={<SuperUser />} />
      </Routes>
    </div>
  );
};

export default TeamsPage;