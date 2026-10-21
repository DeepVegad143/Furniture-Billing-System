import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

import * as authController from '../controllers/authController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as catalogController from '../controllers/catalogController.js';
import * as customerController from '../controllers/customerController.js';
import * as bookController from '../controllers/bookController.js';
import * as quoteController from '../controllers/quoteController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as exportController from '../controllers/exportController.js';

const router = express.Router();

// Health check endpoint (public, used by Render warm-up & cold-start ping)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
router.post('/auth/login', loginLimiter, authController.login);
router.post('/auth/demo', authController.demoLogin);
router.get('/auth/me', authenticate, authController.getMe);
router.put('/auth/language', authenticate, authController.updateLanguage);

// Settings endpoints
router.get('/settings', authenticate, settingsController.getSettings);
router.put('/settings', authenticate, settingsController.updateSettings);

// Catalog endpoints
router.get('/catalog', authenticate, catalogController.getCatalog);
router.post('/catalog', authenticate, catalogController.createCatalogItem);
router.put('/catalog/reorder', authenticate, catalogController.reorderCatalog);
router.put('/catalog/:id', authenticate, catalogController.updateCatalogItem);
router.delete('/catalog/:id', authenticate, catalogController.deleteCatalogItem);

// Customer endpoints
router.get('/customers', authenticate, customerController.getCustomers);
router.post('/customers', authenticate, customerController.createCustomer);
router.get('/customers/:id', authenticate, customerController.getCustomerById);
router.put('/customers/:id', authenticate, customerController.updateCustomer);
router.delete('/customers/:id', authenticate, customerController.deleteCustomer);
router.get('/customers/:id/books', authenticate, customerController.getCustomerBooks);
router.get('/customers/:id/quotes', authenticate, customerController.getCustomerQuotes);

// Book endpoints
router.post('/books', authenticate, bookController.createBook);
router.get('/books/:id', authenticate, bookController.getBookById);
router.put('/books/:id', authenticate, bookController.updateBook);
router.delete('/books/:id', authenticate, bookController.deleteBook);
router.post('/books/:id/payments', authenticate, bookController.addPayment);
router.delete('/books/:id/payments/:paymentId', authenticate, bookController.deletePayment);

// Rate Quote endpoints
router.post('/quotes', authenticate, quoteController.createQuote);
router.get('/quotes/:id', authenticate, quoteController.getQuoteById);

// Dashboard stats endpoint
router.get('/dashboard', authenticate, dashboardController.getDashboard);

// Excel export backup endpoint
router.get('/export/excel', authenticate, exportController.exportToExcel);

export default router;
