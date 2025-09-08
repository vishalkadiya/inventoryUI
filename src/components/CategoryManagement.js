import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/ApiService';
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

export default function CategoryManagement() {
  const classes = useStyles();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editCategory, setEditCategory] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCategories().then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setCategories(res.data);
      }
      setLoading(false);
    });
  }, []);

  const addCategory = () => {
    createCategory(newCategory).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setCategories([...categories, res.data]);
        setNewCategory({ name: '' });
      }
    });
  };

  const handleOpenEditDialog = (category) => {
    setEditCategory({ ...category });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditCategory(null);
  };

  const handleUpdate = () => {
    if (editCategory) {
      updateCategory(editCategory.id, editCategory).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setCategories(categories.map(c => (c.id === editCategory.id ? res.data : c)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteCategory(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setCategories(categories.filter(c => c.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Category Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Category Management</Typography>
      <Box className={classes.form}>
        <TextField
          label="Category Name"
          value={newCategory.name}
          onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <Button onClick={addCategory} color="primary" variant="contained">Add Category</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map(category => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{new Date(category.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(category.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(category)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(category.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Category</DialogTitle>
        <DialogContent>
          {editCategory && (
            <Box className={classes.dialogForm}>
              <TextField
                label="Category Name"
                value={editCategory.name}
                onChange={e => setEditCategory({ ...editCategory, name: e.target.value })}
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