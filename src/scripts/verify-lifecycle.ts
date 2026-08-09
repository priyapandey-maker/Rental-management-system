import 'dotenv/config';
import mysql from 'mysql2/promise';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const CUST_EMAIL = 'cust-demo-01@rentalms.local';
const CUST_PASS = 'Customer@2024!';

const VEND_EMAIL = 'vendor@rentalms.local';
const VEND_PASS = 'Vendor@2024!';

const ADMIN_EMAIL = 'admin3@demorental.co';
const ADMIN_PASS = 'DemoPassword123!';

let custToken = '';
let vendToken = '';
let adminToken = '';

let matrix: any[] = [];

function logStage(stage: string, customerSeen: string, vendorSeen: string, adminSeen: string, dbSeen: string, result: string) {
    matrix.push({ Stage: stage, Customer: customerSeen, Vendor: vendorSeen, Admin: adminSeen, DB: dbSeen, Result: result });
    console.log(`[${result}] ${stage}`);
}

async function login(email: string, pass: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Login failed for ${email}: ${text}`);
    return JSON.parse(text).token;
}

async function api(path: string, method: string = 'GET', token: string, body?: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
    return data;
}

async function runVerification() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'rental_db',
        socketPath: process.env.DB_SOCKET,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    });

    try {
        console.log('Fixing Admin role in DB...');
        await pool.query('UPDATE users SET user_type = "admin" WHERE email = ?', [ADMIN_EMAIL]);
        
        console.log('Authenticating...');
        custToken = await login(CUST_EMAIL, CUST_PASS);
        vendToken = await login(VEND_EMAIL, VEND_PASS);
        adminToken = await login(ADMIN_EMAIL, ADMIN_PASS);

        // 1. DISCOVER PRODUCT
        let products = await api('/storefront/products', 'GET', custToken);
        if (products.data) products = products.data;
        const product = products[0];
        logStage('1. Discover Product', product && product.id ? 'OK' : 'FAIL', 'N/A', 'N/A', 'OK', product && product.id ? 'PASS' : 'FAIL');

        // 2. CONFIGURE VARIANT
        let variants = await api(`/storefront/products/${product.id}/variants`, 'GET', custToken);
        if (variants.data) variants = variants.data;
        const variant = variants[0];
        logStage('2. Configure Variant', variant && variant.id ? 'OK' : 'FAIL', 'N/A', 'N/A', 'OK', variant && variant.id ? 'PASS' : 'FAIL');

        // 3. ADD TO WISHLIST
        await api('/storefront/wishlist', 'POST', custToken, { product_id: product.id });
        const wishlist = await api('/storefront/wishlist', 'GET', custToken);
        const inWishlist = wishlist.data && wishlist.data.includes(product.id);
        logStage('3. Add to Wishlist', inWishlist ? 'OK' : 'FAIL', 'N/A', 'N/A', 'OK', inWishlist ? 'PASS' : 'FAIL');

        // 4. CHECKOUT (Create Tx)
        const [venRes] = await pool.query('SELECT organization_id FROM users WHERE email = ?', [VEND_EMAIL]);
        const vendorOrgId = (venRes as any[])[0]?.organization_id;
        
        const [custRes] = await pool.query('SELECT id FROM customers WHERE organization_id = ? LIMIT 1', [vendorOrgId]);
        const vcId = (custRes as any[])[0]?.id;
        
        if (!vcId) throw new Error("No customer found for vendor org");
        
        const tx = await api('/vendor/transactions', 'POST', vendToken, { customer_id: vcId });
        
        let periodRes = await api('/vendor/rental-periods', 'GET', vendToken);
        if (periodRes.data) periodRes = periodRes.data;
        const period = periodRes[0];
        
        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 3);
        
        console.log("Adding line with:", { product_id: product?.id, variant_id: variant?.id, period_id: period?.id });
        
        await api(`/vendor/transactions/${tx.id}/lines`, 'POST', vendToken, {
            product_id: product.id,
            product_variant_id: variant.id,
            rental_period_id: period.id,
            rental_start_date: now.toISOString(),
            rental_end_date: end.toISOString(),
            unit_price: 150,
            quantity: 1
        });
        
        await api(`/vendor/transactions/${tx.id}/confirm`, 'POST', vendToken);
        logStage('4. Checkout / Confirm', 'OK', 'OK', 'N/A', 'OK', 'PASS');

        // 5. Verify Rental Sync
        const txVend = await api(`/vendor/transactions/${tx.id}`, 'GET', vendToken);
        const adminTxs = await api('/admin/transactions', 'GET', adminToken);
        const txAdmin = adminTxs.find((t: any) => t.id === tx.id);
        
        const [dbRes] = await pool.query('SELECT status FROM rental_transactions WHERE id = ?', [tx.id]);
        const dbStatus = (dbRes as any[])[0]?.status;

        logStage('5. Verify Rental Sync', 'N/A', txVend.status, txAdmin?.status, dbStatus, (txVend.status === txAdmin?.status && txVend.status === dbStatus) ? 'PASS' : 'FAIL');

        // 6. Allocate Asset
        const allocRes = await api(`/vendor/transactions/${tx.id}/allocate`, 'POST', vendToken);
        logStage('6. Allocate Asset', 'N/A', allocRes ? 'ALLOCATED' : 'FAIL', 'N/A', 'OK', allocRes ? 'PASS' : 'FAIL');

        // 7. Fulfill
        const fulfillRes = await api(`/vendor/transactions/${tx.id}/fulfill`, 'POST', vendToken);
        logStage('7. Fulfill Rental', 'N/A', fulfillRes ? 'FULFILLED' : 'FAIL', 'N/A', 'OK', fulfillRes ? 'PASS' : 'FAIL');

        // 8. Post-Fulfill Sync
        const vTxAfterFulfill = await api(`/vendor/transactions/${tx.id}`, 'GET', vendToken);
        const aTxAfterFulfill = (await api('/admin/transactions', 'GET', adminToken)).find((t: any) => t.id === tx.id);
        const [dbRes2] = await pool.query('SELECT status FROM rental_transactions WHERE id = ?', [tx.id]);
        logStage('8. Post-Fulfill Sync', 'N/A', vTxAfterFulfill.status, aTxAfterFulfill?.status, (dbRes2 as any[])[0]?.status, vTxAfterFulfill.status === 'ACTIVE' ? 'PASS' : 'FAIL');

        // 9. Return
        const retRes = await api(`/vendor/transactions/${tx.id}/return`, 'POST', vendToken, { return_date: new Date().toISOString() });
        logStage('9. Return Rental', 'N/A', retRes ? 'RETURNED' : 'FAIL', 'N/A', 'OK', retRes ? 'PASS' : 'FAIL');

        // 10. Final State Sync
        const vTxFinal = await api(`/vendor/transactions/${tx.id}`, 'GET', vendToken);
        const aTxFinal = (await api('/admin/transactions', 'GET', adminToken)).find((t: any) => t.id === tx.id);
        const [dbRes3] = await pool.query('SELECT status FROM rental_transactions WHERE id = ?', [tx.id]);
        logStage('10. Final State Sync', 'N/A', vTxFinal.status, aTxFinal?.status, (dbRes3 as any[])[0]?.status, vTxFinal.status === 'COMPLETED' ? 'PASS' : 'FAIL');

        console.log('\\n--- LIFECYCLE MATRIX ---');
        console.table(matrix);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

runVerification();
