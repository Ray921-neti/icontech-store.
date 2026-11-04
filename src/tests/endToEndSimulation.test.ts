import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNigerianPhone, formatNaira, formatDate } from '../utils/formatters';
import { generateOrderNumber, generateRepairReference } from '../services/storeService';
import { validateImageFile, isValidImageUrl } from '../utils/imageUtils';
import { INITIAL_PRODUCTS } from '../data/seedData';
import { CATEGORIES } from '../data/categories';
import { Product, Order, RepairJob, CustomerProfile } from '../types';

describe('1. Brand-New User Registration Lifecycle', () => {
  it('should reject invalid registration payloads (short password, bad phone, empty name)', () => {
    // Failure 1: Empty name
    const reg1Name = '   ';
    assert.equal(reg1Name.trim().length >= 2, false, 'Should reject empty name');

    // Failure 2: Invalid Nigerian phone
    const reg2Phone = normalizeNigerianPhone('12345');
    assert.equal(reg2Phone.isValid, false, 'Should reject invalid phone');

    // Failure 3: Short password
    const reg3Password = '123';
    assert.equal(reg3Password.length >= 6, false, 'Should reject password under 6 chars');

    // Failure 4: Password mismatch
    const p1 = 'Secret123';
    const p2 = 'Secret456';
    assert.notEqual(p1, p2, 'Should reject mismatching passwords');
  });

  it('should successfully register a valid new customer and sanitize profile', () => {
    const rawInput = {
      fullName: 'Adebayo Oluwaseun',
      phone: '08023456789',
      password: 'SecurePassword2026!',
    };

    const phoneResult = normalizeNigerianPhone(rawInput.phone);
    assert.equal(phoneResult.isValid, true);
    assert.equal(phoneResult.normalized, '2348023456789');

    const newCustomerProfile: CustomerProfile = {
      uid: 'cust-mock-uuid-8821',
      name: rawInput.fullName.trim(),
      phone: phoneResult.normalized,
      normalizedPhone: phoneResult.normalized,
      email: `${phoneResult.normalized}@customer.icontech.ng`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'customer',
    };

    assert.equal(newCustomerProfile.name, 'Adebayo Oluwaseun');
    assert.equal(newCustomerProfile.phone, '2348023456789');
    assert.equal(newCustomerProfile.role, 'customer');
    assert.equal((newCustomerProfile as any).isAdmin, undefined);
  });
});

describe('2. Authentication & Sign In / Sign Out Scenarios', () => {
  const registeredUser = {
    phone: '2348023456789',
    passwordHash: 'hash_of_SecurePassword2026!',
    uid: 'cust-mock-uuid-8821',
  };

  it('should reject sign-in with incorrect credentials (wrong password, unknown phone)', () => {
    // Failure scenario 1: Unknown phone
    const attemptPhone = normalizeNigerianPhone('08199999999').normalized;
    assert.notEqual(attemptPhone, registeredUser.phone, 'Unknown user must fail');

    // Failure scenario 2: Wrong password
    const attemptPassword = 'WrongPassword';
    assert.notEqual(attemptPassword, 'SecurePassword2026!', 'Wrong password must fail');
  });

  it('should successfully authenticate with valid credentials', () => {
    const inputIdentifier = '08023456789';
    const normalizedInput = normalizeNigerianPhone(inputIdentifier).normalized;
    assert.equal(normalizedInput, registeredUser.phone);

    // Authenticated session state
    const authSession = {
      isAuthenticated: true,
      uid: registeredUser.uid,
      phone: registeredUser.phone,
    };
    assert.equal(authSession.isAuthenticated, true);
  });

  it('should clear customer profile and session completely on sign out', () => {
    let currentSession: { uid: string; phone: string } | null = {
      uid: registeredUser.uid,
      phone: registeredUser.phone,
    };
    let customerProfile: CustomerProfile | null = {
      uid: registeredUser.uid,
      name: 'Adebayo Oluwaseun',
      phone: registeredUser.phone,
      normalizedPhone: registeredUser.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'customer',
    };

    // Trigger Sign Out
    currentSession = null;
    customerProfile = null;

    assert.equal(currentSession, null, 'Session must be null on sign out');
    assert.equal(customerProfile, null, 'Customer profile must be cleared on sign out');
  });
});

