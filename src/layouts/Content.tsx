import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  styled,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Outlet } from 'react-router-dom';

interface ContentProps {
  title: string;
  tabs: string[];
  icon: React.ReactNode;
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

const TabContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #E5E7EB',
  backgroundColor: '#fff',
  overflowX: 'hidden',
});

const TabButton = styled('button')<{ selected?: boolean }>(({ selected }) => ({
  padding: '8px 20px',
  whiteSpace: 'nowrap',
  backgroundColor: selected ? '#0078D4' : 'transparent',
  color: selected ? '#fff' : '#374151',
  border: selected ? 'none' : '1px solid #E5E7EB',
  borderRadius: '20px',
  margin: '0 4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: selected ? '#0078D4' : '#F9FAFB',
  },
}));

const Content: React.FC<ContentProps> = ({
  title,
  tabs,
  icon,
  selectedTab,
  onTabChange,
}) => {
  const [visibleTabs, setVisibleTabs] = useState<string[]>([]);
  const [overflowTabs, setOverflowTabs] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateVisibleTabs = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      let totalWidth = 0;
      const visible: string[] = [];
      const overflow: string[] = [];

      // Calculate which tabs fit
      tabs.forEach((tab) => {
        // Approximate width calculation (adjust these values as needed)
        const tabWidth = tab.length * 10 + 40; // characters * avg char width + padding
        if (totalWidth + tabWidth < containerWidth - 60) { // 60px for overflow menu
          totalWidth += tabWidth;
          visible.push(tab);
        } else {
          overflow.push(tab);
        }
      });

      setVisibleTabs(visible);
      setOverflowTabs(overflow);
    };

    calculateVisibleTabs();
    window.addEventListener('resize', calculateVisibleTabs);
    return () => window.removeEventListener('resize', calculateVisibleTabs);
  }, [tabs]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabSelect = (tab: string) => {
    onTabChange(tab);
    handleMenuClose();
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: '#f5f5f5', p: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h5">{title}</Typography>
        </Box>

        <TabContainer ref={containerRef} sx={{ bgcolor: '#f5f5f5' }}>
          {visibleTabs.map((tab) => (
            <TabButton
              key={tab}
              selected={selectedTab === tab}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </TabButton>
          ))}

          {overflowTabs.length > 0 && (
            <>
              <IconButton onClick={handleMenuClick} size="small">
                <MoreHorizIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {overflowTabs.map((tab) => (
                  <MenuItem
                    key={tab}
                    onClick={() => handleTabSelect(tab)}
                    selected={selectedTab === tab}
                  >
                    {tab}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </TabContainer>

        <Box sx={{ mt: 3 }}><Outlet /></Box>
      </Container>
    </Box>
  );
};

export default Content; 