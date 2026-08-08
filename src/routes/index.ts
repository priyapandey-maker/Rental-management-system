import { Router } from 'express';
import { requireAuth, requireRole, requireOrganizationAccess } from '../middleware/requireRole';

export const appRouter = Router();

// Health check endpoint (public)
appRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// AUTH ROUTES — Public (no authentication required)
// ============================================================
import { registerUser, registerVendor, login, forgotPassword, resetPassword } from '../controllers/auth.controller';

const authRouter = Router();
authRouter.post('/register', registerUser);
authRouter.post('/vendor-register', registerVendor);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
appRouter.use('/auth', authRouter);

// ============================================================
// IMPORT ALL CONTROLLERS
// ============================================================
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
import * as allocationController from '../controllers/allocation.controller';
import * as fulfillmentController from '../controllers/fulfillment.controller';
import * as returnController from '../controllers/return.controller';
import * as inspectionController from '../controllers/inspection.controller';
import * as adjustmentController from '../controllers/adjustment.controller';

// ============================================================
// CUSTOMER STOREFRONT ROUTES
// Read-only product/category browsing. Requires auth (customer role).
// ============================================================
const customerRouter = Router();
customerRouter.use(requireAuth);
customerRouter.use(requireRole('customer', 'vendor', 'admin')); // all authenticated roles can browse

// Product browsing (READ ONLY)
customerRouter.get('/products', productController.listProducts);
customerRouter.get('/products/:id', productController.getProduct);
customerRouter.get('/products/:productId/variants', variantController.listVariantsByProduct);
customerRouter.get('/categories', categoryController.listCategories);
customerRouter.get('/categories/:id', categoryController.getCategory);
customerRouter.get('/rental-periods', pricingController.listRentalPeriods);
customerRouter.get('/pricelists', pricingController.listPricelists);
customerRouter.get('/pricelists/:id', pricingController.getPricelist);
customerRouter.get('/pricelists/:id/items', pricingController.listPricelistItems);

appRouter.use('/storefront', customerRouter);

// ============================================================
// VENDOR ROUTES
// Vendors manage their own organization's data.
// ============================================================
const vendorRouter = Router();
vendorRouter.use(requireAuth);
vendorRouter.use(requireOrganizationAccess);
vendorRouter.use(requireRole('vendor', 'admin'));

// Product management (vendors manage own products)
vendorRouter.post('/products', productController.createProduct);
vendorRouter.get('/products', productController.listProducts);
vendorRouter.get('/products/:id', productController.getProduct);
vendorRouter.put('/products/:id', productController.updateProduct);

// Variant management
vendorRouter.post('/variants', variantController.createVariant);
vendorRouter.get('/variants/:id', variantController.getVariant);
vendorRouter.get('/products/:productId/variants', variantController.listVariantsByProduct);

// Category browsing (read-only for vendor)
vendorRouter.get('/categories', categoryController.listCategories);
vendorRouter.get('/categories/:id', categoryController.getCategory);

// Asset management (vendor manages own assets)
vendorRouter.post('/assets', assetController.createAsset);
vendorRouter.get('/assets/:id', assetController.getAsset);
vendorRouter.get('/assets', assetController.listAssets);

// Pricing
vendorRouter.post('/rental-periods', pricingController.createRentalPeriod);
vendorRouter.get('/rental-periods', pricingController.listRentalPeriods);
vendorRouter.post('/pricelists', pricingController.createPricelist);
vendorRouter.get('/pricelists', pricingController.listPricelists);
vendorRouter.get('/pricelists/:id', pricingController.getPricelist);
vendorRouter.post('/pricelists/:id/items', pricingController.createPricelistItem);
vendorRouter.get('/pricelists/:id/items', pricingController.listPricelistItems);

