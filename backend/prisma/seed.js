"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.stockMovement.deleteMany();
    await prisma.challanItem.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.customerFollowup.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    const password = await bcryptjs_1.default.hash('password123', 12);
    const users = await prisma.user.createMany({
        data: [
            { name: 'Admin User', email: 'admin@erp.com', password, role: 'ADMIN' },
            { name: 'Sales Rep', email: 'sales@erp.com', password, role: 'SALES' },
            { name: 'Warehouse Staff', email: 'warehouse@erp.com', password, role: 'WAREHOUSE' },
            { name: 'Accounts Manager', email: 'accounts@erp.com', password, role: 'ACCOUNTS' },
        ],
    });
    const admin = await prisma.user.findUnique({ where: { email: 'admin@erp.com' } });
    await prisma.customer.createMany({
        data: [
            { customer_name: 'Ravi Sharma', mobile: '9876543210', email: 'ravi@wholesale.com', business_name: 'Sharma Traders', gst_number: '27AABCU9603R1ZX', customer_type: 'WHOLESALE', address: 'Mumbai, MH', status: 'ACTIVE' },
            { customer_name: 'Priya Patel', mobile: '8765432109', email: 'priya@retail.com', business_name: 'Patel Retail Store', customer_type: 'RETAIL', address: 'Pune, MH', status: 'ACTIVE' },
            { customer_name: 'Anil Kumar', mobile: '7654321098', business_name: 'Kumar Distributors', gst_number: '27AADCK2132R1ZS', customer_type: 'DISTRIBUTOR', address: 'Delhi, DL', status: 'LEAD', follow_up_date: new Date('2024-12-15') },
            { customer_name: 'Sunita Mehta', mobile: '6543210987', email: 'sunita@mehta.com', business_name: 'Mehta Enterprises', customer_type: 'WHOLESALE', address: 'Ahmedabad, GJ', status: 'ACTIVE' },
            { customer_name: 'Vijay Singh', mobile: '5432109876', business_name: 'Singh Brothers', customer_type: 'RETAIL', address: 'Jaipur, RJ', status: 'INACTIVE' },
        ],
    });
    const products = await prisma.product.createMany({
        data: [
            { product_name: 'Samsung USB-C Adapter', sku: 'SAM-USB-001', category: 'Electronics', unit_price: 599, current_stock: 150, minimum_stock: 20, warehouse_location: 'Rack A-1' },
            { product_name: 'Apple Lightning Cable', sku: 'APL-CBL-002', category: 'Electronics', unit_price: 1299, current_stock: 8, minimum_stock: 15, warehouse_location: 'Rack A-2' },
            { product_name: 'Wireless Bluetooth Headset', sku: 'BT-HEAD-003', category: 'Electronics', unit_price: 2499, current_stock: 45, minimum_stock: 10, warehouse_location: 'Rack B-1' },
            { product_name: 'Power Bank 10000mAh', sku: 'PWR-BNK-004', category: 'Electronics', unit_price: 1799, current_stock: 3, minimum_stock: 10, warehouse_location: 'Rack B-2' },
            { product_name: 'Office Chair Ergonomic', sku: 'FURN-CHR-005', category: 'Furniture', unit_price: 12999, current_stock: 20, minimum_stock: 5, warehouse_location: 'Zone C' },
            { product_name: 'A4 Paper Ream 500 Sheets', sku: 'STAT-PAP-006', category: 'Stationery', unit_price: 299, current_stock: 200, minimum_stock: 50, warehouse_location: 'Rack D-1' },
            { product_name: 'Ballpoint Pen Box 50pcs', sku: 'STAT-PEN-007', category: 'Stationery', unit_price: 199, current_stock: 75, minimum_stock: 30, warehouse_location: 'Rack D-2' },
            { product_name: 'Laptop Stand Adjustable', sku: 'DESK-STD-008', category: 'Electronics', unit_price: 1499, current_stock: 5, minimum_stock: 8, warehouse_location: 'Rack A-3' },
            { product_name: 'Wireless Mouse', sku: 'DESK-MOS-009', category: 'Electronics', unit_price: 899, current_stock: 60, minimum_stock: 15, warehouse_location: 'Rack A-4' },
            { product_name: 'Mechanical Keyboard', sku: 'DESK-KBD-010', category: 'Electronics', unit_price: 3499, current_stock: 25, minimum_stock: 10, warehouse_location: 'Rack A-5' },
        ],
    });
    console.log(`Seeded: ${users.count} users, 5 customers, ${products.count} products`);
    console.log('\nTest credentials:');
    console.log('  Admin:     admin@erp.com / password123');
    console.log('  Sales:     sales@erp.com / password123');
    console.log('  Warehouse: warehouse@erp.com / password123');
    console.log('  Accounts:  accounts@erp.com / password123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map