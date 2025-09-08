import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Select, MenuItem, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getPurchases, createPurchase, updatePurchase, deletePurchase, getItems, getCompanies } from '../services/ApiService';
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

export default function PurchaseManagement() {
  const classes = useStyles();
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [newPurchase, setNewPurchase] = useState({ item: { id: '' }, quantity: 0, cost: 0, company: { id: '' } });
  const [editPurchase, setEditPurchase] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPurchases(), getItems(), getCompanies()]).then(([purchasesRes, itemsRes, companiesRes]) => {
      if (purchasesRes.error || itemsRes.error || companiesRes.error) {
        setError(purchasesRes.error || itemsRes.error || companiesRes.error);
      } else {
        setPurchases(purchasesRes.data);
        setItems(itemsRes.data);
        setCompanies(companiesRes.data);
      }
      setLoading(false);
    });
  }, []);

  const addPurchase = () => {
    createPurchase(newPurchase).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setPurchases([...purchases, res.data]);
        setNewPurchase({ item: { id: '' }, quantity: 0, cost: 0, company: { id: '' } });
      }
    });
  };

  const handleOpenEditDialog = (purchase) => {
    setEditPurchase({ ...purchase });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditPurchase(null);
  };

  const handleUpdate = () => {
    if (editPurchase) {
      updatePurchase(editPurchase.id, editPurchase).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setPurchases(purchases.map(p => (p.id === editPurchase.id ? res.data : p)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deletePurchase(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setPurchases(purchases.filter(p => p.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Purchase Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Purchase Management</Typography>
      <Box className={classes.form}>
        <Select
          value={newPurchase.item.id}
          onChange={e => setNewPurchase({ ...newPurchase, item: { id: e.target.value } })}
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
          value={newPurchase.quantity}
          onChange={e => setNewPurchase({ ...newPurchase, quantity: parseInt(e.target.value) || 0 })}
        />
        <TextField
          label="Cost"
          type="number"
          value={newPurchase.cost}
          onChange={e => setNewPurchase({ ...newPurchase, cost: parseFloat(e.target.value) || 0 })}
        />
        <Select
          value={newPurchase.company.id}
          onChange={e => setNewPurchase({ ...newPurchase, company: { id: e.target.value } })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Company</MenuItem>
          {companies.map(company => (
            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
          ))}
        </Select>
        <Button onClick={addPurchase} color="primary" variant="contained">Add Purchase</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {purchases.map(purchase => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.item?.name || 'N/A'}</TableCell>
              <TableCell>{purchase.quantity}</TableCell>
              <TableCell>{purchase.cost}</TableCell>
              <TableCell>{purchase.company?.name || 'N/A'}</TableCell>
              <TableCell>{new Date(purchase.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(purchase.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(purchase)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(purchase.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Purchase</DialogTitle>
        <DialogContent>
          {editPurchase && (
            <Box className={classes.dialogForm}>
              <Select
                value={editPurchase.item?.id || ''}
                onChange={e => setEditPurchase({ ...editPurchase, item: { id: e.target.value } })}
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
                value={editPurchase.quantity}
                onChange={e => setEditPurchase({ ...editPurchase, quantity: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Cost"
                type="number"
                value={editPurchase.cost}
                onChange={e => setEditPurchase({ ...editPurchase, cost: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
              <Select
                value={editPurchase.company?.id || ''}
                onChange={e => setEditPurchase({ ...editPurchase, company: { id: e.target.value } })}
                fullWidth
              >
                <MenuItem value="" disabled>Select Company</MenuItem>
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                ))}
              </Select>
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