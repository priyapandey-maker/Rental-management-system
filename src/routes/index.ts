import { Router } from 'express';

export const appRouter = Router();

// Health check endpoint
appRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

import { requireTenantContext } from '../middleware/tenantContext';
import { registerUser, registerVendor, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import * as customerController from '../controllers/customer.controller';
import * as addressController from '../controllers/address.controller';
import * as categoryController from '../controllers/category.controller';
import * as productController from '../controllers/product.controller';
import * as attributeController from '../controllers/attribute.controller';
import * as variantController from '../controllers/variant.controller';
import * as assetController from '../controllers/asset.controller';
import * as pricingController from '../controllers/pricing.controller';
import * as rentalConfigController from '../controllers/rentalConfig.controller';
import * as transactionController from '../controllers/transaction.controller';
import * as orchestrationController from '../controllers/orchestration.controller';
import * as invoiceController from '../controllers/invoice.controller';
import * as paymentController from '../controllers/payment.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import * as readController from '../controllers/read.controller';

// Public Auth Routes
const authRouter = Router();
authRouter.post('/register', registerUser);
authRouter.post('/vendor-register', registerVendor);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
appRouter.use('/auth', authRouter);

// Apply requireTenantContext to all domain routes
const tenantRouter = Router();
tenantRouter.use(requireTenantContext);

// Customers
tenantRouter.post('/customers', customerController.createCustomer);
tenantRouter.get('/customers/:id', customerController.getCustomer);
tenantRouter.put('/customers/:id', customerController.updateCustomer);
tenantRouter.get('/customers', customerController.listCustomers);

// Customer Addresses
tenantRouter.post('/customers/:customerId/addresses', addressController.createAddress);
tenantRouter.get('/customers/:customerId/addresses', addressController.listAddresses);
tenantRouter.get('/addresses/:id', addressController.getAddress);
tenantRouter.put('/addresses/:id', addressController.updateAddress);

// Categories
tenantRouter.post('/categories', categoryController.createCategory);
tenantRouter.get('/categories/:id', categoryController.getCategory);
tenantRouter.get('/categories', categoryController.listCategories);

// Products
tenantRouter.post('/products', productController.createProduct);
tenantRouter.get('/products/:id', productController.getProduct);
tenantRouter.put('/products/:id', productController.updateProduct);
tenantRouter.get('/products', productController.listProducts);

// Attributes
tenantRouter.post('/attributes', attributeController.createAttribute);
tenantRouter.get('/attributes/:id', attributeController.getAttribute);
tenantRouter.get('/attributes', attributeController.listAttributes);
tenantRouter.post('/attributes/:id/values', attributeController.createAttributeValue);
tenantRouter.get('/attributes/:id/values', attributeController.listAttributeValues);

// Variants
tenantRouter.post('/variants', variantController.createVariant);
tenantRouter.get('/variants/:id', variantController.getVariant);
tenantRouter.get('/products/:productId/variants', variantController.listVariantsByProduct);

// Assets
tenantRouter.post('/assets', assetController.createAsset);
tenantRouter.get('/assets/:id', assetController.getAsset);
tenantRouter.get('/assets', assetController.listAssets);

// Rental Periods
tenantRouter.post('/rental-periods', pricingController.createRentalPeriod);
tenantRouter.get('/rental-periods', pricingController.listRentalPeriods);

// Pricelists
tenantRouter.post('/pricelists', pricingController.createPricelist);
tenantRouter.get('/pricelists', pricingController.listPricelists);
tenantRouter.get('/pricelists/:id', pricingController.getPricelist);
tenantRouter.post('/pricelists/:id/items', pricingController.createPricelistItem);
tenantRouter.get('/pricelists/:id/items', pricingController.listPricelistItems);

// Rental Settings
tenantRouter.get('/rental-settings', rentalConfigController.getSettings);
tenantRouter.put('/rental-settings', rentalConfigController.updateSettings);

// Late Fee Rules
tenantRouter.post('/late-fee-rules', rentalConfigController.createLateFeeRule);
tenantRouter.get('/late-fee-rules/:id', rentalConfigController.getLateFeeRule);
tenantRouter.get('/late-fee-rules', rentalConfigController.listLateFeeRules);

import * as allocationController from '../controllers/allocation.controller';
import * as fulfillmentController from '../controllers/fulfillment.controller';
import * as returnController from '../controllers/return.controller';
import * as inspectionController from '../controllers/inspection.controller';
import * as adjustmentController from '../controllers/adjustment.controller';

// Transactions
tenantRouter.post('/transactions', transactionController.createTransaction);
tenantRouter.get('/transactions', transactionController.listTransactions);
tenantRouter.get('/transactions/:id', transactionController.getTransaction);
tenantRouter.post('/transactions/:id/lines', transactionController.addTransactionLine);
tenantRouter.post('/transactions/:id/confirm', transactionController.confirmTransaction);
tenantRouter.post('/transactions/:id/cancel', transactionController.cancelTransaction);

// Allocations
tenantRouter.post('/allocations', allocationController.createAllocation);
tenantRouter.get('/allocations/:id', allocationController.getAllocation);
tenantRouter.get('/allocations/transaction-lines/:lineId', allocationController.listAllocations);

// Fulfillments
tenantRouter.post('/fulfillments', fulfillmentController.createFulfillment);
tenantRouter.get('/fulfillments/:id', fulfillmentController.getFulfillment);
tenantRouter.get('/fulfillments/transactions/:txId', fulfillmentController.getFulfillmentByTx);

// Returns
tenantRouter.post('/returns', returnController.createReturn);
tenantRouter.get('/returns/:id', returnController.getReturn);
tenantRouter.get('/returns/transactions/:txId', returnController.getReturnByTx);

// Inspections
tenantRouter.post('/inspections', inspectionController.createInspection);
tenantRouter.get('/inspections/:id', inspectionController.getInspection);
tenantRouter.get('/inspections/returns/:returnId', inspectionController.listInspections);

// Adjustments
tenantRouter.post('/adjustments', adjustmentController.createAdjustment);
tenantRouter.get('/adjustments/:id', adjustmentController.getAdjustment);
tenantRouter.get('/adjustments/transactions/:txId', adjustmentController.listAdjustments);
tenantRouter.put('/adjustments/:id/status', adjustmentController.updateStatus);

// Orchestration (Fulfillment & Allocation)
tenantRouter.post('/transactions/:id/allocate', orchestrationController.allocateTransaction);
tenantRouter.post('/transactions/:id/fulfill', orchestrationController.fulfillTransaction);
tenantRouter.post('/transactions/:id/return', orchestrationController.returnTransaction);
// Invoices
tenantRouter.post('/invoices', invoiceController.createInvoice);
tenantRouter.get('/invoices/:id', invoiceController.getInvoice);
tenantRouter.post('/invoices/:id/issue', invoiceController.issueInvoice);

// Payments
tenantRouter.post('/payments', paymentController.recordPayment);
tenantRouter.get('/payments/:id', paymentController.getPayment);
tenantRouter.get('/payments/invoices/:invoiceId', paymentController.listPaymentsByInvoice);

// Dashboard
tenantRouter.get('/dashboard', dashboardController.getDashboardSummary);

// Reads
tenantRouter.get('/reads/transactions', readController.listTransactions);
tenantRouter.get('/reads/invoices', readController.listInvoices);

appRouter.use(tenantRouter);

