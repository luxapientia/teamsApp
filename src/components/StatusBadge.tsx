import React from 'react';
import { Status, LicenseStatus } from '../types';

type StatusType = Status | LicenseStatus;

interface StatusConfig {
  color: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  active: { color: 'bg-green-100 text-green-800' },
  inactive: { color: 'bg-red-100 text-red-800' },
  expired: { color: 'bg-red-100 text-red-800' },
  pending: { color: 'bg-yellow-100 text-yellow-800' },
};

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfigs[status];
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      {status}
    </span>
  );
}; 