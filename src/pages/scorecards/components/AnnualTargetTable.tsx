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
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import { AnnualTarget, AnnualTargetStatus } from '../../../types/annualCorporateScorecard';
import { fetchAnnualTargets, updateTargetStatus } from '../../../store/slices/scorecardSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { RootState } from '../../../store';

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

const AnnualTargetTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { annualTargets, status, error } = useAppSelector((state: RootState) => state.scorecard);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAnnualTargets());
        }
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
        // Add open functionality
    };

    const handleEdit = () => {
        handleMenuClose();
        // Add edit functionality
    };

    const handleDelete = () => {
        handleMenuClose();
        // Add delete functionality
    };

    return (
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {annualTargets.map((target: AnnualTarget) => (
                            <TableRow key={target.name}>
                                <StyledTableCell>{target.name}</StyledTableCell>
                                <StyledTableCell>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuClick(e, target.name)}
                                    >
                                        <MoreHorizIcon />
                                    </IconButton>
                                </StyledTableCell>
                                <StyledTableCell>{target.startDate}</StyledTableCell>
                                <StyledTableCell>{target.endDate}</StyledTableCell>
                                <StyledTableCell>{target.status}</StyledTableCell>
                                <StyledTableCell align="right">
                                    <ViewButton>View</ViewButton>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        minWidth: 120,
                    },
                }}
            >
                <MenuItem onClick={handleOpen}>Open</MenuItem>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
        </Paper>
    );
};

export default AnnualTargetTable;
