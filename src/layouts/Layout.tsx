import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { ManagePage } from '../pages/manage';
import AnnualCorporateScorecard from '../pages/scorecards/AnnualCorporateScorecard';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('manage-companies');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'manage-companies':
        return <ManagePage />;
      case 'annual-corporate-scorecards':
        return <AnnualCorporateScorecard />;
      default:
        return <div className="flex items-center justify-center h-full">Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default Layout; 