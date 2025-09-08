import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/ApiService';
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

export default function ExpenseManagement() {
  const classes = useStyles();
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0 });
  const [editExpense, setEditExpense] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getExpenses().then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setExpenses(res.data);
      }
      setLoading(false);
    });
  }, []);

  const addExpense = () => {
    createExpense(newExpense).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setExpenses([...expenses, res.data]);
        setNewExpense({ description: '', amount: 0 });
      }
    });
  };

  const handleOpenEditDialog = (expense) => {
    setEditExpense({ ...expense });
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditExpense(null);
  };

  const handleUpdate = () => {
    if (editExpense) {
      updateExpense(editExpense.id, editExpense).then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setExpenses(expenses.map(e => (e.id === editExpense.id ? res.data : e)));
          handleCloseEditDialog();
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteExpense(id).then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Expense Management</Typography>
      <Typography color="error" className={classes.error}>{error}</Typography>
      <Button onClick={() => window.location.reload()} color="primary" variant="contained">Retry</Button>
    </div>
  );

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Expense Management</Typography>
      <Box className={classes.form}>
        <TextField
          label="Description"
          value={newExpense.description}
          onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
        />
        <TextField
          label="Amount"
          type="number"
          value={newExpense.amount}
          onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
        />
        <Button onClick={addExpense} color="primary" variant="contained">Add Expense</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map(expense => (
            <TableRow key={expense.id}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{expense.amount}</TableCell>
              <TableCell>{new Date(expense.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(expense.updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenEditDialog(expense)} color="primary">Update</Button>
                <Button onClick={() => handleDelete(expense.id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Update Expense</DialogTitle>
        <DialogContent>
          {editExpense && (
            <Box className={classes.dialogForm}>
              <TextField
                label="Description"
                value={editExpense.description}
                onChange={e => setEditExpense({ ...editExpense, description: e.target.value })}
                fullWidth
              />
              <TextField
                label="Amount"
                type="number"
                value={editExpense.amount}
                onChange={e => setEditExpense({ ...editExpense, amount: parseFloat(e.target.value) || 0 })}
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