// Attributes
vendorRouter.post('/attributes', attributeController.createAttribute);
vendorRouter.get('/attributes/:id', attributeController.getAttribute);
vendorRouter.get('/attributes', attributeController.listAttributes);
vendorRouter.post('/attributes/:id/values', attributeController.createAttributeValue);
vendorRouter.get('/attributes/:id/values', attributeController.listAttributeValues);

// Rental Settings
vendorRouter.get('/rental-settings', rentalConfigController.getSettings);
vendorRouter.put('/rental-settings', rentalConfigController.updateSettings);
vendorRouter.post('/late-fee-rules', rentalConfigController.createLateFeeRule);
vendorRouter.get('/late-fee-rules/:id', rentalConfigController.getLateFeeRule);
vendorRouter.get('/late-fee-rules', rentalConfigController.listLateFeeRules);

// Transactions & lifecycle (vendor manages rental operations)
vendorRouter.post('/customers', customerController.createCustomer);
vendorRouter.get('/customers/:id', customerController.getCustomer);
vendorRouter.put('/customers/:id', customerController.updateCustomer);
vendorRouter.get('/customers', customerController.listCustomers);
vendorRouter.post('/customers/:customerId/addresses', addressController.createAddress);
vendorRouter.get('/customers/:customerId/addresses', addressController.listAddresses);
vendorRouter.get('/addresses/:id', addressController.getAddress);
vendorRouter.put('/addresses/:id', addressController.updateAddress);

vendorRouter.post('/transactions', transactionController.createTransaction);
vendorRouter.get('/transactions', transactionController.listTransactions);
vendorRouter.get('/transactions/:id', transactionController.getTransaction);
vendorRouter.post('/transactions/:id/lines', transactionController.addTransactionLine);
vendorRouter.post('/transactions/:id/confirm', transactionController.confirmTransaction);
vendorRouter.post('/transactions/:id/cancel', transactionController.cancelTransaction);
vendorRouter.post('/transactions/:id/allocate', orchestrationController.allocateTransaction);
vendorRouter.post('/transactions/:id/fulfill', orchestrationController.fulfillTransaction);
vendorRouter.post('/transactions/:id/return', orchestrationController.returnTransaction);

vendorRouter.post('/allocations', allocationController.createAllocation);
vendorRouter.get('/allocations/:id', allocationController.getAllocation);
vendorRouter.get('/allocations/transaction-lines/:lineId', allocationController.listAllocations);

vendorRouter.post('/fulfillments', fulfillmentController.createFulfillment);
vendorRouter.get('/fulfillments/:id', fulfillmentController.getFulfillment);
vendorRouter.get('/fulfillments/transactions/:txId', fulfillmentController.getFulfillmentByTx);

vendorRouter.post('/returns', returnController.createReturn);
vendorRouter.get('/returns/:id', returnController.getReturn);
vendorRouter.get('/returns/transactions/:txId', returnController.getReturnByTx);

vendorRouter.post('/inspections', inspectionController.createInspection);
vendorRouter.get('/inspections/:id', inspectionController.getInspection);
vendorRouter.get('/inspections/returns/:returnId', inspectionController.listInspections);

vendorRouter.post('/adjustments', adjustmentController.createAdjustment);
vendorRouter.get('/adjustments/:id', adjustmentController.getAdjustment);
vendorRouter.get('/adjustments/transactions/:txId', adjustmentController.listAdjustments);
vendorRouter.put('/adjustments/:id/status', adjustmentController.updateStatus);

vendorRouter.post('/invoices', invoiceController.createInvoice);
vendorRouter.get('/invoices/:id', invoiceController.getInvoice);
vendorRouter.post('/invoices/:id/issue', invoiceController.issueInvoice);

vendorRouter.post('/payments', paymentController.recordPayment);
vendorRouter.get('/payments/:id', paymentController.getPayment);
vendorRouter.get('/payments/invoices/:invoiceId', paymentController.listPaymentsByInvoice);

