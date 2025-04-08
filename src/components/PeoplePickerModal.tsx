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
import { api } from '../services/api';

export interface Person {
  MicrosoftId: string;
  displayName: string;
  email?: string;
}

interface PeoplePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPeople: (people: Person[]) => void;
  tenantId: string;
  title?: string;
  multiSelect?: boolean;
}

const PeoplePickerModal: React.FC<PeoplePickerModalProps> = ({
  open,
  onClose,
  tenantId,
  onSelectPeople,
  title = 'Select People',
  multiSelect = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await api.get(`/users/tenant/${tenantId}`);
        const tempUsers = response.data.data.map((user: any) => ({
          MicrosoftId: user.MicrosoftId,
          displayName: user.name,
          email: user.email
        }));
        setPeople(tempUsers);
        setFilteredPeople(tempUsers);
      } catch (error) {
        console.error('Error fetching people:', error);
        setPeople([]);
        setFilteredPeople([]);
      }
    };
    
    if (tenantId) {
      fetchPeople();
    }
  }, [tenantId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = people.filter(person => 
        person.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.email && person.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople(people);
    }
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTogglePerson = (person: Person) => {
    if (multiSelect) {
      const isSelected = selectedPeople.some(p => p.MicrosoftId === person.MicrosoftId);
      if (isSelected) {
        setSelectedPeople(selectedPeople.filter(p => p.MicrosoftId !== person.MicrosoftId));
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
              const isSelected = selectedPeople.some(p => p.MicrosoftId === person.MicrosoftId);
              return (
                <ListItem 
                  key={person.MicrosoftId} 
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
                          {person.email}
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