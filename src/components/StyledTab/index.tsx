import { styled } from '@mui/material/styles';
import { Tabs, Tab } from '@mui/material';

export const StyledTabs = styled(Tabs)({
    minHeight: 'unset',
    '& .MuiTabs-indicator': {
        display: 'none',
    },
    '& .MuiTabs-flexContainer': {
        justifyContent: 'flex-end',
        gap: '8px',
    },
});

export const StyledTab = styled(Tab)(({ theme }) => ({
    marginTop: '10px',
    textTransform: 'none',
    minHeight: 'unset',
    padding: '8px 10px',
    borderRadius: '20px',
    color: '#374151',
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    minWidth: 'unset',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.2s ease',

    '&.Mui-selected': {
        color: '#fff',
        backgroundColor: '#0078D4',
        borderColor: '#0078D4',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

        '&:hover': {
            backgroundColor: '#106EBE',
            borderColor: '#106EBE',
            color: '#fff',
        }
    },

    '&:not(.Mui-selected):hover': {
        backgroundColor: '#F9FAFB',
        borderColor: '#0078D4',
        color: '#0078D4',
        transform: 'translateY(-1px)',
    },

    '&:active': {
        transform: 'translateY(0)',
    },
}));