import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Select, MenuItem, Checkbox, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getSales, createSale, updateSale, deleteSale, getItems, getCompanies } from '../services/ApiService';
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

export default function SaleManagement() {
  const classes = useStyles();
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [newSale, setNewSale] = useState({ item: { id: '' }, quantity: 0, price: 0, isWholesale: false, company: { id: '' } });
  const [editSale, setEditSale] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSales(), getItems(), getCompanies()]).then(([salesRes, itemsRes, companiesRes]) => {
      if (salesRes.error || itemsRes.error || companiesRes.error) {
        setError(salesRes.error || itemsRes.error || companiesRes.error);
      } else {
        setSales(salesRes.data);
        setItems(itemsRes.data);
        setCompanies(companiesRes.data);
      }
      setLoading(false);
    });
  }, []);

  const addSale = () => {
    createSale(newSale).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setSales([...sales, res.data]);
        setNewSale({ item: { id: '' }, quantity: 0, price: 0, isWholesale: false, company: { id: '' } });
      }
    });
  };

  const handleOpenEditDialog = (sale) => {
    setEditSale({ ...sale });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditSale(null);
  };

  const handleUpdate = () => {
    if (editSale) {
      updateSale(editSale.id, editSale).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setSales(sales.map(s => (s.id === editSale.id ? res.data : s)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteSale(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setSales(sales.filter(s => s.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Sale Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Sale Management</Typography>
      <Box className={classes.form}>
        <Select
          value={newSale.item.id}
          onChange={e => setNewSale({ ...newSale, item: { id: e.target.value } })}
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
          value={newSale.quantity}
          onChange={e => setNewSale({ ...newSale, quantity: parseInt(e.target.value) || 0 })}
        />
        <TextField
          label="Price"
          type="number"
          value={newSale.price}
          onChange={e => setNewSale({ ...newSale, price: parseFloat(e.target.value) || 0 })}
        />
        <Checkbox
          checked={newSale.isWholesale}
          onChange={e => setNewSale({ ...newSale, isWholesale: e.target.checked })}
        />
        <Typography>Wholesale</Typography>
        <Select
          value={newSale.company.id}
          onChange={e => setNewSale({ ...newSale, company: { id: e.target.value } })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Company</MenuItem>
          {companies.map(company => (
            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
          ))}
        </Select>
        <Button onClick={addSale} color="primary" variant="contained">Add Sale</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Wholesale</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales.map(sale => (
            <TableRow key={sale.id}>
              <TableCell>{sale.item?.name || 'N/A'}</TableCell>
              <TableCell>{sale.quantity}</TableCell>
              <TableCell>{sale.price}</TableCell>
              <TableCell>{sale.isWholesale ? 'Yes' : 'No'}</TableCell>
              <TableCell>{sale.company?.name || 'N/A'}</TableCell>
              <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(sale.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(sale)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(sale.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Sale</DialogTitle>
        <DialogContent>
          {editSale && (
            <Box className={classes.dialogForm}>
              <Select
                value={editSale.item?.id || ''}
                onChange={e => setEditSale({ ...editSale, item: { id: e.target.value } })}
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
                value={editSale.quantity}
                onChange={e => setEditSale({ ...editSale, quantity: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Price"
                type="number"
                value={editSale.price}
                onChange={e => setEditSale({ ...editSale, price: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
              <Checkbox
                checked={editSale.isWholesale}
                onChange={e => setEditSale({ ...editSale, isWholesale: e.target.checked })}
              />
              <Typography>Wholesale</Typography>
              <Select
                value={editSale.company?.id || ''}
                onChange={e => setEditSale({ ...editSale, company: { id: e.target.value } })}
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