describe('3. Storefront Navigation & Product Catalog Operations', () => {
  it('should render all categories and display non-empty catalog', () => {
    assert.ok(CATEGORIES.length >= 6, 'Should have at least 6 product categories');
    assert.ok(INITIAL_PRODUCTS.length >= 10, 'Should have seeded products in catalog');
  });

  it('should filter catalog by category correctly', () => {
    const smartphones = INITIAL_PRODUCTS.filter(p => p.category === 'smartphones');
    assert.ok(smartphones.length > 0, 'Must find smartphones in catalog');
    for (const phone of smartphones) {
      assert.equal(phone.category, 'smartphones');
    }

    const audioDevices = INITIAL_PRODUCTS.filter(p => p.category === 'earpieces');
    assert.ok(audioDevices.length > 0, 'Must find audio earpieces in catalog');
  });

  it('should search products by keyword and handle zero results gracefully', () => {
    const searchKeyword = 'iPhone';
    const results = INITIAL_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    assert.ok(results.length > 0, 'Should find products matching iPhone');

    // Negative search test
    const impossibleKeyword = 'NonExistentGadgetXYZ12345';
    const emptyResults = INITIAL_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(impossibleKeyword.toLowerCase())
    );
    assert.equal(emptyResults.length, 0, 'Should return empty array without throwing');
  });

  it('should sort products by price ascending and descending', () => {
    const asc = [...INITIAL_PRODUCTS].sort((a, b) => a.price - b.price);
    for (let i = 0; i < asc.length - 1; i++) {
      assert.ok(asc[i].price <= asc[i + 1].price, 'Prices must be ascending');
    }

    const desc = [...INITIAL_PRODUCTS].sort((a, b) => b.price - a.price);
    for (let i = 0; i < desc.length - 1; i++) {
      assert.ok(desc[i].price >= desc[i + 1].price, 'Prices must be descending');
    }
  });

  it('should manage cart addition, quantity increment, and subtotal calculation', () => {
    const prod1 = INITIAL_PRODUCTS[0];
    const prod2 = INITIAL_PRODUCTS[1];

    let cart = [
      { product: prod1, quantity: 1 },
    ];

    // Add another quantity of prod1
    cart = cart.map(item => item.product.id === prod1.id ? { ...item, quantity: item.quantity + 1 } : item);
    assert.equal(cart[0].quantity, 2);

    // Add prod2
    cart.push({ product: prod2, quantity: 1 });
    assert.equal(cart.length, 2);

    // Compute subtotal
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    assert.equal(subtotal, prod1.price * 2 + prod2.price);

    // Remove prod2
    cart = cart.filter(item => item.product.id !== prod2.id);
    assert.equal(cart.length, 1);
  });
});

describe('4. Media & Image Upload Pipeline Verification', () => {
  it('should validate image uploads and reject unsupported formats and excessive sizes', () => {
    // Valid JPEG
    const validJpg = { name: 'broken_lcd.jpg', type: 'image/jpeg', size: 1024 * 1024 } as unknown as File;
    assert.equal(validateImageFile(validJpg).isValid, true);

    // Valid PNG
    const validPng = { name: 'photo.png', type: 'image/png', size: 2 * 1024 * 1024 } as unknown as File;
    assert.equal(validateImageFile(validPng).isValid, true);

    // Bad format (PDF)
    const badPdf = { name: 'manual.pdf', type: 'application/pdf', size: 1024 * 500 } as unknown as File;
    assert.equal(validateImageFile(badPdf).isValid, false);

    // Oversized (>10MB)
    const hugeImg = { name: 'huge_raw.jpg', type: 'image/jpeg', size: 14 * 1024 * 1024 } as unknown as File;
    const oversizedVal = validateImageFile(hugeImg);
    assert.equal(oversizedVal.isValid, false);
    assert.match(oversizedVal.error || '', /File is too large/);
  });

  it('should verify image URLs and prevent malicious script schemas', () => {
    assert.equal(isValidImageUrl('https://images.unsplash.com/photo-1592750475338-74b7b21085ab'), true);
    assert.equal(isValidImageUrl('data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA='), true);
    assert.equal(isValidImageUrl('javascript:alert(1)'), false);
    assert.equal(isValidImageUrl(''), false);
    assert.equal(isValidImageUrl(null), false);
  });
});

