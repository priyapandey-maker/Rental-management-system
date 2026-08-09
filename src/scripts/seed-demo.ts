import { getPool } from '../db/pool';
import bcrypt from 'bcrypt';

const pool = getPool();

const DEMO_ORG_ID = '6f3875f5-49a2-4bee-9dc1-927b5907020a';

// Category mapping for images
const CATEGORIES = [
  { id: 'cat-laptops-01', name: 'Laptops', code: 'D-LPT', desc: 'High-performance laptops for work and gaming', imageQuery: 'laptop' },
  { id: 'cat-cameras-02', name: 'Cameras', code: 'D-CAM', desc: 'Professional cinema and DSLR cameras', imageQuery: 'camera' },
  { id: 'cat-audio-03', name: 'Audio', code: 'D-AUD', desc: 'Microphones, mixers, and headphones', imageQuery: 'headphones' },
  { id: 'cat-gaming-04', name: 'Gaming Consoles', code: 'D-GAM', desc: 'Next-gen gaming consoles and VR', imageQuery: 'gaming,console' },
  { id: 'cat-furniture-05', name: 'Furniture', code: 'D-FURN', desc: 'Office and home furniture rentals', imageQuery: 'furniture' },
  { id: 'cat-projectors-06', name: 'TV & Projectors', code: 'D-TVP', desc: 'Large screens and projectors', imageQuery: 'projector,tv' },
  { id: 'cat-wearables-07', name: 'Wearables', code: 'D-WRB', desc: 'Smartwatches and fitness trackers', imageQuery: 'smartwatch' },
  { id: 'cat-homeapp-08', name: 'Home Appliances', code: 'D-HAPP', desc: 'Vacuums, purifiers, and kitchen gear', imageQuery: 'home,appliance' },
  { id: 'cat-drones-09', name: 'Drones', code: 'D-DRN', desc: 'Aerial photography drones', imageQuery: 'drone' },
  { id: 'cat-event-10', name: 'Event Equipment', code: 'D-EVT', desc: 'Lighting and staging equipment', imageQuery: 'event,lighting' },
];

const VENDORS = [
  { id: 'vendor-01', email: 'vendor@assetflow.local', name: 'Demo Vendor', company: 'TechRent Solutions' },
  { id: 'vendor-02', email: 'camera@assetflow.local', name: 'Cam Vendor', company: 'CameraHub Rentals' },
  { id: 'vendor-03', email: 'furniture@assetflow.local', name: 'Furn Vendor', company: 'Urban Furniture Rentals' },
  { id: 'vendor-04', email: 'event@assetflow.local', name: 'Event Vendor', company: 'EventGear India' },
  { id: 'vendor-05', email: 'home@assetflow.local', name: 'Home Vendor', company: 'HomeEase Rentals' },
  { id: 'vendor-06', email: 'gaming@assetflow.local', name: 'Game Vendor', company: 'ProGaming Rentals' },
  { id: 'vendor-07', email: 'office@assetflow.local', name: 'Office Vendor', company: 'OfficeTech Rentals' },
  { id: 'vendor-08', email: 'smart@assetflow.local', name: 'Smart Vendor', company: 'SmartLiving Rentals' },
  { id: 'vendor-09', email: 'drone@assetflow.local', name: 'Drone Vendor', company: 'AeroRentals' },
  { id: 'vendor-10', email: 'audio@assetflow.local', name: 'Audio Vendor', company: 'SoundStage Rentals' },
];

