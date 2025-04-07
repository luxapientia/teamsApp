import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Menu,
    MenuItem,
    Button,
    styled,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    Tabs,
    Tab,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AnnualTarget, AnnualTargetStatus } from '../../../types/annualCorporateScorecard';
import { deleteAnnualTarget } from '../../../store/slices/scorecardSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { RootState } from '../../../store';
import StrategicObjectiveTab from './tabs/strategic_objective';
import PerspectiveTab from './tabs/perspective';
import RatingScaleTab from './tabs/rating_scale';
import ContractingPeriodTab from './tabs/contracting_period';
import AssessmentsPeriodTab from './tabs/assessments_period';
import AddIcon from '@mui/icons-material/Add';
import AddAnnualTargetModal from './AddAnnualTargetModal';
// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: '1px solid #E5E7EB',
    padding: '16px',
    color: '#374151',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
    borderBottom: '1px solid #E5E7EB',
    padding: '16px',
    color: '#6B7280',
    fontWeight: 500,
}));

const ViewButton = styled(Button)({
    textTransform: 'none',
    backgroundColor: '#0078D4',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '4px',
    '&:hover': {
        backgroundColor: '#106EBE',
    },
});

const StyledMenuItem = styled(MenuItem)({
    padding: '8px 16px',
    minHeight: '40px',
    '&:hover': {
        backgroundColor: '#F9FAFB',
    },
});

const StyledListItemIcon = styled(ListItemIcon)({
    minWidth: '32px',
    color: '#6B7280',
});

const StyledTabs = styled(Tabs)({
    minHeight: 'unset',
    '& .MuiTabs-indicator': {
        display: 'none',
    },
    '& .MuiTabs-flexContainer': {
        justifyContent: 'flex-end',
        gap: '8px',
    },
});

const StyledTab = styled(Tab)(({ theme }) => ({
    marginTop: '10px',
    textTransform: 'none',
    minHeight: 'unset',
    padding: '8px 20px',
    borderRadius: '20px',
    color: '#374151',
    backgroundColor: '#fff',
    border: '1px solid #E5E7EB',
    minWidth: 'unset',
    fontSize: '14px',
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

interface RowProps {
    target: AnnualTarget;
    onMenuClick: (event: React.MouseEvent<HTMLElement>, name: string) => void;
    onOpen?: (setOpen: (open: boolean) => void) => void;
}

const Row: React.FC<RowProps> = ({ target, onMenuClick, onOpen }) => {
    const [open, setOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        if (onOpen) {
            onOpen(setOpen);
        }
    }, [onOpen]);

    const renderTab = () => {
        switch (tabValue) {
            case 0:
                return <ContractingPeriodTab targetName={target.name} />;
            case 1:
                return <AssessmentsPeriodTab targetName={target.name} />;
            case 2:
                return <StrategicObjectiveTab targetName={target.name} />;
            case 3:
                return <RatingScaleTab targetName={target.name} />;
            case 4:
                return <PerspectiveTab targetName={target.name} />;
            default:
                return null;
        }
    }

    return (
        <>
            <TableRow>
                <StyledTableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        sx={{ mr: 1 }}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                    {target.name}
                </StyledTableCell>
                <StyledTableCell>
                    <IconButton
                        size="small"
                        onClick={(e) => onMenuClick(e, target.name)}
                    >
                        <MoreHorizIcon />
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell>{target.startDate}</StyledTableCell>
                <StyledTableCell>{target.endDate}</StyledTableCell>
                <StyledTableCell>{target.status}</StyledTableCell>
                <StyledTableCell align="right">
                    <ViewButton onClick={() => setOpen(true)}>
                        View
                    </ViewButton>
                </StyledTableCell>
            </TableRow>
            <TableRow>
                <StyledTableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mb: 2
                            }}>
                                <StyledTabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    aria-label="annual target tabs"
                                >
                                    <StyledTab
                                        label="Performance Contracting Period"
                                        disableRipple
                                        aria-label="View performance contracting period"
                                    />
                                    <StyledTab
                                        label="Performance Assessments Period"
                                        disableRipple
                                        aria-label="View performance assessments period"
                                    />
                                    <StyledTab
                                        label="Strategic Objectives"
                                        disableRipple
                                        aria-label="View strategic objectives"
                                    />
                                    <StyledTab
                                        label="Performance Rating Scale"
                                        disableRipple
                                        aria-label="View performance rating scale"
                                    />
                                    <StyledTab
                                        label="Perspectives"
                                        disableRipple
                                        aria-label="View perspectives"
                                    />
                                </StyledTabs>
                            </Box>
                            <Box>
                                {renderTab()}
                            </Box>
                        </Box>
                    </Collapse>
                </StyledTableCell>
            </TableRow>
        </>
    );
};

const AnnualTargets: React.FC = () => {
    const dispatch = useAppDispatch();
    const { annualTargets, status } = useAppSelector((state: RootState) => state.scorecard);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<string | null>(null);
    const [expandRow, setExpandRow] = useState<((open: boolean) => void) | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<AnnualTarget | null>(null);


    useEffect(() => {
        // if (status === 'idle') {
        //     dispatch(fetchAnnualTargets());
        // }
    }, [status, dispatch]);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, rowName: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(rowName);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleOpen = () => {
        handleMenuClose();
        if (expandRow) {
            expandRow(true);
        }
    };

    const handleEdit = () => {
        if (selectedRow) {
            const target = annualTargets.find(t => t.name === selectedRow);
            if (target) {
                setEditingTarget(target);
                setIsModalOpen(true);
                handleMenuClose();
            }
        }
    };

    const handleDelete = () => {
        if (selectedRow) {
            const target = annualTargets.find(t => t.name === selectedRow);
            if (target) {
                dispatch(deleteAnnualTarget(target._id));
                handleMenuClose();
            }
        }
    };

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                        textTransform: 'none',
                        borderColor: '#E5E7EB',
                        color: '#374151',
                        '&:hover': {
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F9FAFB',
                        },
                    }}
                >
                    New
                </Button>
            </Box>
            <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledHeaderCell>Annual Target</StyledHeaderCell>
                                <StyledHeaderCell></StyledHeaderCell>
                                <StyledHeaderCell>Start Date</StyledHeaderCell>
                                <StyledHeaderCell>End Date</StyledHeaderCell>
                                <StyledHeaderCell>Status</StyledHeaderCell>
                                <StyledHeaderCell></StyledHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {annualTargets.map((target, index) => (
                                <Row
                                    key={index}
                                    target={target}
                                    onMenuClick={handleMenuClick}
                                    onOpen={target.name === selectedRow ? setExpandRow : undefined}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        elevation: 1,
                        sx: {
                            width: '180px',
                            padding: '4px 0',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                        },
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <StyledMenuItem onClick={handleOpen}>
                        <StyledListItemIcon>
                            <OpenInNewIcon fontSize="small" />
                        </StyledListItemIcon>
                        <ListItemText>Open</ListItemText>
                    </StyledMenuItem>
                    <StyledMenuItem onClick={handleEdit}>
                        <StyledListItemIcon>
                            <EditIcon fontSize="small" />
                        </StyledListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </StyledMenuItem>
                    <StyledMenuItem onClick={handleDelete}>
                        <StyledListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </StyledListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </StyledMenuItem>
                </Menu>
            </Paper>
            <AddAnnualTargetModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingAnnualTarget={editingTarget}
            />
        </div>
    );
};

export default AnnualTargets;
