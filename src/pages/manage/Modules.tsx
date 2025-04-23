import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  styled,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Company } from '../../types';
import { companyAPI } from '../../services/api';

const StyledTab = styled(Tab)({
  textTransform: 'none',
  minWidth: 0,
  fontWeight: 'normal',
  '&.Mui-selected': {
    backgroundColor: '#0078D4',
    color: 'white',
    borderRadius: '4px',
  },
});

const StyledTableCell = styled(TableCell)({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#374151',
});

const StyledHeaderCell = styled(TableCell)({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#6B7280',
  fontWeight: 500,
  backgroundColor: '#F9FAFB',
});

const ViewButton = styled(Button)({
  textTransform: 'none',
  backgroundColor: '#fff',
  color: '#0078D4',
  border: '1px solid #0078D4',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
});

interface ModuleRow {
  id: string;
  name: string;
  isExpanded: boolean;
  companies: Company[];
}

const Modules: React.FC = () => {
  const [tabValue, setTabValue] = useState(3); // Modules tab selected by default
  const [searchQuery, setSearchQuery] = useState('');
  const [modules, setModules] = useState<ModuleRow[]>([
    {
      id: '1',
      name: 'Employees 360 Degree Feedback',
      isExpanded: false,
      companies: [],
    },
  ]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyAPI.getAll();
        setCompanies(response.data.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, isExpanded: !module.isExpanded }
        : module
    ));
  };

  const handleCompanySelection = (companyId: string, moduleId: string) => {
    // Handle company selection logic here
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search module..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E5E7EB',
              },
              '&:hover fieldset': {
                borderColor: '#D1D5DB',
              },
            },
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledHeaderCell>MODULE</StyledHeaderCell>
              <StyledHeaderCell align="right">Add Company</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modules.map((module) => (
              <React.Fragment key={module.id}>
                <TableRow>
                  <StyledTableCell 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleModuleExpansion(module.id)}
                  >
                    {module.isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    {module.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <ViewButton 
                      variant="outlined"
                      size="small"
                      onClick={() => toggleModuleExpansion(module.id)}
                    >
                      VIEW
                    </ViewButton>
                  </StyledTableCell>
                </TableRow>
                {module.isExpanded && companies.map((company) => (
                  <TableRow key={company._id}>
                    <StyledTableCell sx={{ pl: 8 }}>{company.name}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Checkbox 
                        checked={false}
                        onChange={() => handleCompanySelection(company._id, module.id)}
                      />
                    </StyledTableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Modules; 