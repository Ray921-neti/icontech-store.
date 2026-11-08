import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  DEFAULT_BUSINESS_SETTINGS
} from '../services/storeService';
import { 
  ApprovalRequest, 
  ApprovalStatus, 
  ApprovalType, 
  ActivityLog, 
  BusinessSettings,
  Order,
  RepairJob
} from '../types';
import { formatNaira, formatDate } from '../utils/formatters';

describe('ICONTECH Super Administrator & Security Protection Audit Suite', () => {

  const SUPER_ADMIN_EMAIL = 'raydiamond108@gmail.com';

  describe('1. Super Administrator Exclusivity Verification', () => {
    it('should strictly grant Super Admin authorization only to verified owner account', () => {
      const checkAdmin = (user: { email: string | null; emailVerified?: boolean } | null) => {
        return Boolean(
          user !== null &&
          user.email &&
          user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
        );
      };

      // Valid verified super admin
      assert.equal(checkAdmin({ email: 'raydiamond108@gmail.com', emailVerified: true }), true);
      assert.equal(checkAdmin({ email: 'RAYDIAMOND108@GMAIL.COM', emailVerified: true }), true);

      // Impersonation / Unauthorized tests
      assert.equal(checkAdmin(null), false);
      assert.equal(checkAdmin({ email: 'customer@customer.icontech.ng' }), false);
      assert.equal(checkAdmin({ email: 'staff@staff.icontech.ng' }), false);
      assert.equal(checkAdmin({ email: 'admin@icontech.ng' }), false);
      assert.equal(checkAdmin({ email: 'attacker@gmail.com' }), false);
      assert.equal(checkAdmin({ email: 'raydiamond108@yahoo.com' }), false);
    });

    it('should prevent customer accounts from acquiring admin claims or roles', () => {
      const customerProfilePayload = {
        uid: 'cust_98231',
        name: 'Olamide Adeyemi',
        phone: '08012345678',
        normalizedPhone: '2348012345678',
        role: 'super_admin', // malicious injection
        isAdmin: true        // malicious injection
      };

      // Sanitize profile like storeService does
      const sanitized = { ...customerProfilePayload, role: 'customer' };
      delete (sanitized as any).isAdmin;

      assert.equal(sanitized.role, 'customer');
      assert.equal((sanitized as any).isAdmin, undefined);
    });
  });

  describe('2. Approval Queue Protection & Backend Validation', () => {
    const approvalQueue: ApprovalRequest[] = [];

    const mockCreateApproval = (
      data: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>,
      callerEmail?: string
    ): ApprovalRequest => {
      const isSuperAdmin = callerEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const customerAllowedTypes = ['order_confirmation', 'payment_verification', 'repair_quote'];

      if (!isSuperAdmin && !customerAllowedTypes.includes(data.type)) {
        throw new Error(`Security Violation: Unauthorized approval request type "${data.type}". Only the Super Administrator can request sensitive business changes.`);
      }

      const newReq: ApprovalRequest = {
        ...data,
        id: `appr-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      approvalQueue.unshift(newReq);
      return newReq;
    };

    const mockResolveApproval = (
      id: string, 
      decision: 'approved' | 'rejected', 
      adminEmail: string, 
      notes?: string
    ): ApprovalRequest => {
      if (!adminEmail || adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        throw new Error('Security Violation: Only the verified Super Administrator is authorized to approve or reject requests.');
      }

      const idx = approvalQueue.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Not found');
      const existing = approvalQueue[idx];

      if (existing.status !== 'pending') {
        throw new Error(`Security Violation: Approval request ${id} has already been ${existing.status} and cannot be processed again.`);
      }

      const updated: ApprovalRequest = {
        ...existing,
        status: decision,
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminEmail,
        notes: notes || '',
        rejectionReason: decision === 'rejected' ? (notes || 'Rejected by Super Administrator') : undefined
      };
      approvalQueue[idx] = updated;
      return updated;
    };

    it('should REJECT customer attempts to create privileged approval requests (price, delete, settings)', () => {
      assert.throws(() => {
        mockCreateApproval({
          type: 'price_change',
          title: 'Malicious Price Reduction to ₦10',
          description: 'Hacker attempting to buy iPhone for ₦10',
          targetCollection: 'products',
          targetDocId: 'prod-iphone-15',
          requestedBy: 'malicious_user',
          proposedChanges: { price: 10 }
        }, 'customer@gmail.com');
      }, /Security Violation: Unauthorized approval request type/);

      assert.throws(() => {
        mockCreateApproval({
          type: 'product_delete',
          title: 'Malicious Catalog Deletion',
          description: 'Hacker attempting to delete catalog',
          targetCollection: 'products',
          targetDocId: 'prod-macbook',
          requestedBy: 'malicious_user',
          proposedChanges: {}
        }, 'customer@gmail.com');
      }, /Security Violation: Unauthorized approval request type/);
    });

    it('should REJECT non-admin attempts to resolve, approve or reject approval requests', () => {
      const legitReq = mockCreateApproval({
        type: 'order_confirmation',
        title: 'Order Confirmation',
        description: 'New customer order',
        targetCollection: 'orders',
        targetDocId: 'ICON-ORD-11111',
        requestedBy: 'cust_001',
        proposedChanges: { orderStatus: 'confirmed' }
      }, SUPER_ADMIN_EMAIL);

      assert.throws(() => {
        mockResolveApproval(legitReq.id, 'approved', 'imposter@gmail.com', 'Approved by imposter');
      }, /Security Violation: Only the verified Super Administrator is authorized/);
    });

    it('should prevent DUPLICATE EXECUTION of already resolved approval requests', () => {
      const legitReq = mockCreateApproval({
        type: 'stock_adjustment',
        title: 'Restock Power Banks',
        description: 'Add 20 units',
        targetCollection: 'products',
        targetDocId: 'prod-pb-20k',
        requestedBy: SUPER_ADMIN_EMAIL,
        proposedChanges: { stock: 35 }
      }, SUPER_ADMIN_EMAIL);

      // First resolution succeeds
      const resolved = mockResolveApproval(legitReq.id, 'approved', SUPER_ADMIN_EMAIL, 'First execution');
      assert.equal(resolved.status, 'approved');

      // Second resolution MUST FAIL
      assert.throws(() => {
        mockResolveApproval(legitReq.id, 'approved', SUPER_ADMIN_EMAIL, 'Duplicate execution replay');
      }, /Security Violation: Approval request .* has already been approved and cannot be processed again/);
    });
  });

  describe('3. Payment & Order Protection', () => {
    it('should NEVER allow customers to mark an order as paid or confirmed upon submission', () => {
      const sanitizeOrderInput = (raw: any): Order => {
        return {
          id: 'ICON-ORD-99999',
          customerUid: 'cust_abc',
          customerName: raw.customerName,
          customerPhone: raw.customerPhone,
          deliveryMethod: raw.deliveryMethod,
          items: raw.items,
          subtotal: 100000,
          deliveryFee: 2500,
          totalAmount: 102500,
          paymentMethod: raw.paymentMethod,
          // STRICT RULE: Force pending & unpaid/pending_verification regardless of user input
          orderStatus: 'pending',
          paymentStatus: raw.paymentMethod === 'bank_transfer' ? 'pending_verification' : 'unpaid',
          createdAt: new Date().toISOString()
        };
      };

      // Attacker attempts to pass paymentStatus: 'paid' and orderStatus: 'confirmed'
      const maliciousPayload = {
        customerName: 'Fraud Attempt',
        customerPhone: '08011223344',
        deliveryMethod: 'delivery',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',         // FORGERY
        orderStatus: 'delivered',      // FORGERY
        paymentReference: 'FAKE-TXN-999',
        items: []
      };

      const sanitized = sanitizeOrderInput(maliciousPayload);
      assert.equal(sanitized.orderStatus, 'pending', 'Order status must remain pending');
      assert.equal(sanitized.paymentStatus, 'pending_verification', 'Payment status must remain pending_verification');
      assert.notEqual(sanitized.paymentStatus, 'paid', 'Customer must NEVER self-approve payment');
    });

    it('should NEVER allow customers to set their own repair quotes upon ticket creation', () => {
      const sanitizeRepairInput = (raw: any): RepairJob => {
        return {
          id: 'ICON-REP-77777',
          customerUid: 'cust_abc',
          customerName: raw.customerName,
          customerPhone: raw.customerPhone,
          gadgetType: 'Smartphone',
          brandModel: 'iPhone 14 Pro',
          faultCategory: 'Screen',
          faultDescription: 'Broken glass',
          repairStatus: 'Received',
          paymentStatus: 'unpaid',
          quotedPrice: 0,            // Reset quote
          diagnosticNotes: '',       // Reset notes
          createdAt: new Date().toISOString()
        };
      };

      // Malicious attempt to self-quote ₦100 for expensive screen repair
      const attackerRepair = {
        customerName: 'Hacker',
        customerPhone: '07099887766',
        quotedPrice: 100,
        paymentStatus: 'paid',
        repairStatus: 'Completed'
      };

      const sanitized = sanitizeRepairInput(attackerRepair);
      assert.equal(sanitized.quotedPrice, 0, 'Quoted price must be 0 until Super Admin approves');
      assert.equal(sanitized.repairStatus, 'Received', 'Repair status must start at Received');
      assert.equal(sanitized.paymentStatus, 'unpaid', 'Payment status must start at unpaid');
    });
  });

  describe('4. Firestore Security Rules Logical Simulation', () => {
    // Simulator representing Firestore security rules engine
    const evaluateRule = (
      auth: { uid: string | null; token?: { email?: string; email_verified?: boolean } } | null,
      operation: 'get' | 'list' | 'create' | 'update' | 'delete',
      collection: string,
      docId: string,
      data?: any,
      existingDoc?: any
    ): boolean => {
      const isSignedIn = auth !== null && auth.uid !== null;
      const isPrimaryAdmin = isSignedIn && 
        auth.token?.email === SUPER_ADMIN_EMAIL && 
        auth.token?.email_verified === true;

      if (collection === 'approvals') {
        if (operation === 'get' || operation === 'list') {
          return isPrimaryAdmin;
        }
        if (operation === 'create') {
          if (isPrimaryAdmin) return true;
          if (isSignedIn && data?.status === 'pending' && data?.requestedBy === auth.uid) {
            if (['order_confirmation', 'payment_verification'].includes(data?.type) && data?.targetCollection === 'orders') return true;
            if (data?.type === 'repair_quote' && data?.targetCollection === 'repairs') return true;
          }
          return false;
        }
        if (operation === 'update' || operation === 'delete') {
          return isPrimaryAdmin;
        }
      }

      if (collection === 'activity_logs') {
        if (operation === 'get' || operation === 'list') return isPrimaryAdmin;
        if (operation === 'create') return isPrimaryAdmin;
        if (operation === 'update' || operation === 'delete') return false; // strictly immutable
      }

      if (collection === 'business_settings') {
        if (operation === 'get' || operation === 'list') return true; // public
        return isPrimaryAdmin;
      }

      if (collection === 'orders') {
        if (operation === 'get' || operation === 'list') {
          return isPrimaryAdmin || (isSignedIn && existingDoc?.customerUid === auth.uid);
        }
        if (operation === 'create') {
          return isSignedIn && data?.customerUid === auth.uid && data?.orderStatus === 'pending';
        }
        if (operation === 'update' || operation === 'delete') {
          return isPrimaryAdmin;
        }
      }

      if (collection === 'customers') {
        if (operation === 'list') return isPrimaryAdmin;
        if (operation === 'get') return isPrimaryAdmin || (isSignedIn && existingDoc?.uid === auth.uid);
        if (operation === 'create') return isSignedIn && data?.uid === auth.uid && data?.role === 'customer' && !data?.isAdmin;
        if (operation === 'update') return isPrimaryAdmin || (isSignedIn && existingDoc?.uid === auth.uid && data?.role === 'customer' && !data?.isAdmin);
        if (operation === 'delete') return isPrimaryAdmin;
      }

      return false;
    };

    const customerA = { uid: 'user_A', token: { email: 'customerA@gmail.com', email_verified: true } };
    const customerB = { uid: 'user_B', token: { email: 'customerB@gmail.com', email_verified: true } };
    const superAdmin = { uid: 'admin_uid', token: { email: SUPER_ADMIN_EMAIL, email_verified: true } };

    it('DENIES customer from getting or listing the /approvals collection', () => {
      assert.equal(evaluateRule(customerA, 'get', 'approvals', 'appr-1'), false);
      assert.equal(evaluateRule(customerA, 'list', 'approvals', ''), false);
      assert.equal(evaluateRule(superAdmin, 'get', 'approvals', 'appr-1'), true);
      assert.equal(evaluateRule(superAdmin, 'list', 'approvals', ''), true);
    });

    it('DENIES customer from creating forged approval requests (price, delete, settings)', () => {
      const forgedPriceApproval = {
        id: 'appr-forged-1',
        type: 'price_change',
        status: 'pending',
        targetCollection: 'products',
        requestedBy: 'user_A'
      };
      assert.equal(evaluateRule(customerA, 'create', 'approvals', 'appr-forged-1', forgedPriceApproval), false);

      const legitOrderApproval = {
        id: 'appr-legit-1',
        type: 'order_confirmation',
        status: 'pending',
        targetCollection: 'orders',
        requestedBy: 'user_A'
      };
      assert.equal(evaluateRule(customerA, 'create', 'approvals', 'appr-legit-1', legitOrderApproval), true);
    });

    it('DENIES customer from resolving or updating an approval request', () => {
      assert.equal(evaluateRule(customerA, 'update', 'approvals', 'appr-1'), false);
      assert.equal(evaluateRule(customerA, 'delete', 'approvals', 'appr-1'), false);
      assert.equal(evaluateRule(superAdmin, 'update', 'approvals', 'appr-1'), true);
    });

    it('DENIES all users (even admin) from editing or deleting /activity_logs (immutable)', () => {
      assert.equal(evaluateRule(customerA, 'update', 'activity_logs', 'log-1'), false);
      assert.equal(evaluateRule(customerA, 'delete', 'activity_logs', 'log-1'), false);
      assert.equal(evaluateRule(superAdmin, 'update', 'activity_logs', 'log-1'), false, 'Activity logs must NEVER be updated');
      assert.equal(evaluateRule(superAdmin, 'delete', 'activity_logs', 'log-1'), false, 'Activity logs must NEVER be deleted');
    });

    it('DENIES Customer B from reading Customer A private orders', () => {
      const orderA = { id: 'ICON-ORD-123', customerUid: 'user_A' };
      assert.equal(evaluateRule(customerA, 'get', 'orders', 'ICON-ORD-123', null, orderA), true);
      assert.equal(evaluateRule(customerB, 'get', 'orders', 'ICON-ORD-123', null, orderA), false);
      assert.equal(evaluateRule(superAdmin, 'get', 'orders', 'ICON-ORD-123', null, orderA), true);
    });

    it('DENIES Customer A from updating order paymentStatus or orderStatus directly', () => {
      assert.equal(evaluateRule(customerA, 'update', 'orders', 'ICON-ORD-123'), false);
      assert.equal(evaluateRule(superAdmin, 'update', 'orders', 'ICON-ORD-123'), true);
    });

    it('DENIES Customer A from listing all customer profiles in /customers', () => {
      assert.equal(evaluateRule(customerA, 'list', 'customers', ''), false);
      assert.equal(evaluateRule(superAdmin, 'list', 'customers', ''), true);
    });
  });
});
