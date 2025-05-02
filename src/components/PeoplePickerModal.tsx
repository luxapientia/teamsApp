import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Box,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '../services/api';
import debounce from 'lodash/debounce';

export interface Person {
  MicrosoftId: string;
  displayName: string;
  email?: string;
  jobTitle?: string;
}

interface PeoplePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPeople: (people: Person[]) => void;
  tenantId: string;
  title?: string;
  multiSelect?: boolean;
  currentTeamMembers?: Person[];
}

const PeoplePickerModal: React.FC<PeoplePickerModalProps> = ({
  open,
  onClose,
  tenantId,
  onSelectPeople,
  title = 'Select People',
  multiSelect = true,
  currentTeamMembers = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLink, setNextLink] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPersonElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePeople();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMorePeople = async () => {
    if (!nextLink || loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await api.get('/users/organization/users', {
        params: {
          nextLink: encodeURIComponent(nextLink)
        }
      });
      
      const newUsers = response.data.data.map((user: any) => ({
        MicrosoftId: user.id,
        displayName: user.displayName,
        email: user.mail,
        jobTitle: user.jobTitle
      }));

      // Filter out all existing team members
      const filteredNewUsers = newUsers.filter(user => 
        !currentTeamMembers.some(member => member.MicrosoftId === user.MicrosoftId)
      );

      setPeople(prev => [...prev, ...filteredNewUsers]);
      setFilteredPeople(prev => [...prev, ...filteredNewUsers]);
      setNextLink(response.data.nextLink || null);
      setHasMore(!!response.data.nextLink);
    } catch (error) {
      console.error('Error loading more people:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.get('/users/organization/users', {
        params: {
          pageSize: 20
        }
      });
      const tempUsers = response.data.data.map((user: any) => ({
        MicrosoftId: user.id,
        displayName: user.displayName,
        email: user.mail,
        jobTitle: user.jobTitle
      }));
      
      // Filter out all existing team members
      const filteredUsers = tempUsers.filter(user => 
        !currentTeamMembers.some(member => member.MicrosoftId === user.MicrosoftId)
      );
      
      setPeople(filteredUsers);
      setFilteredPeople(filteredUsers);
      setNextLink(response.data.nextLink || null);
      setHasMore(!!response.data.nextLink);
    } catch (error: any) {
      console.error('Error fetching people:', error);
      if (error.response?.data?.consentRequired) {
        setError('Admin consent required. Redirecting to consent page...');
        setTimeout(() => {
          window.location.href = error.response.data.consentUrl;
        }, 2000);
        return;
      }
      if (error.response?.data?.message?.includes('terms of use')) {
        setError('Terms of Use acceptance required. Please contact your administrator.');
        return;
      }
      setError('Failed to load users. Please try again later.');
      setPeople([]);
      setFilteredPeople([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPeople();
    }
  }, [open]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query) {
        const filtered = people.filter(person => 
          person.displayName.toLowerCase().includes(query.toLowerCase()) ||
          (person.email && person.email.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredPeople(filtered);
      } else {
        setFilteredPeople(people);
      }
    }, 300),
    [people]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

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

  const handleConfirm = async () => {
    try {
      // Register selected users in our database
      await api.post('/users/bulk-create', {
        users: selectedPeople.map(person => ({
          MicrosoftId: person.MicrosoftId,
          displayName: person.displayName,
          email: person.email,
          jobTitle: person.jobTitle,
          tenantId: tenantId
        }))
      });
      // Proceed with the original selection
      onSelectPeople(selectedPeople);
      onClose();
    } catch (error) {
      console.error('Error registering users:', error);
      setError('Failed to register selected users. Please try again.');
    }
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
        {error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320, padding: 2 }}>
            <Typography color="error" align="center">{error}</Typography>
          </Box>
        ) : filteredPeople.length === 0 && !loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
            <Typography color="textSecondary">No results found</Typography>
          </Box>
        ) : (
          <List sx={{ padding: 0 }}>
            {filteredPeople.map((person, index) => {
              const isSelected = selectedPeople.some(p => p.MicrosoftId === person.MicrosoftId);
              const isLastElement = index === filteredPeople.length - 1;

              return (
                <ListItem 
                  key={person.MicrosoftId} 
                  component="div"
                  ref={isLastElement ? lastPersonElementRef : null}
                  onClick={() => handleTogglePerson(person)}
                  sx={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                    cursor: 'pointer'
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
                      <Box>
                        <Typography variant="body2" color="textSecondary" component="span">
                          {person.email}
                        </Typography>
                        {person.jobTitle && (
                          <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                            {person.jobTitle}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
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