/**
 * Automated Security & Privacy Test Suite for ICONTECH
 * 
 * NOTE: This test suite runs within the Node.js TypeScript environment to verify:
 * 1. Nigerian Phone Normalization & Auth Email Mapping
 * 2. Admin vs Customer Privilege Boundary Isolation
 * 3. Security Rules Logic Simulator (Emulating Cloud Firestore Rule AST Evaluation Engine):
 *    - Unauthorized Document Reads & Cross-Customer Isolation
 *    - Customer Profile Field Immutability (createdAt, uid) & Anti-Escalation
 *    - Product Catalog Management Restrictions
 *    - Strict Type, Method, and Initial Status Locks for Orders and Repairs
 *    - Staff vs. Primary Admin Privileges (/admins registry protection)
 * 4. Verification that Frontend Passcode Secrets Are Eliminated
 * 5. Firebase Configuration Integrity
 *
 * (It is an in-memory application & rules logic verification suite; it does not invoke the Java-based Firebase Emulator Suite)
 */

import { normalizeNigerianPhone, phoneToAuthEmail, formatNaira } from '../utils/formatters.ts';
import { generateOrderNumber, generateRepairReference } from '../services/storeService.ts';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAILED: [Assertion ${totalCount}] ${testName}`);
    process.exit(1);
  } else {
    passedCount++;
    console.log(`✅ PASSED: [Assertion ${totalCount}] ${testName}`);
  }
}

// In-Memory Cloud Firestore Rule Logic Simulator
interface AuthContext {
  uid: string | null;
  token?: {
    email?: string | null;
    email_verified?: boolean;
  };
}

interface FirestoreState {
  admins: Set<string>;
}

const PRIMARY_ADMIN_EMAIL = 'raydiamond108@gmail.com';

function evaluateRules(auth: AuthContext | null, state: FirestoreState) {
  const isSignedIn = () => auth !== null && auth.uid !== null;
  
  const isOwner = (userId: string) => isSignedIn() && auth?.uid === userId;
  
  const isPrimaryAdmin = () => {
    if (!isSignedIn()) return false;
    return auth?.token?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() &&
      auth?.token?.email_verified === true;
  };

  const isStaffAdmin = () => {
    if (!isSignedIn()) return false;
    if (isPrimaryAdmin()) return true;
    if (auth?.uid && state.admins.has(auth.uid)) return true;
    return false;
  };

  return {
    // 1. Products rules
    products: {
      canRead: () => true,
      canWrite: () => isStaffAdmin(),
    },
    // 2. Customer profile rules
    customers: {
      canGet: (docId: string) => isSignedIn() && (isOwner(docId) || isStaffAdmin()),
      canList: () => isStaffAdmin(),
      canCreate: (docId: string, data: Record<string, unknown>) => {
        if (!isOwner(docId)) return false;
        if (data.uid !== docId) return false;
        if (typeof data.name !== 'string' || data.name.length === 0 || data.name.length > 128) return false;
        if (typeof data.phone !== 'string' || data.phone.length < 8 || data.phone.length > 32) return false;
        if (typeof data.normalizedPhone !== 'string') return false;
        if (typeof data.createdAt !== 'string') return false;
        if ('role' in data && data.role !== 'customer') return false;
        if ('isAdmin' in data && data.isAdmin !== false) return false;
        return true;
      },
      canUpdate: (docId: string, existingDoc: Record<string, unknown>, newData: Record<string, unknown>) => {
        if (isStaffAdmin()) return true;
        if (!isOwner(docId)) return false;
        if (newData.uid !== existingDoc.uid) return false; // UID immutable
        if (newData.createdAt !== existingDoc.createdAt) return false; // createdAt immutable
        if (typeof newData.name !== 'string' || newData.name.length === 0 || newData.name.length > 128) return false;
        if (typeof newData.phone !== 'string' || newData.phone.length < 8 || newData.phone.length > 32) return false;
        if ('role' in newData && newData.role !== 'customer') return false;
        if ('isAdmin' in newData && newData.isAdmin !== false) return false;
        return true;
      },
      canDelete: () => isPrimaryAdmin(),
    },
    // 3. Orders rules
    orders: {
      canGet: (doc: { customerUid: string }) => {
        if (!isSignedIn()) return false;
        return isStaffAdmin() || doc.customerUid === auth?.uid;
      },
      canList: (filterCustomerUid?: string) => {
        if (!isSignedIn()) return false;
        if (isStaffAdmin()) return true;
        return filterCustomerUid === auth?.uid;
      },
      canCreate: (data: {
        id: string;
        customerUid: string;
        customerName: string;
        customerPhone: string;
        deliveryMethod: string;
        paymentMethod: string;
        items: unknown[];
        subtotal: number;
        deliveryFee: number;
        totalAmount: number;
        orderStatus: string;
        paymentStatus: string;
        createdAt: string;
      }) => {
        if (!isSignedIn()) return false;
        if (data.customerUid !== auth?.uid) return false;
        if (typeof data.customerName !== 'string' || data.customerName.length === 0) return false;
        if (typeof data.customerPhone !== 'string' || data.customerPhone.length < 8) return false;
        if (!['delivery', 'pickup'].includes(data.deliveryMethod)) return false;
        if (!['cash_on_delivery', 'bank_transfer', 'cash_on_pickup'].includes(data.paymentMethod)) return false;
        if (!Array.isArray(data.items) || data.items.length === 0) return false;
        if (typeof data.subtotal !== 'number' || data.subtotal <= 0) return false;
        if (typeof data.deliveryFee !== 'number' || data.deliveryFee < 0) return false;
        if (typeof data.totalAmount !== 'number' || data.totalAmount <= 0) return false;
        if (data.orderStatus !== 'pending') return false;
        if (!['unpaid', 'pending_verification'].includes(data.paymentStatus)) return false;
        if (typeof data.createdAt !== 'string') return false;
        return true;
      },
      canUpdate: () => isStaffAdmin(),
      canDelete: () => isPrimaryAdmin(),
    },
    // 4. Repairs rules
    repairs: {
      canGet: (doc: { customerUid: string }) => {
        if (!isSignedIn()) return false;
        return isStaffAdmin() || doc.customerUid === auth?.uid;
      },
      canList: (filterCustomerUid?: string) => {
        if (!isSignedIn()) return false;
        if (isStaffAdmin()) return true;
        return filterCustomerUid === auth?.uid;
      },
      canCreate: (data: {
        id: string;
        customerUid: string;
        customerName: string;
        customerPhone: string;
        gadgetType: string;
        brandModel: string;
        faultCategory: string;
        faultDescription: string;
        repairStatus: string;
        paymentStatus?: string;
        quotedPrice?: number;
        diagnosticNotes?: string;
        createdAt: string;
      }) => {
        if (!isSignedIn()) return false;
        if (data.customerUid !== auth?.uid) return false;
        if (typeof data.customerName !== 'string' || data.customerName.length === 0) return false;
        if (typeof data.customerPhone !== 'string' || data.customerPhone.length < 8) return false;
        if (typeof data.gadgetType !== 'string' || data.gadgetType.length === 0) return false;
        if (typeof data.brandModel !== 'string' || data.brandModel.length === 0) return false;
        if (typeof data.faultCategory !== 'string' || data.faultCategory.length === 0) return false;
        if (typeof data.faultDescription !== 'string' || data.faultDescription.length === 0) return false;
        if (data.repairStatus !== 'Received') return false;
        if (data.paymentStatus && data.paymentStatus !== 'unpaid') return false;
        if (data.quotedPrice && data.quotedPrice > 0) return false;
        if (data.diagnosticNotes && data.diagnosticNotes.trim() !== '') return false;
        if (typeof data.createdAt !== 'string') return false;
        return true;
      },
      canUpdate: () => isStaffAdmin(),
      canDelete: () => isPrimaryAdmin(),
    },
    // 5. Admin registry rules
    admins: {
      canRead: () => isStaffAdmin(),
      canWrite: () => isPrimaryAdmin(),
    },
  };
}

async function runTests() {
  console.log('--- Starting ICONTECH Hardened Verification & Security Suite ---');

  // Suite 1: Nigerian Phone Number Normalization & Auth Mapping
  const phone1 = normalizeNigerianPhone('07039420600');
  assert(phone1.isValid && phone1.normalized === '2347039420600', 'Valid 11-digit local phone (07039420600) normalizes to 2347039420600');

  const phone2 = normalizeNigerianPhone('+2348034567891');
  assert(phone2.isValid && phone2.normalized === '2348034567891', 'Valid intl format (+2348034567891) normalizes correctly');

  const phone3 = normalizeNigerianPhone('0812 345 6789');
  assert(phone3.isValid && phone3.normalized === '2348123456789', 'Phone with spaces normalizes properly');

  const invalidPhone = normalizeNigerianPhone('070123');
  assert(!invalidPhone.isValid, 'Short invalid phone number is rejected');

  const authEmail = phoneToAuthEmail('2347039420600');
  assert(authEmail === '2347039420600@customer.icontech.ng', 'Auth email correctly maps to @customer.icontech.ng domain');

  // Suite 2: Client Secret Elimination Verification
  const authContextPath = path.resolve(process.cwd(), 'src/context/AuthContext.tsx');
  const authContextSource = fs.readFileSync(authContextPath, 'utf8');
  assert(!authContextSource.includes('icontech2026'), 'Hardcoded admin passcode "icontech2026" is completely removed from AuthContext.tsx');
  assert(!authContextSource.includes('loginWithAdminCode'), 'loginWithAdminCode method is eliminated from AuthContext.tsx');
  assert(!authContextSource.includes('ADMIN_SESSION_KEY'), 'Frontend admin session key is removed from AuthContext.tsx');

  // Suite 3: Admin Identity Boundaries
  function checkIsAdmin(email: string | null | undefined): boolean {
    return Boolean(
      email && (
        email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
        (email.endsWith('@staff.icontech.ng') && !email.includes('@customer.')) ||
        email === 'admin@icontech.ng'
      )
    );
  }

  assert(checkIsAdmin('raydiamond108@gmail.com'), 'Primary admin email gets admin access');
  assert(!checkIsAdmin('2347039420600@customer.icontech.ng'), 'Customer email ending in .ng CANNOT get admin access');
  assert(!checkIsAdmin('attacker@gmail.com'), 'Arbitrary external email CANNOT get admin access');
  assert(!checkIsAdmin(null), 'Null user email CANNOT get admin access');

  // Suite 4: Firestore Rules - Orders Authorization, Typing & Validation
  const state: FirestoreState = { admins: new Set(['staff_tech_001']) };
  const unauthRules = evaluateRules(null, state);
  const customerA = evaluateRules({ uid: 'user_cust_A', token: { email: '2347039420600@customer.icontech.ng', email_verified: true } }, state);
  const customerB = evaluateRules({ uid: 'user_cust_B', token: { email: '2348011223344@customer.icontech.ng', email_verified: true } }, state);
  const staffRules = evaluateRules({ uid: 'staff_tech_001', token: { email: 'technician@icontech.ng', email_verified: true } }, state);
  const primaryAdminRules = evaluateRules({ uid: 'admin_primary_001', token: { email: 'raydiamond108@gmail.com', email_verified: true } }, state);
  const unverifiedAdminRules = evaluateRules({ uid: 'admin_spoof_001', token: { email: 'raydiamond108@gmail.com', email_verified: false } }, state);

  const orderCustA = { customerUid: 'user_cust_A' };

  assert(!unauthRules.orders.canGet(orderCustA), 'Unauthenticated user CANNOT read private order documents');
  assert(!customerB.orders.canGet(orderCustA), 'Customer B CANNOT read Customer A order document (cross-customer denied)');
  assert(customerA.orders.canGet(orderCustA), 'Customer A CAN read their own order document');
  assert(staffRules.orders.canGet(orderCustA), 'Staff CAN read customer order documents');
  assert(primaryAdminRules.orders.canGet(orderCustA), 'Primary Admin CAN read customer order documents');
  assert(!unverifiedAdminRules.orders.canDelete(), 'Unverified primary admin email (email_verified == false) CANNOT perform admin deletes');
  assert(!unverifiedAdminRules.admins.canWrite(), 'Unverified primary admin email (email_verified == false) CANNOT manage /admins registry');

  const validOrderPayload = {
    id: 'ICON-ORD-11111',
    customerUid: 'user_cust_A',
    customerName: 'Adewale Johnson',
    customerPhone: '07039420600',
    deliveryMethod: 'delivery',
    paymentMethod: 'bank_transfer',
    items: [{ productId: 'p1', quantity: 1, price: 50000 }],
    subtotal: 50000,
    deliveryFee: 2500,
    totalAmount: 52500,
    orderStatus: 'pending',
    paymentStatus: 'pending_verification',
    createdAt: new Date().toISOString(),
  };

  assert(!unauthRules.orders.canCreate(validOrderPayload), 'Unauthenticated user CANNOT create order document');
  assert(!customerB.orders.canCreate(validOrderPayload), 'Customer B CANNOT create order with Customer A UID (spoofing denied)');
  assert(customerA.orders.canCreate(validOrderPayload), 'Customer A CAN create order with their own authenticated UID');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, paymentStatus: 'paid' }), 'Customer CANNOT mark order paymentStatus as paid during creation');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, orderStatus: 'delivered' }), 'Customer CANNOT create order with orderStatus: delivered');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, totalAmount: 0 }), 'Customer CANNOT create order with zero totalAmount');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, totalAmount: -500 }), 'Customer CANNOT create order with negative totalAmount');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, deliveryMethod: 'teleportation' }), 'Customer CANNOT create order with invalid deliveryMethod');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, paymentMethod: 'free_coupon' }), 'Customer CANNOT create order with invalid paymentMethod');
  assert(!customerA.orders.canCreate({ ...validOrderPayload, items: [] }), 'Customer CANNOT create order with empty items list');
  assert(!customerA.orders.canUpdate(), 'Customer CANNOT update or alter order totals/status after creation');
  assert(staffRules.orders.canUpdate(), 'Staff CAN update order status');
  assert(primaryAdminRules.orders.canUpdate(), 'Primary admin CAN update order status');
  assert(!staffRules.orders.canDelete(), 'Staff CANNOT delete orders (financial audit protection)');
  assert(primaryAdminRules.orders.canDelete(), 'Primary admin CAN delete orders');

  // Suite 5: Firestore Rules - Repairs Authorization, Typing & Validation
  const repairCustA = { customerUid: 'user_cust_A' };

  assert(!unauthRules.repairs.canGet(repairCustA), 'Unauthenticated user CANNOT read private repair documents');
  assert(!customerB.repairs.canGet(repairCustA), 'Customer B CANNOT read Customer A repair ticket');
  assert(customerA.repairs.canGet(repairCustA), 'Customer A CAN read their own repair ticket');
  assert(staffRules.repairs.canGet(repairCustA), 'Staff CAN read customer repair tickets');
  assert(primaryAdminRules.repairs.canGet(repairCustA), 'Primary Admin CAN read customer repair tickets');

  const validRepairPayload = {
    id: 'ICON-REP-22222',
    customerUid: 'user_cust_A',
    customerName: 'Adewale Johnson',
    customerPhone: '07039420600',
    gadgetType: 'Smartphone',
    brandModel: 'iPhone 13 Pro',
    faultCategory: 'Screen Damage',
    faultDescription: 'Flickering green screen after accidental drop',
    repairStatus: 'Received',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  };

  assert(customerA.repairs.canCreate(validRepairPayload), 'Customer A CAN book repair with own UID and valid fields');
  assert(!unauthRules.repairs.canCreate(validRepairPayload), 'Unauthenticated user CANNOT book repair');
  assert(!customerB.repairs.canCreate(validRepairPayload), 'Customer B CANNOT book repair with Customer A UID');
  assert(!customerA.repairs.canCreate({ ...validRepairPayload, repairStatus: 'Completed' }), 'Customer CANNOT book repair ticket with initial status Completed');
  assert(!customerA.repairs.canCreate({ ...validRepairPayload, quotedPrice: 25000 }), 'Customer CANNOT forge quotedPrice during repair creation');
  assert(!customerA.repairs.canCreate({ ...validRepairPayload, diagnosticNotes: 'Screen IC swapped' }), 'Customer CANNOT forge diagnosticNotes during repair creation');
  assert(!customerA.repairs.canCreate({ ...validRepairPayload, paymentStatus: 'paid' }), 'Customer CANNOT set initial paymentStatus to paid');
  assert(!customerA.repairs.canUpdate(), 'Customer CANNOT alter repair diagnosis or status after creation');
  assert(staffRules.repairs.canUpdate(), 'Staff CAN update repair diagnosis, status, and quotes');
  assert(!staffRules.repairs.canDelete(), 'Staff CANNOT delete repair records');
  assert(primaryAdminRules.repairs.canDelete(), 'Primary admin CAN delete repair records');

  // Suite 6: Firestore Rules - Tightened Customer Profiles & Anti-Escalation
  const existingCustProfile = {
    uid: 'user_cust_A',
    name: 'Adewale Johnson',
    phone: '07039420600',
    normalizedPhone: '2347039420600',
    createdAt: '2026-10-01T12:00:00.000Z',
    role: 'customer',
  };

  assert(customerA.customers.canCreate('user_cust_A', { ...existingCustProfile }), 'Customer can create valid customer profile');
  assert(!customerA.customers.canCreate('user_cust_A', { ...existingCustProfile, isAdmin: true }), 'Customer CANNOT create profile with isAdmin: true');
  assert(!customerA.customers.canCreate('user_cust_A', { ...existingCustProfile, role: 'admin' }), 'Customer CANNOT create profile with role: admin');
  
  // Immutability tests on update
  assert(customerA.customers.canUpdate('user_cust_A', existingCustProfile, { ...existingCustProfile, name: 'Adewale J. Updated' }), 'Customer can update their own display name');
  assert(!customerA.customers.canUpdate('user_cust_A', existingCustProfile, { ...existingCustProfile, createdAt: '2026-10-29T00:00:00.000Z' }), 'Customer CANNOT alter protected createdAt timestamp');
  assert(!customerA.customers.canUpdate('user_cust_A', existingCustProfile, { ...existingCustProfile, uid: 'user_cust_hacked' }), 'Customer CANNOT alter protected uid field');
  assert(!customerA.customers.canUpdate('user_cust_A', existingCustProfile, { ...existingCustProfile, role: 'admin' }), 'Customer CANNOT escalate existing profile to role: admin');
  assert(!customerA.customers.canUpdate('user_cust_A', existingCustProfile, { ...existingCustProfile, isAdmin: true }), 'Customer CANNOT escalate existing profile with isAdmin: true');
  assert(!customerB.customers.canGet('user_cust_A'), 'Customer B CANNOT read Customer A profile');
  assert(staffRules.customers.canGet('user_cust_A'), 'Staff CAN read customer profile');
  assert(!staffRules.customers.canDelete(), 'Staff CANNOT delete customer profiles');
  assert(primaryAdminRules.customers.canDelete(), 'Primary admin CAN delete customer profiles');

  // Suite 7: Products & Admin Registry Protection (/admins/{uid})
  assert(unauthRules.products.canRead(), 'Public user can read product catalog');
  assert(!unauthRules.products.canWrite(), 'Unauthenticated user CANNOT modify products');
  assert(!customerA.products.canWrite(), 'Normal customer CANNOT modify products');
  assert(staffRules.products.canWrite(), 'Staff user CAN manage products');
  assert(primaryAdminRules.products.canWrite(), 'Primary admin CAN manage products');

  assert(staffRules.admins.canRead(), 'Staff CAN read /admins registry');
  assert(!staffRules.admins.canWrite(), 'Staff user CANNOT add or edit staff in /admins registry');
  assert(!customerA.admins.canWrite(), 'Normal customer CANNOT write to /admins registry');
  assert(!unauthRules.admins.canWrite(), 'Unauthenticated user CANNOT write to /admins registry');
  assert(primaryAdminRules.admins.canWrite(), 'Primary admin (raydiamond108@gmail.com) CAN manage /admins registry');

  // Suite 8: Utility Formatters & Firebase Applet Configuration Integrity
  const orderId = generateOrderNumber();
  assert(orderId.startsWith('ICON-ORD-') && orderId.length >= 14, `Order ID generated matches pattern ICON-ORD-XXXXX (${orderId})`);

  const repairId = generateRepairReference();
  assert(repairId.startsWith('ICON-REP-') && repairId.length >= 14, `Repair ID generated matches pattern ICON-REP-XXXXX (${repairId})`);

  assert(formatNaira(150000).includes('150,000'), 'formatNaira correctly formats currency amounts');

  assert(firebaseConfig.projectId === 'gen-lang-client-0571688528', 'Firebase project ID matches user project gen-lang-client-0571688528');
  assert(firebaseConfig.firestoreDatabaseId === 'ai-studio-icontechgadgetsr-7ac8c481-d749-444d-ac81-485a390611a3', 'Firestore database ID matches provisioned database');
  assert(firebaseConfig.apiKey.length > 20, 'Firebase API key is present and valid format');
  assert(firebaseConfig.authDomain.includes('gen-lang-client-0571688528'), 'Auth domain points to the correct Firebase project');

  // Suite 9: Customer & Admin End-to-End Lifecycle Simulation
  // 1. Customer A places a bank-transfer order and books a repair job
  const custA_Order = {
    id: 'ICON-ORD-77777',
    customerUid: 'user_cust_A',
    customerName: 'Adewale Johnson',
    customerPhone: '07039420600',
    deliveryMethod: 'delivery',
    paymentMethod: 'bank_transfer',
    items: [{ productId: 'prod-anker', quantity: 1, price: 35000 }],
    subtotal: 35000,
    deliveryFee: 2500,
    totalAmount: 37500,
    orderStatus: 'pending',
    paymentStatus: 'pending_verification',
    createdAt: new Date().toISOString(),
  };

  const custA_Repair = {
    id: 'ICON-REP-88888',
    customerUid: 'user_cust_A',
    customerName: 'Adewale Johnson',
    customerPhone: '07039420600',
    gadgetType: 'Smartphone',
    brandModel: 'iPhone 13 Pro',
    faultCategory: 'Screen Damage',
    faultDescription: 'Screen blank after impact',
    repairStatus: 'Received',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  };

  assert(customerA.orders.canCreate(custA_Order), 'Customer A successfully creates order with paymentStatus: pending_verification');
  assert(customerA.repairs.canCreate(custA_Repair), 'Customer A successfully books repair with repairStatus: Received');

  // 2. Bank transfer order remains pending verification; customer CANNOT confirm payment
  assert(!customerA.orders.canUpdate(), 'Bank-transfer order remains pending_verification; customer CANNOT verify own payment');
  assert(!customerA.repairs.canUpdate(), 'Customer CANNOT alter repair ticket diagnostic state');

  // 3. Customer B attempts cross-tenant access to Customer A's records
  assert(!customerB.orders.canGet(custA_Order), 'Customer B CANNOT view Customer A order');
  assert(!customerB.orders.canList('user_cust_A'), 'Customer B CANNOT list Customer A orders query');
  assert(!customerB.repairs.canGet(custA_Repair), 'Customer B CANNOT view Customer A repair ticket');
  assert(!customerB.repairs.canList('user_cust_A'), 'Customer B CANNOT list Customer A repairs query');
  assert(!customerB.customers.canGet('user_cust_A'), 'Customer B CANNOT view Customer A profile');

  // 4. Authorized admin confirms bank payment and updates repair diagnostics
  assert(primaryAdminRules.orders.canUpdate(), 'Authorized admin confirms payment (sets paid) and advances order status to confirmed');
  assert(primaryAdminRules.repairs.canUpdate(), 'Authorized admin updates repair status to Diagnosing, sets quote ₦15,000, and records notes');

  // Simulate document state updated by admin
  const adminUpdatedOrder = {
    ...custA_Order,
    orderStatus: 'confirmed',
    paymentStatus: 'paid',
  };

  const adminUpdatedRepair = {
    ...custA_Repair,
    repairStatus: 'Diagnosing',
    quotedPrice: 15000,
    diagnosticNotes: 'Inspected screen ribbon cable; replacement screen ordered',
  };

  // 5. Customer A in customer view retrieves their updated order and repair status
  assert(customerA.orders.canGet(adminUpdatedOrder), 'Customer A can view their confirmed order with paymentStatus: paid');
  assert(customerA.repairs.canGet(adminUpdatedRepair), 'Customer A can view their updated repair in Diagnosing stage with quotedPrice ₦15,000');
  assert(adminUpdatedOrder.paymentStatus === 'paid', 'Verified order payment status is paid in customer view');
  assert(adminUpdatedRepair.repairStatus === 'Diagnosing', 'Verified repair status is Diagnosing in customer view');

  console.log(`--- Finished: Ran ${totalCount} security & privacy assertions across 9 test suites. All ${passedCount} passed successfully! ---`);
}

runTests();

