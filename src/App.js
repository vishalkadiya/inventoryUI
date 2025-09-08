import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ItemManagement from './components/ItemManagement';
import CategoryManagement from './components/CategoryManagement';
import PurchaseManagement from './components/PurchaseManagement';
import SaleManagement from './components/SaleManagement';
import BillManagement from './components/BillManagement';
import CompanyManagement from './components/CompanyManagement';
import ExpenseManagement from './components/ExpenseManagement';
import FocManagement from './components/FocManagement';
import ReportManagement from './components/ReportManagement';
import VariantManagement from './components/VariantManagement';
import HistoryManagement from './components/HistoryManagement';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    margin: theme.spacing(1),
  },
  content: {
    marginTop: theme.spacing(8),
  },
}));

function App() {
  const classes = useStyles();

  return (
    <Router>
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              VISHARA
            </Typography>
            <Button color="inherit">
              <Link to="/" className={classes.link}>Dashboard</Link>
            </Button>
            <Button color="inherit">
              <Link to="/items" className={classes.link}>Items</Link>
            </Button>
            <Button color="inherit">
              <Link to="/variants" className={classes.link}>Variants</Link>
            </Button>
            <Button color="inherit">
              <Link to="/categories" className={classes.link}>Categories</Link>
            </Button>
            <Button color="inherit">
              <Link to="/purchases" className={classes.link}>Purchases</Link>
            </Button>
            <Button color="inherit">
              <Link to="/sales" className={classes.link}>Sales</Link>
            </Button>
            <Button color="inherit">
              <Link to="/bills" className={classes.link}>Bills</Link>
            </Button>
            <Button color="inherit">
              <Link to="/companies" className={classes.link}>Companies</Link>
            </Button>
            <Button color="inherit">
              <Link to="/expenses" className={classes.link}>Expenses</Link>
            </Button>
            <Button color="inherit">
              <Link to="/focs" className={classes.link}>FOC</Link>
            </Button>
            <Button color="inherit">
              <Link to="/reports" className={classes.link}>Reports</Link>
            </Button>
            <Button color="inherit">
              <Link to="/history" className={classes.link}>History</Link>
            </Button>
          </Toolbar>
        </AppBar>
        <Container className={classes.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/items" element={<ItemManagement />} />
            <Route path="/variants" element={<VariantManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/purchases" element={<PurchaseManagement />} />
            <Route path="/sales" element={<SaleManagement />} />
            <Route path="/bills" element={<BillManagement />} />
            <Route path="/companies" element={<CompanyManagement />} />
            <Route path="/expenses" element={<ExpenseManagement />} />
            <Route path="/focs" element={<FocManagement />} />
            <Route path="/reports" element={<ReportManagement />} />
            <Route path="/history" element={<HistoryManagement />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;