import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Card, CardContent, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { getFullReport, getStockByCategory, getItems } from '../services/ApiService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
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
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  chartContainer: {
    marginTop: theme.spacing(4),
    maxWidth: '600px',
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const [report, setReport] = useState(null);
  const [stockByCategory, setStockByCategory] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getFullReport(), getStockByCategory(), getItems()]).then(([reportRes, stockRes, itemsRes]) => {
      if (reportRes.error || stockRes.error || itemsRes.error) {
        setError(reportRes.error || stockRes.error || itemsRes.error);
      } else {
        setReport(reportRes.data);
        setStockByCategory(stockRes.data);
        setItems(itemsRes.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography color="error">{error}</Typography>
    </div>
  );

  // Calculate metrics
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const totalSales = report?.totalSale || 0;
  const totalPurchases = report?.totalPurchase || 0;
  const totalExpenses = report?.totalExpense || 0;
  const totalFocValue = report?.totalFocValue || 0;
  const profit = report?.profit || 0;

  // Prepare data for bar chart (sales/purchases over last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const salesByDate = last7Days.map(date => {
    return report?.sales
      .filter(s => new Date(s.createdAt).toISOString().split('T')[0] === date)
      .reduce((sum, s) => sum + s.quantity * s.price, 0) || 0;
  });

  const purchasesByDate = last7Days.map(date => {
    return report?.purchases
      .filter(p => new Date(p.createdAt).toISOString().split('T')[0] === date)
      .reduce((sum, p) => sum + p.quantity * p.cost, 0) || 0;
  });

  const barChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Sales',
        data: salesByDate,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Purchases',
        data: purchasesByDate,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
          text: 'Amount ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Prepare data for pie chart (stock by category)
  const categoryLabels = stockByCategory.map(c => c.categoryName);
  const categoryStockData = stockByCategory.map(c => c.totalStock);

  const pieChartData = {
    labels: categoryLabels.length ? categoryLabels : ['No Data'],
    datasets: [
      {
        label: 'Stock',
        data: categoryStockData.length ? categoryStockData : [1], // Prevent empty chart
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Items</Typography>
              <Typography className={classes.cardValue}>{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Stock</Typography>
              <Typography className={classes.cardValue}>{totalStock}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Sales</Typography>
              <Typography className={classes.cardValue}>${totalSales.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Purchases</Typography>
              <Typography className={classes.cardValue}>${totalPurchases.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total Expenses</Typography>
              <Typography className={classes.cardValue}>${totalExpenses.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Total FOC Value</Typography>
              <Typography className={classes.cardValue}>${totalFocValue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.cardTitle}>Profit</Typography>
              <Typography className={classes.cardValue} style={{ color: profit >= 0 ? 'green' : 'red' }}>
                ${profit.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className={classes.chartContainer}>
        <Typography variant="h5" gutterBottom>Sales vs Purchases (Last 7 Days)</Typography>
        <Bar data={barChartData} options={barChartOptions} />
      </Box>

      <Box className={classes.chartContainer}>
        <Typography variant="h5" gutterBottom>Stock by Category</Typography>
        <Pie data={pieChartData} options={pieChartOptions} />
      </Box>
    </div>
  );
}