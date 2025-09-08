import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Select, MenuItem, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getItems, createItem, updateItem, deleteItem, getCategories } from '../services/ApiService';
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

export default function ItemManagement() {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', retailPrice: 0, wholesalePrice: 0, stock: 0, category: { id: '' } });
  const [editItem, setEditItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getItems(), getCategories()]).then(([itemsRes, categoriesRes]) => {
      if (itemsRes.error || categoriesRes.error) {
        setError(itemsRes.error || categoriesRes.error);
      } else {
        setItems(itemsRes.data);
        setCategories(categoriesRes.data);
      }
      setLoading(false);
    });
  }, []);

  const addItem = () => {
    createItem(newItem).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setItems([...items, res.data]);
        setNewItem({ name: '', retailPrice: 0, wholesalePrice: 0, stock: 0, category: { id: '' } });
      }
    });
  };

  const handleOpenEditDialog = (item) => {
    setEditItem({ ...item });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditItem(null);
  };

  const handleUpdate = () => {
    if (editItem) {
      updateItem(editItem.id, editItem).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setItems(items.map(i => (i.id === editItem.id ? res.data : i)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteItem(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setItems(items.filter(i => i.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Item Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Item Management</Typography>
      <Box className={classes.form}>
        <TextField
          label="Item Name"
          value={newItem.name}
          onChange={e => setNewItem({ ...newItem, name: e.target.value })}
        />
        <TextField
          label="Retail Price"
          type="number"
          value={newItem.retailPrice}
          onChange={e => setNewItem({ ...newItem, retailPrice: parseFloat(e.target.value) || 0 })}
        />
        <TextField
          label="Wholesale Price"
          type="number"
          value={newItem.wholesalePrice}
          onChange={e => setNewItem({ ...newItem, wholesalePrice: parseFloat(e.target.value) || 0 })}
        />
        <TextField
          label="Stock"
          type="number"
          value={newItem.stock}
          onChange={e => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
        />
        <Select
          value={newItem.category.id}
          onChange={e => setNewItem({ ...newItem, category: { id: e.target.value } })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Category</MenuItem>
          {categories.map(category => (
            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
          ))}
        </Select>
        <Button onClick={addItem} color="primary" variant="contained">Add Item</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Retail Price</TableCell>
            <TableCell>Wholesale Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.retailPrice}</TableCell>
              <TableCell>{item.wholesalePrice}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>{item.category?.name || 'N/A'}</TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(item)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(item.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Item</DialogTitle>
        <DialogContent>
          {editItem && (
            <Box className={classes.dialogForm}>
              <TextField
                label="Item Name"
                value={editItem.name}
                onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Retail Price"
                type="number"
                value={editItem.retailPrice}
                onChange={e => setEditItem({ ...editItem, retailPrice: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Wholesale Price"
                type="number"
                value={editItem.wholesalePrice}
                onChange={e => setEditItem({ ...editItem, wholesalePrice: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
              <TextField
                label="Stock"
                type="number"
                value={editItem.stock}
                onChange={e => setEditItem({ ...editItem, stock: parseInt(e.target.value) || 0 })}
                fullWidth
              />
              <Select
                value={editItem.category?.id || ''}
                onChange={e => setEditItem({ ...editItem, category: { id: e.target.value } })}
                fullWidth
              >
                <MenuItem value="" disabled>Select Category</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
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