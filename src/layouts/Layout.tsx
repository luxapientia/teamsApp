import React, { useState, useEffect, ReactElement } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Content from './Content';
import { PageProps } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  selectedTabChanger: (tab: string) => void;
}

interface PageElement extends ReactElement {
  props: {
    title: string;
    icon?: React.ReactNode;
    tabs: string[];
    selectedTab?: string;
  };
}

const Layout: React.FC<LayoutProps> = (props) => {
  const pages = React.Children.toArray(props.children) as PageElement[];
  const pagePropsList: PageProps[] = pages.map((page) => {
    return {
      title: page.props.title,
      icon: page.props.icon || null,
      tabs: page.props.tabs,
      selectedTab: page.props.selectedTab || page.props.tabs[0] || ''
    }
  });

  useEffect(() => {
    if (pagePropsList.length > 0 && pagePropsList[0].tabs.length > 0) {
      props.selectedTabChanger(pagePropsList[0].tabs[0]);
    }
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePageTitle, setActivePageTitle] = useState(pagePropsList[0]?.title || '');

  const handlePageChange = (title: string) => {
    setActivePageTitle(title);
    const clickedPage = pagePropsList.find(page => page.title === title);
    if (clickedPage && clickedPage.tabs.length > 0) {
      props.selectedTabChanger(clickedPage.tabs[0]);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    if (pagePropsList.length === 0) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">No content available</p>
        </div>
      );
    }

    const activePage = pages.find((page) => page.props.title === activePageTitle);
    if (!activePage) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Page not found</p>
        </div>
      );
    }

    return (
      <Content
        title={activePage.props.title}
        tabs={activePage.props.tabs}
        icon={activePage.props.icon}
        selectedTabChanger={props.selectedTabChanger}
        selectedTab={activePage.props.selectedTab || activePage.props.tabs[0] || ''}
      >
        {activePage}
      </Content>
    );
  };

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