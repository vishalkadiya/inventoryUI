import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8083/api',
});

const handleError = (error) => {
  if (error.response) {
    return { error: `API Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}` };
  } else if (error.request) {
    return { error: 'Network Error: No response from server. Is the backend running at http://localhost:8083?' };
  } else {
    return { error: `Request Error: ${error.message}` };
  }
};

export const getItems = () => api.get('/items').catch(handleError);
export const createItem = (item) => api.post('/items', item).catch(handleError);
export const updateItem = (id, item) => api.put(`/items/${id}`, item).catch(handleError);
export const deleteItem = (id) => api.delete(`/items/${id}`).catch(handleError);

export const getVariants = () => api.get('/variants').catch(handleError);
export const createVariant = (variant) => api.post('/variants', variant).catch(handleError);
export const updateVariant = (id, variant) => api.put(`/variants/${id}`, variant).catch(handleError);
export const deleteVariant = (id) => api.delete(`/variants/${id}`).catch(handleError);

export const getCategories = () => api.get('/categories').catch(handleError);
export const createCategory = (category) => api.post('/categories', category).catch(handleError);
export const updateCategory = (id, category) => api.put(`/categories/${id}`, category).catch(handleError);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).catch(handleError);

export const getPurchases = () => api.get('/purchases').catch(handleError);
export const createPurchase = (purchase) => api.post('/purchases', purchase).catch(handleError);
export const updatePurchase = (id, purchase) => api.put(`/purchases/${id}`, purchase).catch(handleError);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`).catch(handleError);

export const getSales = () => api.get('/sales').catch(handleError);
export const createSale = (sale) => api.post('/sales', sale).catch(handleError);
export const updateSale = (id, sale) => api.put(`/sales/${id}`, sale).catch(handleError);
export const deleteSale = (id) => api.delete(`/sales/${id}`).catch(handleError);

export const getBills = () => api.get('/bills').catch(handleError);
export const createBill = (bill) => api.post('/bills', bill).catch(handleError);
export const updateBill = (id, bill) => api.put(`/bills/${id}`, bill).catch(handleError);
export const deleteBill = (id) => api.delete(`/bills/${id}`).catch(handleError);
export const getBillPdf = (id) => api.get(`/bills/${id}/pdf`, { responseType: 'blob' }).catch(handleError);

export const getCompanies = () => api.get('/companies').catch(handleError);
export const createCompany = (company) => api.post('/companies', company).catch(handleError);
export const updateCompany = (id, company) => api.put(`/companies/${id}`, company).catch(handleError);
export const deleteCompany = (id) => api.delete(`/companies/${id}`).catch(handleError);

export const getExpenses = () => api.get('/expenses').catch(handleError);
export const createExpense = (expense) => api.post('/expenses', expense).catch(handleError);
export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense).catch(handleError);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).catch(handleError);

export const getFocs = () => api.get('/focs').catch(handleError);
export const createFoc = (foc) => api.post('/focs', foc).catch(handleError);
export const updateFoc = (id, foc) => api.put(`/focs/${id}`, foc).catch(handleError);
export const deleteFoc = (id) => api.delete(`/focs/${id}`).catch(handleError);

export const getProfitLoss = () => api.get('/reports/profit-loss').catch(handleError);
export const getFullReport = () => api.get('/reports/full').catch(handleError);
export const getStockByCategory = () => api.get('/reports/stock-by-category').catch(handleError);

export const getHistory = () => api.get('/history').catch(handleError);