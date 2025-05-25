import React, { useState, useEffect, ReactElement } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import Content from './Content';
import { PageProps } from '../types';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  selectedTabChanger: (tab: string) => void;
  pages: PageProps[];
}

const Layout: React.FC<LayoutProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [activePageTitle, setActivePageTitle] = useState('');

  // const pages = React.Children.toArray(props.children) as PageElement[];
  const pages = props.pages as PageProps[];
  const pagePropsList: PageProps[] = pages.map((page) => ({
    title: page.title,
    icon: page.icon || null,
    tabs: page.tabs,
    selectedTab: page.selectedTab || page.tabs[0] || '',
    path: page.path,
    show: page.show,
    element: page.element
  }));

  useEffect(() => {
    if (pagePropsList.length > 0 && pagePropsList[0].tabs.length > 0) {
      props.selectedTabChanger(pagePropsList[0].tabs[0]);
    }
    setActivePageTitle(pagePropsList[0]?.title || '');
  }, []);

  // Handle sidebar state on screen resize
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%' 
        }}>
          <p className="text-gray-500">No content available</p>
        </Box>
      );
    }

    const activePage = pagePropsList.find((page) => page.title === activePageTitle);
    if (!activePage) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%' 
        }}>
          <p className="text-gray-500">Page not found</p>
        </Box>
      );
    }

    return (
      <Content
        title={activePage.title}
        tabs={activePage.tabs}
        icon={activePage.icon}
        onTabChange={props.selectedTabChanger}
        selectedTab={activePage.selectedTab || activePage.tabs[0] || ''}
      />
    );
  };

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#F9FAFB'
    }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activePageTitle={activePageTitle}
        onPageChange={handlePageChange}
        pagePropsList={pagePropsList}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isSidebarOpen ? '310px' : '64px',
          height: '100vh',
          overflow: 'auto',
          position: 'relative',
          '@media (max-width: 600px)': {
            marginLeft: isSidebarOpen ? '0' : '64px',
            width: '100%',
          },
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Layout; 