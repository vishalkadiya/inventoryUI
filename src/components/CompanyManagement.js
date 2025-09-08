import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../services/ApiService';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  form: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  error: {
    marginBottom: theme.spacing(2),
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

export default function CompanyManagement() {
  const classes = useStyles();
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: '', openingBalance: 0 });
  const [editCompany, setEditCompany] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCompanies().then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setCompanies(res.data);
      }
      setLoading(false);
    });
  }, []);

  const addCompany = () => {
    createCompany(newCompany).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setCompanies([...companies, res.data]);
        setNewCompany({ name: '', openingBalance: 0 });
      }
    });
  };

  const handleOpenEditDialog = (company) => {
    setEditCompany({ ...company });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditCompany(null);
  };

  const handleUpdate = () => {
    if (editCompany) {
      updateCompany(editCompany.id, editCompany).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setCompanies(companies.map(c => (c.id === editCompany.id ? res.data : c)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteCompany(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setCompanies(companies.filter(c => c.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Company Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Company Management</Typography>
      <Box className={classes.form}>
        <TextField
          label="Company Name"
          value={newCompany.name}
          onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
        />
        <TextField
          label="Opening Balance"
          type="number"
          value={newCompany.openingBalance}
          onChange={e => setNewCompany({ ...newCompany, openingBalance: parseFloat(e.target.value) || 0 })}
        />
        <Button onClick={addCompany} color="primary" variant="contained">Add Company</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Opening Balance</TableCell>
            <TableCell>Closing Balance</TableCell>
            <TableCell>Due Amount</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map(company => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.openingBalance}</TableCell>
              <TableCell>{company.closingBalance}</TableCell>
              <TableCell>{company.dueAmount}</TableCell>
              <TableCell>{new Date(company.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(company.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(company)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(company.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Company</DialogTitle>
        <DialogContent>
          {editCompany && (
            <Box className={classes.dialogForm}>
              <TextField
                label="Company Name"
                value={editCompany.name}
                onChange={e => setEditCompany({ ...editCompany, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Opening Balance"
                type="number"
                value={editCompany.openingBalance}
                onChange={e => setEditCompany({ ...editCompany, openingBalance: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">Cancel</Button>
          <Button onClick={handleUpdate} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}