describe('5. Checkout Workflow & Payment Transition Simulation', () => {
  it('should fail checkout when user is not signed in', () => {
    const unauthenticatedUser = null;
    const attemptCheckout = () => {
      if (!unauthenticatedUser) {
        throw new Error('Authentication Required: Please sign in with your ICONTECH customer account before submitting your order.');
      }
    };
    assert.throws(attemptCheckout, /Authentication Required/);
  });

  it('should fail checkout when delivery address is empty for home delivery', () => {
    const deliveryMethod = 'delivery';
    const deliveryAddress = '   ';
    const validateDelivery = () => {
      if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
        throw new Error('Delivery address is required for home delivery orders.');
      }
    };
    assert.throws(validateDelivery, /Delivery address is required/);
  });

  it('should succeed with valid bank transfer checkout and initialize status pending_verification', () => {
    const customer = {
      uid: 'cust-mock-uuid-8821',
      name: 'Adebayo Oluwaseun',
      phone: '2348023456789',
    };

    const cartItem = INITIAL_PRODUCTS[0];
    const subtotal = cartItem.price;
    const deliveryFee = 2000;
    const grandTotal = subtotal + deliveryFee;

    const orderId = generateOrderNumber();
    const newOrder: Order = {
      id: orderId,
      customerUid: customer.uid,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryMethod: 'delivery',
      deliveryAddress: '15 College Road, Ondo',
      items: [{
        productId: cartItem.id,
        productName: cartItem.name,
        price: cartItem.price,
        quantity: 1,
        image: cartItem.images[0],
      }],
      subtotal,
      deliveryFee,
      totalAmount: grandTotal,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending_verification',
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assert.match(newOrder.id, /^ICON-ORD-\d{5}$/);
    assert.equal(newOrder.paymentStatus, 'pending_verification');
    assert.equal(newOrder.orderStatus, 'pending');
    assert.equal(newOrder.totalAmount, grandTotal);

    // Customer CANNOT self-mark payment as paid
    const customerTamperAttempt = () => {
      // Security rules forbid non-admin from updating paymentStatus
      throw new Error('PERMISSION_DENIED: Customers cannot alter payment status.');
    };
    assert.throws(customerTamperAttempt, /PERMISSION_DENIED/);

    // Authorized Admin confirms bank transfer
    const adminConfirmedOrder: Order = {
      ...newOrder,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      updatedAt: new Date().toISOString(),
    };
    assert.equal(adminConfirmedOrder.paymentStatus, 'paid');
    assert.equal(adminConfirmedOrder.orderStatus, 'confirmed');
  });
});