const CUSTOMERS = [
  { id: 'cust-demo-01', email: 'cust-demo-01@assetflow.local', fn: 'Demo', ln: 'Customer', city: 'Mumbai' },
  { id: 'cust-02', email: 'cust-02@assetflow.local', fn: 'Aarav', ln: 'Sharma', city: 'Delhi' },
  { id: 'cust-03', email: 'cust-03@assetflow.local', fn: 'Priya', ln: 'Patel', city: 'Bengaluru' },
  { id: 'cust-04', email: 'cust-04@assetflow.local', fn: 'Rohan', ln: 'Das', city: 'Kolkata' },
  { id: 'cust-05', email: 'cust-05@assetflow.local', fn: 'Ananya', ln: 'Sen', city: 'Hyderabad' },
  { id: 'cust-06', email: 'cust-06@assetflow.local', fn: 'Kabir', ln: 'Roy', city: 'Pune' },
  { id: 'cust-07', email: 'cust-07@assetflow.local', fn: 'Meera', ln: 'Kapoor', city: 'Chennai' },
  { id: 'cust-08', email: 'cust-08@assetflow.local', fn: 'Aditya', ln: 'Singh', city: 'Ahmedabad' },
  { id: 'cust-09', email: 'cust-09@assetflow.local', fn: 'Neha', ln: 'Gupta', city: 'Jaipur' },
  { id: 'cust-10', email: 'cust-10@assetflow.local', fn: 'Vikram', ln: 'Malhotra', city: 'Surat' },
  { id: 'cust-11', email: 'cust-11@assetflow.local', fn: 'Sneha', ln: 'Joshi', city: 'Lucknow' },
  { id: 'cust-12', email: 'cust-12@assetflow.local', fn: 'Rahul', ln: 'Verma', city: 'Kanpur' },
  { id: 'cust-13', email: 'cust-13@assetflow.local', fn: 'Pooja', ln: 'Nair', city: 'Nagpur' },
  { id: 'cust-14', email: 'cust-14@assetflow.local', fn: 'Arjun', ln: 'Menon', city: 'Indore' },
  { id: 'cust-15', email: 'cust-15@assetflow.local', fn: 'Divya', ln: 'Bhat', city: 'Thane' },
  { id: 'cust-16', email: 'cust-16@assetflow.local', fn: 'Karan', ln: 'Mehta', city: 'Bhopal' },
  { id: 'cust-17', email: 'cust-17@assetflow.local', fn: 'Rhea', ln: 'Chopra', city: 'Visakhapatnam' },
  { id: 'cust-18', email: 'cust-18@assetflow.local', fn: 'Dev', ln: 'Anand', city: 'Pimpri-Chinchwad' },
  { id: 'cust-19', email: 'cust-19@assetflow.local', fn: 'Tara', ln: 'Sutaria', city: 'Patna' },
  { id: 'cust-20', email: 'cust-20@assetflow.local', fn: 'Isha', ln: 'Ambani', city: 'Vadodara' },
  { id: 'cust-21', email: 'cust-21@assetflow.local', fn: 'Yash', ln: 'Chopra', city: 'Ghaziabad' },
  { id: 'cust-22', email: 'cust-22@assetflow.local', fn: 'Kriti', ln: 'Sanon', city: 'Ludhiana' },
  { id: 'cust-23', email: 'cust-23@assetflow.local', fn: 'Varun', ln: 'Dhawan', city: 'Agra' },
  { id: 'cust-24', email: 'cust-24@assetflow.local', fn: 'Alia', ln: 'Bhatt', city: 'Nashik' },
  { id: 'cust-25', email: 'cust-25@assetflow.local', fn: 'Siddharth', ln: 'Malhotra', city: 'Faridabad' },
  { id: 'cust-26', email: 'cust-26@assetflow.local', fn: 'Kiara', ln: 'Advani', city: 'Meerut' },
  { id: 'cust-27', email: 'cust-27@assetflow.local', fn: 'Tiger', ln: 'Shroff', city: 'Rajkot' },
  { id: 'cust-28', email: 'cust-28@assetflow.local', fn: 'Disha', ln: 'Patani', city: 'Kalyan' },
  { id: 'cust-29', email: 'cust-29@assetflow.local', fn: 'Hrithik', ln: 'Roshan', city: 'Vasai-Virar' },
  { id: 'cust-30', email: 'cust-30@assetflow.local', fn: 'Deepika', ln: 'Padukone', city: 'Varanasi' }
];