vendorRouter.get('/dashboard', dashboardController.getDashboardSummary);
vendorRouter.get('/reads/transactions', readController.listTransactions);
vendorRouter.get('/reads/invoices', readController.listInvoices);

appRouter.use('/vendor', vendorRouter);

// ============================================================
// ADMIN ROUTES
// Full platform management — admin role only.
// ============================================================
const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requireOrganizationAccess);
adminRouter.use(requireRole('admin'));

// Admin gets all vendor capabilities + platform-wide management
// Re-expose all routes under /admin prefix as well
adminRouter.get('/customers', customerController.listCustomers);
adminRouter.post('/customers', customerController.createCustomer);
adminRouter.get('/customers/:id', customerController.getCustomer);
adminRouter.put('/customers/:id', customerController.updateCustomer);
adminRouter.post('/customers/:customerId/addresses', addressController.createAddress);
adminRouter.get('/customers/:customerId/addresses', addressController.listAddresses);
adminRouter.get('/addresses/:id', addressController.getAddress);
adminRouter.put('/addresses/:id', addressController.updateAddress);
adminRouter.post('/categories', categoryController.createCategory);
adminRouter.get('/categories/:id', categoryController.getCategory);
adminRouter.get('/categories', categoryController.listCategories);
adminRouter.post('/products', productController.createProduct);
adminRouter.get('/products/:id', productController.getProduct);
adminRouter.put('/products/:id', productController.updateProduct);
adminRouter.get('/products', productController.listProducts);
adminRouter.post('/attributes', attributeController.createAttribute);
adminRouter.get('/attributes/:id', attributeController.getAttribute);
adminRouter.get('/attributes', attributeController.listAttributes);
adminRouter.post('/attributes/:id/values', attributeController.createAttributeValue);
adminRouter.get('/attributes/:id/values', attributeController.listAttributeValues);
adminRouter.post('/variants', variantController.createVariant);
adminRouter.get('/variants/:id', variantController.getVariant);
adminRouter.get('/products/:productId/variants', variantController.listVariantsByProduct);
adminRouter.post('/assets', assetController.createAsset);
adminRouter.get('/assets/:id', assetController.getAsset);
adminRouter.get('/assets', assetController.listAssets);
adminRouter.post('/rental-periods', pricingController.createRentalPeriod);
adminRouter.get('/rental-periods', pricingController.listRentalPeriods);
adminRouter.post('/pricelists', pricingController.createPricelist);
adminRouter.get('/pricelists', pricingController.listPricelists);
adminRouter.get('/pricelists/:id', pricingController.getPricelist);
adminRouter.post('/pricelists/:id/items', pricingController.createPricelistItem);
adminRouter.get('/pricelists/:id/items', pricingController.listPricelistItems);
adminRouter.get('/rental-settings', rentalConfigController.getSettings);
adminRouter.put('/rental-settings', rentalConfigController.updateSettings);
adminRouter.post('/late-fee-rules', rentalConfigController.createLateFeeRule);
adminRouter.get('/late-fee-rules/:id', rentalConfigController.getLateFeeRule);
adminRouter.get('/late-fee-rules', rentalConfigController.listLateFeeRules);
adminRouter.post('/transactions', transactionController.createTransaction);
adminRouter.get('/transactions', transactionController.listTransactions);
adminRouter.get('/transactions/:id', transactionController.getTransaction);
adminRouter.post('/transactions/:id/lines', transactionController.addTransactionLine);
adminRouter.post('/transactions/:id/confirm', transactionController.confirmTransaction);
adminRouter.post('/transactions/:id/cancel', transactionController.cancelTransaction);
adminRouter.post('/transactions/:id/allocate', orchestrationController.allocateTransaction);
adminRouter.post('/transactions/:id/fulfill', orchestrationController.fulfillTransaction);
adminRouter.post('/transactions/:id/return', orchestrationController.returnTransaction);
adminRouter.post('/allocations', allocationController.createAllocation);
adminRouter.get('/allocations/:id', allocationController.getAllocation);
adminRouter.get('/allocations/transaction-lines/:lineId', allocationController.listAllocations);
adminRouter.post('/fulfillments', fulfillmentController.createFulfillment);
adminRouter.get('/fulfillments/:id', fulfillmentController.getFulfillment);
adminRouter.get('/fulfillments/transactions/:txId', fulfillmentController.getFulfillmentByTx);
adminRouter.post('/returns', returnController.createReturn);
adminRouter.get('/returns/:id', returnController.getReturn);
adminRouter.get('/returns/transactions/:txId', returnController.getReturnByTx);
adminRouter.post('/inspections', inspectionController.createInspection);
adminRouter.get('/inspections/:id', inspectionController.getInspection);
adminRouter.get('/inspections/returns/:returnId', inspectionController.listInspections);
adminRouter.post('/adjustments', adjustmentController.createAdjustment);
adminRouter.get('/adjustments/:id', adjustmentController.getAdjustment);
adminRouter.get('/adjustments/transactions/:txId', adjustmentController.listAdjustments);
adminRouter.put('/adjustments/:id/status', adjustmentController.updateStatus);
adminRouter.post('/invoices', invoiceController.createInvoice);
adminRouter.get('/invoices/:id', invoiceController.getInvoice);
adminRouter.post('/invoices/:id/issue', invoiceController.issueInvoice);
adminRouter.post('/payments', paymentController.recordPayment);
adminRouter.get('/payments/:id', paymentController.getPayment);
adminRouter.get('/payments/invoices/:invoiceId', paymentController.listPaymentsByInvoice);
adminRouter.get('/dashboard', dashboardController.getDashboardSummary);
adminRouter.get('/reads/transactions', readController.listTransactions);
adminRouter.get('/reads/invoices', readController.listInvoices);

