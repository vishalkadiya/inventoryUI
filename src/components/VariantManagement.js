import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Select, MenuItem, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getVariants, createVariant, updateVariant, deleteVariant, getItems } from '../services/ApiService';
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

export default function VariantManagement() {
  const classes = useStyles();
  const [variants, setVariants] = useState([]);
  const [items, setItems] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: 0, item: { id: '' } });
  const [editVariant, setEditVariant] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getVariants(), getItems()]).then(([variantsRes, itemsRes]) => {
      if (variantsRes.error || itemsRes.error) {
        setError(variantsRes.error || itemsRes.error);
      } else {
        setVariants(variantsRes.data);
        setItems(itemsRes.data);
      }
      setLoading(false);
    });
  }, []);

  const addVariant = () => {
    createVariant(newVariant).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setVariants([...variants, res.data]);
        setNewVariant({ name: '', price: 0, item: { id: '' } });
      }
    });
  };

  const handleOpenEditDialog = (variant) => {
    setEditVariant({ ...variant });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditVariant(null);
  };

  const handleUpdate = () => {
    if (editVariant) {
      updateVariant(editVariant.id, editVariant).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setVariants(variants.map(v => (v.id === editVariant.id ? res.data : v)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteVariant(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setVariants(variants.filter(v => v.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Variant Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Variant Management</Typography>
      <Box className={classes.form}>
        <TextField
          label="Variant Name"
          value={newVariant.name}
          onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
        />
        <TextField
          label="Price"
          type="number"
          value={newVariant.price}
          onChange={e => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
        />
        <Select
          value={newVariant.item.id}
          onChange={e => setNewVariant({ ...newVariant, item: { id: e.target.value } })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Item</MenuItem>
          {items.map(item => (
            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
          ))}
        </Select>
        <Button onClick={addVariant} color="primary" variant="contained">Add Variant</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variants.map(variant => (
            <TableRow key={variant.id}>
              <TableCell>{variant.name}</TableCell>
              <TableCell>{variant.price}</TableCell>
              <TableCell>{variant.item?.name || 'N/A'}</TableCell>
              <TableCell>{new Date(variant.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(variant.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(variant)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(variant.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Variant</DialogTitle>
        <DialogContent>
          {editVariant && (
            <Box className={classes.dialogForm}>
              <TextField
                label="Variant Name"
                value={editVariant.name}
                onChange={e => setEditVariant({ ...editVariant, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Price"
                type="number"
                value={editVariant.price}
                onChange={e => setEditVariant({ ...editVariant, price: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
              <Select
                value={editVariant.item?.id || ''}
                onChange={e => setEditVariant({ ...editVariant, item: { id: e.target.value } })}
                fullWidth
              >
                <MenuItem value="" disabled>Select Item</MenuItem>
                {items.map(item => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
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