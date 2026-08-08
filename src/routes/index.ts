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

// Transactions
tenantRouter.post('/transactions', transactionController.createTransaction);
tenantRouter.get('/transactions', transactionController.listTransactions);
tenantRouter.get('/transactions/:id', transactionController.getTransaction);
tenantRouter.post('/transactions/:id/lines', transactionController.addTransactionLine);
tenantRouter.post('/transactions/:id/confirm', transactionController.confirmTransaction);
tenantRouter.post('/transactions/:id/cancel', transactionController.cancelTransaction);

appRouter.use(tenantRouter);

