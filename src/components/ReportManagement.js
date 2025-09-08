import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Grid, Card, CardContent, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getFullReport } from '../services/ApiService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  card: {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
  },
  cardTitle: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  table: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tableCell: {
    padding: theme.spacing(1),
  },
  chartContainer: {
    marginTop: theme.spacing(4),
    maxWidth: '600px',
  },
}));

export default function ReportManagement() {
  const classes = useStyles();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getFullReport().then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setReport(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Typography color="error">{error}</Typography>
    </div>
  );

  if (!report) return <Typography>No report data available</Typography>;

  // Prepare data for bar chart
  const barChartData = {
    labels: ['Purchases', 'Sales', 'Expenses', 'FOC Value', 'Profit'],
    datasets: [
      {
        label: 'Summary (₹)',
        data: [
          report.totalPurchase || 0,
          report.totalSale || 0,
          report.totalExpense || 0,
          report.totalFocValue || 0,
          report.profit || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Purchases
          'rgba(75, 192, 192, 0.6)', // Sales
          'rgba(255, 206, 86, 0.6)', // Expenses
          'rgba(153, 102, 255, 0.6)', // FOC Value
          report.profit >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)', // Profit
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          report.profit >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)',
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Single dataset, no need for legend
      },
    },
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Full Report</Typography>

      <Grid container spacing={3} className={classes.section}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Purchases</Typography>
              <Typography className={classes.cardValue}>₹{report.totalPurchase.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Sales</Typography>
              <Typography className={classes.cardValue}>₹{report.totalSale.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Expenses</Typography>
              <Typography className={classes.cardValue}>₹{report.totalExpense.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total FOC Value</Typography>
              <Typography className={classes.cardValue}>₹{report.totalFocValue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Profit</Typography>
              <Typography
                className={classes.cardValue}
                style={{ color: report.profit >= 0 ? 'green' : 'red' }}
              >
                ₹{report.profit.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className={classes.chartContainer}>
        <Typography variant="h5" gutterBottom>Financial Summary</Typography>
        <Bar data={barChartData} options={barChartOptions} />
      </Box>

      <Box className={classes.section}>
        <Typography variant="h5" gutterBottom>Purchases</Typography>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCell}>Item</TableCell>
              <TableCell className={classes.tableCell}>Quantity</TableCell>
              <TableCell className={classes.tableCell}>Cost</TableCell>
              <TableCell className={classes.tableCell}>Company</TableCell>
              <TableCell className={classes.tableCell}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.purchases.map(purchase => (
              <TableRow key={purchase.id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{purchase.item?.name || 'N/A'}</TableCell>
                <TableCell className={classes.tableCell}>{purchase.quantity}</TableCell>
                <TableCell className={classes.tableCell}>₹{purchase.cost.toFixed(2)}</TableCell>
                <TableCell className={classes.tableCell}>{purchase.company?.name || 'N/A'}</TableCell>
                <TableCell className={classes.tableCell}>
                  {new Date(purchase.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box className={classes.section}>
        <Typography variant="h5" gutterBottom>Sales</Typography>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCell}>Item</TableCell>
              <TableCell className={classes.tableCell}>Quantity</TableCell>
              <TableCell className={classes.tableCell}>Price</TableCell>
              <TableCell className={classes.tableCell}>Wholesale</TableCell>
              <TableCell className={classes.tableCell}>Company</TableCell>
              <TableCell className={classes.tableCell}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.sales.map(sale => (
              <TableRow key={sale.id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{sale.item?.name || 'N/A'}</TableCell>
                <TableCell className={classes.tableCell}>{sale.quantity}</TableCell>
                <TableCell className={classes.tableCell}>₹{sale.price.toFixed(2)}</TableCell>
                <TableCell className={classes.tableCell}>{sale.isWholesale ? 'Yes' : 'No'}</TableCell>
                <TableCell className={classes.tableCell}>{sale.company?.name || 'N/A'}</TableCell>
                <TableCell className={classes.tableCell}>
                  {new Date(sale.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box className={classes.section}>
        <Typography variant="h5" gutterBottom>FOCs</Typography>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCell}>Item</TableCell>
              <TableCell className={classes.tableCell}>Quantity</TableCell>
              <TableCell className={classes.tableCell}>Reason</TableCell>
              <TableCell className={classes.tableCell}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.focs.map(foc => (
              <TableRow key={foc.id} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{foc.item?.name || 'N/A'}</TableCell>
                <TableCell className={classes.tableCell}>{foc.quantity}</TableCell>
                <TableCell className={classes.tableCell}>{foc.reason}</TableCell>
                <TableCell className={classes.tableCell}>
                  {new Date(foc.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </div>
  );
}