appRouter.use('/admin', adminRouter);

// ============================================================
// LEGACY COMPATIBILITY — Keep existing flat routes working
// for the existing frontend pages (Dashboard, Products, etc.)
// These are gated to vendor+admin for now, matching old behavior.
// ============================================================
const legacyRouter = Router();
legacyRouter.use(requireAuth);
legacyRouter.use(requireOrganizationAccess);
legacyRouter.use(requireRole('vendor', 'admin'));

legacyRouter.post('/customers', customerController.createCustomer);
legacyRouter.get('/customers/:id', customerController.getCustomer);
legacyRouter.put('/customers/:id', customerController.updateCustomer);
legacyRouter.get('/customers', customerController.listCustomers);
legacyRouter.post('/customers/:customerId/addresses', addressController.createAddress);
legacyRouter.get('/customers/:customerId/addresses', addressController.listAddresses);
legacyRouter.get('/addresses/:id', addressController.getAddress);
legacyRouter.put('/addresses/:id', addressController.updateAddress);
legacyRouter.post('/categories', categoryController.createCategory);
legacyRouter.get('/categories/:id', categoryController.getCategory);
legacyRouter.get('/categories', categoryController.listCategories);
legacyRouter.post('/products', productController.createProduct);
legacyRouter.get('/products/:id', productController.getProduct);
legacyRouter.put('/products/:id', productController.updateProduct);
legacyRouter.get('/products', productController.listProducts);
legacyRouter.post('/attributes', attributeController.createAttribute);
legacyRouter.get('/attributes/:id', attributeController.getAttribute);
legacyRouter.get('/attributes', attributeController.listAttributes);
legacyRouter.post('/attributes/:id/values', attributeController.createAttributeValue);
legacyRouter.get('/attributes/:id/values', attributeController.listAttributeValues);
legacyRouter.post('/variants', variantController.createVariant);
legacyRouter.get('/variants/:id', variantController.getVariant);
legacyRouter.get('/products/:productId/variants', variantController.listVariantsByProduct);
legacyRouter.post('/assets', assetController.createAsset);
legacyRouter.get('/assets/:id', assetController.getAsset);
legacyRouter.get('/assets', assetController.listAssets);
legacyRouter.post('/rental-periods', pricingController.createRentalPeriod);
legacyRouter.get('/rental-periods', pricingController.listRentalPeriods);
legacyRouter.post('/pricelists', pricingController.createPricelist);
legacyRouter.get('/pricelists', pricingController.listPricelists);
legacyRouter.get('/pricelists/:id', pricingController.getPricelist);
legacyRouter.post('/pricelists/:id/items', pricingController.createPricelistItem);
legacyRouter.get('/pricelists/:id/items', pricingController.listPricelistItems);
legacyRouter.get('/rental-settings', rentalConfigController.getSettings);
legacyRouter.put('/rental-settings', rentalConfigController.updateSettings);
legacyRouter.post('/late-fee-rules', rentalConfigController.createLateFeeRule);
legacyRouter.get('/late-fee-rules/:id', rentalConfigController.getLateFeeRule);
legacyRouter.get('/late-fee-rules', rentalConfigController.listLateFeeRules);
legacyRouter.post('/transactions', transactionController.createTransaction);
legacyRouter.get('/transactions', transactionController.listTransactions);
legacyRouter.get('/transactions/:id', transactionController.getTransaction);
legacyRouter.post('/transactions/:id/lines', transactionController.addTransactionLine);
legacyRouter.post('/transactions/:id/confirm', transactionController.confirmTransaction);
legacyRouter.post('/transactions/:id/cancel', transactionController.cancelTransaction);
legacyRouter.post('/transactions/:id/allocate', orchestrationController.allocateTransaction);
legacyRouter.post('/transactions/:id/fulfill', orchestrationController.fulfillTransaction);
legacyRouter.post('/transactions/:id/return', orchestrationController.returnTransaction);
legacyRouter.post('/allocations', allocationController.createAllocation);
legacyRouter.get('/allocations/:id', allocationController.getAllocation);
legacyRouter.get('/allocations/transaction-lines/:lineId', allocationController.listAllocations);
legacyRouter.post('/fulfillments', fulfillmentController.createFulfillment);
legacyRouter.get('/fulfillments/:id', fulfillmentController.getFulfillment);
legacyRouter.get('/fulfillments/transactions/:txId', fulfillmentController.getFulfillmentByTx);
legacyRouter.post('/returns', returnController.createReturn);
legacyRouter.get('/returns/:id', returnController.getReturn);
legacyRouter.get('/returns/transactions/:txId', returnController.getReturnByTx);
legacyRouter.post('/inspections', inspectionController.createInspection);
legacyRouter.get('/inspections/:id', inspectionController.getInspection);
legacyRouter.get('/inspections/returns/:returnId', inspectionController.listInspections);
legacyRouter.post('/adjustments', adjustmentController.createAdjustment);
legacyRouter.get('/adjustments/:id', adjustmentController.getAdjustment);
legacyRouter.get('/adjustments/transactions/:txId', adjustmentController.listAdjustments);
legacyRouter.put('/adjustments/:id/status', adjustmentController.updateStatus);
legacyRouter.post('/invoices', invoiceController.createInvoice);
legacyRouter.get('/invoices/:id', invoiceController.getInvoice);
legacyRouter.post('/invoices/:id/issue', invoiceController.issueInvoice);
legacyRouter.post('/payments', paymentController.recordPayment);
legacyRouter.get('/payments/:id', paymentController.getPayment);
legacyRouter.get('/payments/invoices/:invoiceId', paymentController.listPaymentsByInvoice);
legacyRouter.get('/dashboard', dashboardController.getDashboardSummary);
legacyRouter.get('/reads/transactions', readController.listTransactions);
legacyRouter.get('/reads/invoices', readController.listInvoices);

appRouter.use(legacyRouter);
