import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress } from '@material-ui/core';
import { getHistory } from '../services/ApiService';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

export default function HistoryManagement() {
  const classes = useStyles();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getHistory().then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setHistory(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>History</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Entity Type</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map(entry => (
            <TableRow key={entry.id}>
              <TableCell>{entry.entityType}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.details}</TableCell>
              <TableCell>{entry.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}