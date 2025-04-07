import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Checkbox, 
  TextField, 
  InputAdornment,
  Typography,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';

// Mock data for people
const mockPeople = [
  { objectId: '1', displayName: 'John Doe', jobTitle: 'Software Engineer', department: 'Engineering', email: 'john.doe@example.com' },
  { objectId: '2', displayName: 'Jane Smith', jobTitle: 'Product Manager', department: 'Product', email: 'jane.smith@example.com' },
  { objectId: '3', displayName: 'Robert Johnson', jobTitle: 'UX Designer', department: 'Design', email: 'robert.johnson@example.com' },
  { objectId: '4', displayName: 'Emily Davis', jobTitle: 'Marketing Specialist', department: 'Marketing', email: 'emily.davis@example.com' },
  { objectId: '5', displayName: 'Michael Wilson', jobTitle: 'Data Scientist', department: 'Analytics', email: 'michael.wilson@example.com' },
  { objectId: '6', displayName: 'Sarah Brown', jobTitle: 'HR Manager', department: 'Human Resources', email: 'sarah.brown@example.com' },
  { objectId: '7', displayName: 'David Miller', jobTitle: 'DevOps Engineer', department: 'Engineering', email: 'david.miller@example.com' },
  { objectId: '8', displayName: 'Lisa Taylor', jobTitle: 'Sales Representative', department: 'Sales', email: 'lisa.taylor@example.com' },
];

export interface Person {
  objectId: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  email?: string;
}

interface PeoplePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPeople: (people: Person[]) => void;
  title?: string;
  multiSelect?: boolean;
}

const PeoplePickerModal: React.FC<PeoplePickerModalProps> = ({
  open,
  onClose,
  onSelectPeople,
  title = 'Select People',
  multiSelect = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>(mockPeople);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mockPeople.filter(person => 
        person.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.jobTitle && person.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (person.department && person.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (person.email && person.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople(mockPeople);
    }
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTogglePerson = (person: Person) => {
    if (multiSelect) {
      const isSelected = selectedPeople.some(p => p.objectId === person.objectId);
      if (isSelected) {
        setSelectedPeople(selectedPeople.filter(p => p.objectId !== person.objectId));
      } else {
        setSelectedPeople([...selectedPeople, person]);
      }
    } else {
      setSelectedPeople([person]);
    }
  };

  const handleConfirm = () => {
    onSelectPeople(selectedPeople);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: 3,
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', padding: 2 }}>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <Box sx={{ padding: 2, borderBottom: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth
          placeholder="Search people"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
      </Box>
      <DialogContent sx={{ padding: 0, minHeight: 320 }}>
        {filteredPeople.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
            <Typography color="textSecondary">No results found</Typography>
          </Box>
        ) : (
          <List sx={{ padding: 0 }}>
            {filteredPeople.map((person) => {
              const isSelected = selectedPeople.some(p => p.objectId === person.objectId);
              return (
                <ListItem 
                  key={person.objectId} 
                  component="button"
                  onClick={() => handleTogglePerson(person)}
                  sx={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                  }}
                >
                  <Checkbox 
                    checked={isSelected}
                    sx={{ color: isSelected ? '#0078d4' : undefined }}
                  />
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isSelected ? '#0078d4' : '#6264a7' }}>
                      {getInitials(person.displayName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                        {person.displayName}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="textSecondary" component="span">
                          {person.jobTitle}{person.jobTitle && person.department ? ' · ' : ''}{person.department}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="textSecondary">
          {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} selected
        </Typography>
        <Box>
          <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            disabled={selectedPeople.length === 0}
          >
            Add
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PeoplePickerModal; 