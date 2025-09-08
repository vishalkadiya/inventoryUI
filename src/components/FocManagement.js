import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Select, MenuItem, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getFocs, createFoc, updateFoc, deleteFoc, getItems } from '../services/ApiService';
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
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  error: {
    marginBottom: theme.spacing(2),
  },
}));

export default function FocManagement() {
  const classes = useStyles();
  const [focs, setFocs] = useState([]);
  const [items, setItems] = useState([]);
  const [newFoc, setNewFoc] = useState({ item: { id: '' }, quantity: 0, reason: '' });
  const [editFoc, setEditFoc] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getFocs(), getItems()]).then(([focsRes, itemsRes]) => {
      if (focsRes.error || itemsRes.error) {
        setError(focsRes.error || itemsRes.error);
      } else {
        setFocs(focsRes.data);
        setItems(itemsRes.data);
      }
      setLoading(false);
    });
  }, []);

  const addFoc = () => {
    createFoc(newFoc).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setFocs([...focs, res.data]);
        setNewFoc({ item: { id: '' }, quantity: 0, reason: '' });
      }
    });
  };

  const handleOpenEditDialog = (foc) => {
    setEditFoc({ ...foc });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditFoc(null);
  };

  const handleUpdate = () => {
    if (editFoc) {
      updateFoc(editFoc.id, editFoc).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setFocs(focs.map(f => (f.id === editFoc.id ? res.data : f)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteFoc(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setFocs(focs.filter(f => f.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>FOC Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>FOC Management</Typography>
      <Box className={classes.form}>
        <Select
          value={newFoc.item.id}
          onChange={e => setNewFoc({ ...newFoc, item: { id: e.target.value } })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Item</MenuItem>
          {items.map(item => (
            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
          ))}
        </Select>
        <TextField
          label="Quantity"
          type="number"
          value={newFoc.quantity}
          onChange={e => setNewFoc({ ...newFoc, quantity: parseInt(e.target.value) || 0 })}
        />
        <TextField
          label="Reason"
          value={newFoc.reason}
          onChange={e => setNewFoc({ ...newFoc, reason: e.target.value })}
        />
        <Button onClick={addFoc} color="primary" variant="contained">Add FOC</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {focs.map(foc => (
            <TableRow key={foc.id}>
              <TableCell>{foc.item?.name || 'N/A'}</TableCell>
              <TableCell>{foc.quantity}</TableCell>
              <TableCell>{foc.reason}</TableCell>
              <TableCell>{new Date(foc.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(foc.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(foc)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(foc.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update FOC</DialogTitle>
        <DialogContent>
          {editFoc && (
            <Box className={classes.dialogForm}>
              <Select
                value={editFoc.item?.id || ''}
                onChange={e => setEditFoc({ ...editFoc, item: { id: e.target.value } })}
                fullWidth
              >
                <MenuItem value="" disabled>Select Item</MenuItem>
                {items.map(item => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                ))}
              </Select>
              <TextField
                label="Quantity"
                type="number"
                value={editFoc.quantity}
                onChange={e => setEditFoc({ ...editFoc, quantity: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Reason"
                value={editFoc.reason}
                onChange={e => setEditFoc({ ...editFoc, reason: e.target.value })}
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