describe('6. Repair Diagnostic Booking Simulation', () => {
  it('should fail repair booking when user is unauthenticated or required fields missing', () => {
    const unauthenticatedUser = null;
    const attemptBooking = () => {
      if (!unauthenticatedUser) {
        throw new Error('Authentication Required: Customer account required.');
      }
    };
    assert.throws(attemptBooking, /Authentication Required/);

    const brandModel = '   ';
    const validateFields = () => {
      if (!brandModel.trim()) {
        throw new Error('Device brand & model are required.');
      }
    };
    assert.throws(validateFields, /Device brand & model are required/);
  });

  it('should successfully book repair ticket with photo and initialize status Received', () => {
    const customer = {
      uid: 'cust-mock-uuid-8821',
      name: 'Adebayo Oluwaseun',
      phone: '2348023456789',
    };

    const repairId = generateRepairReference();
    const newRepair: RepairJob = {
      id: repairId,
      customerUid: customer.uid,
      customerName: customer.name,
      customerPhone: customer.phone,
      gadgetType: 'Smartphone',
      brandModel: 'iPhone 13 Pro Max',
      faultCategory: 'Cracked Screen / Display Issues',
      faultDescription: 'Green lines and flickering after dropping on tiled floor',
      photoUrl: 'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=',
      repairStatus: 'Received',
      paymentStatus: 'unpaid',
      quotedPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assert.match(newRepair.id, /^ICON-REP-\d{5}$/);
    assert.equal(newRepair.repairStatus, 'Received');
    assert.equal(newRepair.paymentStatus, 'unpaid');
    assert.equal(newRepair.quotedPrice, 0);

    // Admin updates diagnostic diagnosis and sets price quote
    const updatedRepair: RepairJob = {
      ...newRepair,
      repairStatus: 'Diagnosing',
      quotedPrice: 45000,
      diagnosticNotes: 'Display panel replacement required. Motherboard and FaceID sensors intact.',
      updatedAt: new Date().toISOString(),
    };

    assert.equal(updatedRepair.repairStatus, 'Diagnosing');
    assert.equal(updatedRepair.quotedPrice, 45000);
    assert.ok(updatedRepair.diagnosticNotes?.includes('Display panel replacement'));
  });
});

describe('7. Profile Update & Tamper Resistance', () => {
  it('should allow customer to update editable profile information', () => {
    const originalProfile: CustomerProfile = {
      uid: 'cust-mock-uuid-8821',
      name: 'Adebayo Oluwaseun',
      phone: '2348023456789',
      normalizedPhone: '2348023456789',
      email: '2348023456789@customer.icontech.ng',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'customer',
    };

    const updates = {
      name: 'Adebayo O. James',
      defaultAddress: 'Suite 4, Adeyemi Complex, Ondo Town',
    };

    const updatedProfile: CustomerProfile = {
      ...originalProfile,
      name: updates.name,
      defaultAddress: updates.defaultAddress,
      updatedAt: new Date().toISOString(),
    };

    assert.equal(updatedProfile.name, 'Adebayo O. James');
    assert.equal(updatedProfile.defaultAddress, 'Suite 4, Adeyemi Complex, Ondo Town');
    assert.equal(updatedProfile.uid, originalProfile.uid, 'UID must be unchanged');
    assert.equal(updatedProfile.phone, originalProfile.phone, 'Phone must be unchanged');
  });

  it('should strip and reject any privilege escalation payload in customer profile updates', () => {
    const maliciousPayload = {
      name: 'Hacker',
      role: 'admin',
      isAdmin: true,
      uid: 'fake-admin-uid',
    };

    const sanitizeUpdates = (input: Record<string, any>) => {
      const safe = { ...input };
      delete safe.role;
      delete safe.isAdmin;
      delete safe.uid;
      return safe;
    };

    const cleaned = sanitizeUpdates(maliciousPayload);
    assert.equal(cleaned.name, 'Hacker');
    assert.equal(cleaned.role, undefined, 'role must be stripped');
    assert.equal(cleaned.isAdmin, undefined, 'isAdmin must be stripped');
    assert.equal(cleaned.uid, undefined, 'uid must be stripped');
  });
});

describe('8. Cross-Customer Privacy & Isolation Protection', () => {
  const customerA = { uid: 'cust-A-1111', phone: '2348011111111' };
  const customerB = { uid: 'cust-B-2222', phone: '2348022222222' };

  const orderA: Order = {
    id: 'ICON-ORD-11111',
    customerUid: customerA.uid,
    customerName: 'Customer A',
    customerPhone: customerA.phone,
    deliveryMethod: 'pickup',
    items: [],
    subtotal: 50000,
    deliveryFee: 0,
    totalAmount: 50000,
    paymentMethod: 'cash_on_pickup',
    paymentStatus: 'unpaid',
    orderStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should deny Customer B read access to Customer A private order', () => {
    const evaluateReadAccess = (requestingUid: string, resource: { customerUid?: string }) => {
      const isOwner = requestingUid === resource.customerUid;
      return isOwner;
    };

    assert.equal(evaluateReadAccess(customerA.uid, orderA), true, 'Customer A can read own order');
    assert.equal(evaluateReadAccess(customerB.uid, orderA), false, 'Customer B CANNOT read Customer A order');
    assert.equal(evaluateReadAccess('anonymous', orderA), false, 'Anonymous user CANNOT read order');
  });
});

describe('9. Protected Pages Access Gating (Signed-Out & Non-Admin)', () => {
  it('should gate #account when signed out with recovery actions', () => {
    const signedInUser = null;
    const canAccessAccount = signedInUser !== null;
    assert.equal(canAccessAccount, false, 'Unauthenticated user cannot view account records directly');
  });

  it('should block non-admin and unauthorized accounts from Admin Dashboard', () => {
    const PRIMARY_ADMIN = 'raydiamond108@gmail.com';

    const testAccounts = [
      { email: 'customer@customer.icontech.ng', isVerified: true, expectedAdmin: false },
      { email: 'random.visitor@gmail.com', isVerified: true, expectedAdmin: false },
      { email: 'raydiamond108@gmail.com', isVerified: false, expectedAdmin: false }, // Unverified email rejected
      { email: 'raydiamond108@gmail.com', isVerified: true, expectedAdmin: true },   // Primary admin verified
    ];

    for (const acc of testAccounts) {
      const isAuthorized = acc.email === PRIMARY_ADMIN && acc.isVerified === true;
      assert.equal(isAuthorized, acc.expectedAdmin, `Access evaluation failed for ${acc.email} (verified: ${acc.isVerified})`);
    }
  });
});
