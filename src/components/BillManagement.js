import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, Box, Typography, CircularProgress } from '@material-ui/core';
import { getBills, createBill, getBillPdf, getSales, getCompanies } from '../services/ApiService';
import { downloadPdf } from '../utils/PdfDownloader';
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
}));

export default function BillManagement() {
  const classes = useStyles();
  const [bills, setBills] = useState([]);
  const [sales, setSales] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [newBill, setNewBill] = useState({ sales: [], company: { id: '' }, paymentPending: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getBills(), getSales(), getCompanies()]).then(([billsRes, salesRes, companiesRes]) => {
      if (billsRes.error || salesRes.error || companiesRes.error) {
        setError('Failed to load data');
      } else {
        setBills(billsRes.data);
        setSales(salesRes.data);
        setCompanies(companiesRes.data);
      }
      setLoading(false);
    });
  }, []);

  const addBill = () => {
    createBill(newBill).then(res => {
      if (!res.error) {
        setBills([...bills, res.data]);
        setNewBill({ sales: [], company: { id: '' }, paymentPending: true });
      } else {
        setError('Failed to create bill');
      }
    });
  };

  const handleDownloadPdf = (id) => {
    getBillPdf(id).then(res => {
      if (!res.error) {
        downloadPdf(res.data, `bill-${id}.pdf`);
      } else {
        setError('Failed to download PDF');
      }
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Bill Management</Typography>
      <Box className={classes.form}>
        <Select
          multiple
          value={newBill.sales}
          onChange={e => setNewBill({ ...newBill, sales: e.target.value })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Sales</MenuItem>
          {sales.map(sale => (
            <MenuItem key={sale.id} value={sale}>{sale.item?.name || 'N/A'} - {sale.quantity}</MenuItem>
          ))}
        </Select>
        <Select
          value={newBill.company.id}
          onChange={e => setNewBill({ ...newBill, company: { id: e.target.value } })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Company</MenuItem>
          {companies.map(company => (
            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
          ))}
        </Select>
        <Button onClick={addBill} color="primary" variant="contained">Create Bill</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bill ID</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Total Amount</TableCell>
            <TableCell>Payment Pending</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bills.map(bill => (
            <TableRow key={bill.id}>
              <TableCell>{bill.id}</TableCell>
              <TableCell>{bill.company?.name || 'N/A'}</TableCell>
              <TableCell>{bill.totalAmount}</TableCell>
              <TableCell>{bill.paymentPending ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Button onClick={() => handleDownloadPdf(bill.id)} color="primary">Download PDF</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}