const BRANDS = ['Apple', 'Sony', 'Canon', 'Samsung', 'PlayStation', 'LG', 'Dyson', 'Herman Miller', 'DJI', 'Bose'];
const LIFECYCLE_STATUSES = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'RESERVED', 'RENTED', 'RENTED', 'UNDER_MAINTENANCE'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDemoData() {
  console.log('--- SEEDING MASSIVE DEMO DATA ---');
  
  // 1. Organization
  await pool.query(
    `INSERT INTO organizations (id, name, code, created_at, updated_at) VALUES (?, ?, 'DEMO05', NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [DEMO_ORG_ID, 'Global Rental Platform']
  );
  console.log('✓ Organization created');

  // 2. Admin User
  const demoHash = await bcrypt.hash('DemoPassword123!', 10);
  await pool.query(
    `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, user_type, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', 'admin', NOW(), NOW())
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), user_type = VALUES(user_type)`,
    ['ad8c7dc5-21b9-4282-9410-b0653d35a989', DEMO_ORG_ID, 'admin3@demorental.co', demoHash, 'Platform', 'Admin']
  );

  // 3. Vendors
  const vendorHash = await bcrypt.hash('Vendor@2024!', 10);
  for (const v of VENDORS) {
    await pool.query(
      `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, user_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 'vendor', NOW(), NOW())
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'active'`,
      [v.id, DEMO_ORG_ID, v.email, vendorHash, v.name, v.company]
    );
  }
  console.log(`✓ ${VENDORS.length} Vendors created`);

  // 4. Customers
  const customerHash = await bcrypt.hash('Customer@2024!', 10);
  for (const c of CUSTOMERS) {
    await pool.query(
      `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, status, user_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 'customer', NOW(), NOW())
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'active'`,
      [c.id, DEMO_ORG_ID, c.email, customerHash, c.fn, c.ln]
    );
    await pool.query(
      `INSERT INTO customers (id, organization_id, customer_number, email, first_name, last_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE first_name = VALUES(first_name)`,
      [c.id, DEMO_ORG_ID, `CUST-${c.id.slice(-4)}`, c.email, c.fn, c.ln]
    );
    await pool.query(
      `INSERT INTO addresses (id, organization_id, customer_id, type, address_line1, city, state, postal_code, country)
       VALUES (?, ?, ?, 'billing', '123 Demo Street', ?, 'State', '400001', 'India')
       ON DUPLICATE KEY UPDATE city = VALUES(city)`,
      [`addr-${c.id}`, DEMO_ORG_ID, c.id, c.city]
    );
  }
  console.log(`✓ ${CUSTOMERS.length} Customers created with addresses`);

  // 5. Categories
  for (const cat of CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (id, organization_id, name, code, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [cat.id, DEMO_ORG_ID, cat.name, cat.code, cat.desc]
    );
  }
  console.log(`✓ ${CATEGORIES.length} Categories created`);

  // 6. Configs (Rental Period & Pricelist)
  const rentalPeriodId = '390c3f43-4906-4d23-b235-e71754b218fe';
  const pricelistId = '7f680b5b-d4cf-4854-8097-d06dff0f1ad0';
  await pool.query(
    `INSERT INTO rental_periods (id, organization_id, name, code, unit, duration_value, created_at, updated_at)
     VALUES (?, ?, '1 Month', 'MONTHLY', 'MONTH', 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [rentalPeriodId, DEMO_ORG_ID]
  );
  await pool.query(
    `INSERT INTO pricelists (id, organization_id, name, code, is_default, created_at, updated_at)
     VALUES (?, ?, 'Standard Rental Prices', 'DEF-V3', 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [pricelistId, DEMO_ORG_ID]
  );

  // 7. Products, Variants, Assets, and Prices
  console.log('Generating 75 products...');
  const ALL_PRODUCTS = [];
  const ALL_VARIANTS = [];
  const ALL_ASSETS = [];
  for (let i = 1; i <= 75; i++) {
    const category = getRandomItem(CATEGORIES);
    const brand = getRandomItem(BRANDS);
    const vendor = getRandomItem(VENDORS);
    const id = `prod-demo-${i.toString().padStart(3, '0')}`;
    const sku = `SKU-${category.code}-${i.toString().padStart(3, '0')}`;
    const name = `${brand} ${category.name.slice(0, 5)} Model ${i}`;
    const description = `Premium ${category.name} available for short and long-term rental. Maintained and verified by ${vendor.company}.`;
    
    // Generate deterministic Unsplash image based on category
    const imageUrl = `https://source.unsplash.com/800x600/?${category.imageQuery},product&${i}`;

    await pool.query(
      `INSERT INTO products (id, organization_id, category_id, name, sku, description, image_url, rental_type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'rentable', 'active', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), image_url = VALUES(image_url)`,
      [id, DEMO_ORG_ID, category.id, name, sku, description, imageUrl]
    );

    ALL_PRODUCTS.push(id);

    // Create 1-3 Variants for each product
    const numVariants = Math.floor(Math.random() * 3) + 1;
    for (let v = 1; v <= numVariants; v++) {
      const variantId = `var-${id}-${v}`;
      const variantName = `${name} - Edition ${v}`;
      const variantSku = `${sku}-V${v}`;

      await pool.query(
        `INSERT INTO variants (id, organization_id, product_id, sku, name, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [variantId, DEMO_ORG_ID, id, variantSku, variantName]
      );
      ALL_VARIANTS.push({ variantId, productId: id });

      // Create 2-4 Assets for each variant
      const numAssets = Math.floor(Math.random() * 3) + 2;
      for (let a = 1; a <= numAssets; a++) {
        const assetId = `ast-${variantId}-${a}`;
        const lifecycle = getRandomItem(LIFECYCLE_STATUSES);
        await pool.query(
          `INSERT INTO assets (id, organization_id, product_variant_id, asset_tag, serial_number, lifecycle_status, condition_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'GOOD', NOW(), NOW())
           ON DUPLICATE KEY UPDATE lifecycle_status = VALUES(lifecycle_status)`,
          [assetId, DEMO_ORG_ID, variantId, `TAG-${variantId}-${a}`, `SN${Date.now()}${a}`, lifecycle]
        );
        ALL_ASSETS.push({ assetId, variantId });
      }

      // Add Price
      const price = Math.floor(Math.random() * 2000) + 500;
      await pool.query(
        `INSERT INTO pricelist_items (id, pricelist_id, product_variant_id, rental_period_id, unit_price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE unit_price = VALUES(unit_price)`,
        [`price-${variantId}`, pricelistId, variantId, rentalPeriodId, price]
      );
    }
  }
  console.log('✓ 75 Products, Variants, Assets, and Prices created');

  // 8. Wishlists
  console.log('Generating Wishlists...');
  for (const c of CUSTOMERS) {
    const numWishes = Math.floor(Math.random() * 5) + 1;
    for (let w = 0; w < numWishes; w++) {
      const prodId = getRandomItem(ALL_PRODUCTS);
      await pool.query(
        `INSERT IGNORE INTO wishlists (id, organization_id, customer_id, product_id)
         VALUES (?, ?, ?, ?)`,
        [`wish-${c.id}-${prodId}`, DEMO_ORG_ID, c.id, prodId]
      );
    }
  }
  console.log('✓ Wishlists created');

  // 9. Demo Transactions/Orders (40 orders with diverse lifecycle)
  console.log('Generating 40 Transactions with full lifecycles...');
  
  // Define realistic status distribution:
  // COMPLETED: 18 (~45%)
  // RETURNED: 6 (~15%)
  // FULFILLED: 4 (~10%)
  // ALLOCATED: 4 (~10%)
  // CONFIRMED: 4 (~10%)
  // DRAFT: 2 (~5%)
  // CANCELLED: 2 (~5%)
  const txStatuses = [
    ...Array(18).fill('COMPLETED'),
    ...Array(6).fill('RETURNED'),
    ...Array(4).fill('FULFILLED'),
    ...Array(4).fill('ALLOCATED'),
    ...Array(4).fill('CONFIRMED'),
    ...Array(2).fill('DRAFT'),
    ...Array(2).fill('CANCELLED'),
  ];

  for (let t = 1; t <= 40; t++) {
    const cust = getRandomItem(CUSTOMERS);
    const txId = `tx-demo-${t}`;
    const status = txStatuses[t - 1] || 'COMPLETED';
    
    // We update ON DUPLICATE KEY to remain idempotent.
    await pool.query(
      `INSERT INTO rental_transactions (id, organization_id, customer_id, status, transaction_date, created_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [txId, DEMO_ORG_ID, cust.id, status]
    );

    // Create 1-2 Transaction Lines
    const numLines = Math.random() > 0.5 ? 2 : 1;
    for (let l = 1; l <= numLines; l++) {
      const lineId = `txline-${txId}-${l}`;
      const randomVariant = getRandomItem(ALL_VARIANTS);
      
      await pool.query(
        `INSERT INTO rental_transaction_lines (id, organization_id, transaction_id, product_id, variant_id, quantity, rental_start_date, rental_end_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW())
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        [lineId, DEMO_ORG_ID, txId, randomVariant.productId, randomVariant.variantId]
      );

      // Downstream generation
      if (['ALLOCATED', 'FULFILLED', 'RETURNED', 'COMPLETED'].includes(status)) {
        const allocId = `alloc-${lineId}`;
        const randomAsset = ALL_ASSETS.find(a => a.variantId === randomVariant.variantId) || ALL_ASSETS[0];
        
        let allocStatus = 'ALLOCATED';
        if (['FULFILLED'].includes(status)) allocStatus = 'FULFILLED';
        if (['RETURNED', 'COMPLETED'].includes(status)) allocStatus = 'RETURNED';

        await pool.query(
          `INSERT INTO asset_allocations (id, organization_id, transaction_line_id, asset_id, status, quantity, allocated_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW(), NOW())
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [allocId, DEMO_ORG_ID, lineId, randomAsset.assetId, allocStatus]
        );

        if (['FULFILLED', 'RETURNED', 'COMPLETED'].includes(status)) {
          const fulfillId = `fulfill-${txId}`;
          await pool.query(
            `INSERT INTO rental_fulfillments (id, organization_id, transaction_id, status, fulfilled_at, created_at, updated_at)
             VALUES (?, ?, ?, 'COMPLETED', NOW(), NOW(), NOW())
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [fulfillId, DEMO_ORG_ID, txId]
          );

          await pool.query(
            `INSERT IGNORE INTO rental_fulfillment_lines (id, organization_id, fulfillment_id, asset_allocation_id, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [`fl-${allocId}`, DEMO_ORG_ID, fulfillId, allocId]
          );
        }

        if (['RETURNED', 'COMPLETED'].includes(status)) {
          const returnId = `return-${txId}`;
          await pool.query(
            `INSERT INTO rental_returns (id, organization_id, transaction_id, status, returned_at, created_at, updated_at)
             VALUES (?, ?, ?, 'RECEIVED', NOW(), NOW(), NOW())
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [returnId, DEMO_ORG_ID, txId]
          );

          await pool.query(
            `INSERT IGNORE INTO rental_return_lines (id, organization_id, return_id, asset_allocation_id, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [`rl-${allocId}`, DEMO_ORG_ID, returnId, allocId]
          );

          // Inspection
          const inspectId = `inspect-${allocId}`;
          await pool.query(
            `INSERT INTO asset_inspections (id, organization_id, return_line_id, asset_id, inspection_date, condition_status, created_at)
             VALUES (?, ?, ?, ?, NOW(), 'GOOD', NOW())
             ON DUPLICATE KEY UPDATE condition_status = VALUES(condition_status)`,
            [inspectId, DEMO_ORG_ID, `rl-${allocId}`, randomAsset.assetId]
          );
        }
      }
    }

    // Invoices and Payments for COMPLETED or RETURNED
    if (['RETURNED', 'COMPLETED'].includes(status)) {
      const invId = `inv-${txId}`;
      const totalAmount = Math.floor(Math.random() * 5000) + 1000;
      const invStatus = status === 'COMPLETED' ? 'PAID' : 'ISSUED';
      
      await pool.query(
        `INSERT INTO rental_invoices (id, organization_id, transaction_id, customer_id, invoice_number, status, subtotal_amount, tax_amount, total_amount, issued_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [invId, DEMO_ORG_ID, txId, cust.id, `INV-DEMO-${t}`, invStatus, totalAmount * 0.8, totalAmount * 0.2, totalAmount]
      );

      if (invStatus === 'PAID') {
        const payId = `pay-${invId}`;
        await pool.query(
          `INSERT INTO rental_payments (id, organization_id, invoice_id, amount, payment_method, status, payment_date, created_at)
           VALUES (?, ?, ?, ?, 'CREDIT_CARD', 'SUCCESS', NOW(), NOW())
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [payId, DEMO_ORG_ID, invId, totalAmount]
        );
      }
    }
    
    // Random Adjustment (e.g. Late fee for some transactions)
    if (status === 'COMPLETED' && Math.random() > 0.8) {
       const adjId = `adj-${txId}`;
       await pool.query(
          `INSERT INTO rental_adjustments (id, organization_id, transaction_id, type, amount, status, created_at, updated_at)
           VALUES (?, ?, ?, 'FEE', 500.00, 'APPLIED', NOW(), NOW())
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [adjId, DEMO_ORG_ID, txId]
       );
    }
  }
  console.log('✓ 40 Transactions with full lifecycle created');

  console.log('--- SEEDING MASSIVE DEMO DATA COMPLETE ---');
  process.exit(0);
}

seedDemoData().catch(console.error);
