import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { ManagePage } from '../pages/manage';
import AnnualCorporateScorecard from '../pages/scorecards/AnnualCorporateScorecard';
import { AdminPanel } from '../pages/admin/';
import Content from './Content';
import { PageProps } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  selectedTabChanger: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = (props) => {

  const pages: React.ReactNode[] = props.children as React.ReactNode[];
  const pagePropsList: PageProps[] = pages.map((page: any) => {
    return {
      title: page?.props?.title,
      icon: page?.props?.icon,
      tabs: page?.props?.tabs,
      selectedTab: page?.props?.selectedTab
    }
  });

  useEffect(() => {
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePageTitle, setActivePageTitle] = useState(pagePropsList[0].title);

  const handlePageChange = (title: string) => {
    setActivePageTitle(title);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    const activePage: any = pages.find((page: any) => page.props.title === activePageTitle);
    return (
      <Content
        title={activePage.props.title}
        tabs={activePage.props.tabs}
        icon={activePage.props.icon}
        selectedTabChanger={props.selectedTabChanger}
      >
        {activePage}
      </Content>
    )
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activePageTitle={activePageTitle}
        onPageChange={handlePageChange}
        pagePropsList={pagePropsList}

      />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-80' : 'ml-16'
        }`}
      >
        {renderContent()}
      </main>
    </Box>
  );
};

export default Layout; 