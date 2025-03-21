import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ManageCompanies from '../pages/manage/ManageCompanies';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'companies':
        return <ManageCompanies />;
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
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default Layout; 