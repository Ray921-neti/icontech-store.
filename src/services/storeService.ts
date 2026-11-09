import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Product, 
  Order, 
  RepairJob, 
  OrderStatus, 
  PaymentStatus, 
  CustomerProfile,
  ApprovalRequest,
  ApprovalStatus,
  ActivityLog,
  BusinessSettings
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_REPAIRS } from '../data/seedData';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const REPAIRS_COLLECTION = 'repairs';
const CUSTOMERS_COLLECTION = 'customers';
const APPROVALS_COLLECTION = 'approvals';
const ACTIVITY_LOGS_COLLECTION = 'activity_logs';
const SETTINGS_COLLECTION = 'business_settings';

// In-memory fallback if Firestore network is temporarily unreachable
let localProductsFallback: Product[] = [...INITIAL_PRODUCTS];
let localRepairsFallback: RepairJob[] = [...INITIAL_REPAIRS];
let localOrdersFallback: Order[] = [];

// ================= PRODUCT SERVICES ================= //

export async function fetchProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Auto-populate local fallback if database is fresh
      return localProductsFallback;
    }
    
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });

    return products;
  } catch (error) {
    console.warn('Firestore fetch products failed, falling back to cached catalog:', error);
    return localProductsFallback;
  }
}

export async function addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const productId = product.id || `prod-${Date.now()}`;
  const newProduct: Product = {
    ...product,
    id: productId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await setDoc(docRef, newProduct);
    localProductsFallback.unshift(newProduct);
    return newProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  const dataToUpdate = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, dataToUpdate);
    
    // Update local cache
    localProductsFallback = localProductsFallback.map(p => 
      p.id === productId ? { ...p, ...dataToUpdate } : p
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    localProductsFallback = localProductsFallback.filter(p => p.id !== productId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Seed demo catalog to Firestore
export async function seedDemoData(): Promise<{ productsCount: number; repairsCount: number }> {
  let seededProducts = 0;
  let seededRepairs = 0;

  try {
    for (const prod of INITIAL_PRODUCTS) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      await setDoc(docRef, prod);
      seededProducts++;
    }

    for (const repair of INITIAL_REPAIRS) {
      const docRef = doc(db, REPAIRS_COLLECTION, repair.id);
      await setDoc(docRef, repair);
      seededRepairs++;
    }
  } catch (e) {
    console.error('Error seeding data to Firestore:', e);
  }

  return { productsCount: seededProducts, repairsCount: seededRepairs };
}

// ================= ORDER SERVICES ================= //

export function generateOrderNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ICON-ORD-${randomSuffix}`;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus'> & { orderStatus?: OrderStatus }
): Promise<Order> {
  const effectiveUid = orderData.customerUid || auth.currentUser?.uid;
  if (!effectiveUid) {
    throw new Error('Authentication Required: Please sign in with your ICONTECH customer account before submitting your order.');
  }

  const orderId = generateOrderNumber();
  const newOrder: Order = {
    ...orderData,
    customerUid: effectiveUid,
    id: orderId,
    orderStatus: 'pending',
    paymentStatus: orderData.paymentMethod === 'bank_transfer' ? 'pending_verification' : 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(docRef, newOrder);
    localOrdersFallback.unshift(newOrder);

    // Queue for Super Administrator personal business approval
    try {
      await createApprovalRequest({
        type: newOrder.paymentMethod === 'bank_transfer' ? 'payment_verification' : 'order_confirmation',
        title: `Order ${orderId}: ${newOrder.customerName} (₦${newOrder.totalAmount.toLocaleString()})`,
        description: `Customer submitted new ${newOrder.deliveryMethod} order with ${newOrder.paymentMethod.replace(/_/g, ' ')}. Requires Super Administrator review and processing.`,
        targetCollection: 'orders',
        targetDocId: orderId,
        requestedBy: effectiveUid,
        requestedByName: newOrder.customerName,
        currentValues: { orderStatus: 'pending', paymentStatus: newOrder.paymentStatus },
        proposedChanges: { orderStatus: 'confirmed' }
      });
    } catch (e) {
      console.warn('Silent approval enqueue warning:', e);
    }

    return newOrder;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const sanitizedId = orderId.trim().toUpperCase();
  try {
    const docRef = doc(db, ORDERS_COLLECTION, sanitizedId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }
    // Check local fallback
    const foundLocal = localOrdersFallback.find(o => o.id.toUpperCase() === sanitizedId);
    return foundLocal || null;
  } catch (error) {
    const foundLocal = localOrdersFallback.find(o => o.id.toUpperCase() === sanitizedId);
    return foundLocal || null;
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    
    // Merge with any offline orders that aren't yet in snapshot
    const merged = [...orders];
    for (const localOrd of localOrdersFallback) {
      if (!merged.some(m => m.id === localOrd.id)) {
        merged.push(localOrd);
      }
    }
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Orders fetch fallback:', error);
    return localOrdersFallback;
  }
}

export async function updateOrderStatus(
  orderId: string, 
  orderStatus: OrderStatus, 
  paymentStatus?: PaymentStatus,
  notes?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    orderStatus,
    updatedAt: new Date().toISOString(),
  };
  if (paymentStatus) updates.paymentStatus = paymentStatus;
  if (notes !== undefined) updates.notes = notes;

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Update order status fallback:', error);
  }

  localOrdersFallback = localOrdersFallback.map(o => 
    o.id === orderId ? { ...o, ...updates } : o
  );
}

// ================= REPAIR SERVICES ================= //

export function generateRepairReference(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ICON-REP-${randomSuffix}`;
}

export async function createRepairJob(
  jobData: Omit<RepairJob, 'id' | 'createdAt' | 'repairStatus'>
): Promise<RepairJob> {
  const effectiveUid = jobData.customerUid || auth.currentUser?.uid;
  if (!effectiveUid) {
    throw new Error('Authentication Required: Please sign in with your ICONTECH customer account before booking a repair.');
  }

  const repairId = generateRepairReference();
  const newRepair: RepairJob = {
    ...jobData,
    customerUid: effectiveUid,
    id: repairId,
    repairStatus: 'Received',
    paymentStatus: 'unpaid',
    quotedPrice: 0,
    diagnosticNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, REPAIRS_COLLECTION, repairId);
    await setDoc(docRef, newRepair);
    localRepairsFallback.unshift(newRepair);

    // Queue for Super Administrator personal diagnosis & quote approval
    try {
      await createApprovalRequest({
        type: 'repair_quote',
        title: `Repair ${repairId}: ${newRepair.brandModel} (${newRepair.faultCategory})`,
        description: `Customer submitted device ${newRepair.brandModel} for ${newRepair.faultCategory} repair. Needs diagnostic quote review and technician authorization.`,
        targetCollection: 'repairs',
        targetDocId: repairId,
        requestedBy: effectiveUid,
        requestedByName: newRepair.customerName,
        currentValues: { repairStatus: 'Received', quotedPrice: 0 },
        proposedChanges: { repairStatus: 'Diagnosing' }
      });
    } catch (e) {
      console.warn('Silent repair approval enqueue warning:', e);
    }

    return newRepair;
  } catch (error) {
    console.error('Repair creation error:', error);
    throw error;
  }
}

export async function getRepairById(repairId: string): Promise<RepairJob | null> {
  const sanitizedId = repairId.trim().toUpperCase();
  try {
    const docRef = doc(db, REPAIRS_COLLECTION, sanitizedId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as RepairJob;
    }
    const foundLocal = localRepairsFallback.find(r => r.id.toUpperCase() === sanitizedId);
    return foundLocal || null;
  } catch (error) {
    const foundLocal = localRepairsFallback.find(r => r.id.toUpperCase() === sanitizedId);
    return foundLocal || null;
  }
}

export async function fetchAllRepairs(): Promise<RepairJob[]> {
  try {
    const q = query(collection(db, REPAIRS_COLLECTION));
    const snapshot = await getDocs(q);
    const repairs: RepairJob[] = [];
    snapshot.forEach((docSnap) => {
      repairs.push({ id: docSnap.id, ...docSnap.data() } as RepairJob);
    });

    // Merge with local fallback
    const merged = [...repairs];
    for (const localRep of localRepairsFallback) {
      if (!merged.some(m => m.id === localRep.id)) {
        merged.push(localRep);
      }
    }
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Repairs fetch fallback:', error);
    return localRepairsFallback;
  }
}

export async function updateRepairJob(repairId: string, updates: Partial<RepairJob>): Promise<void> {
  const dataToUpdate = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, REPAIRS_COLLECTION, repairId);
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.warn('Update repair fallback:', error);
  }

  localRepairsFallback = localRepairsFallback.map(r => 
    r.id === repairId ? { ...r, ...dataToUpdate } : r
  );
}

export async function deleteRepairJob(repairId: string): Promise<void> {
  try {
    const docRef = doc(db, REPAIRS_COLLECTION, repairId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Delete repair fallback:', error);
  }
  localRepairsFallback = localRepairsFallback.filter(r => r.id !== repairId);
}

// ================= CUSTOMER PROFILE SERVICES ================= //

const localCustomersFallback = new Map<string, CustomerProfile>();

export async function fetchCustomerProfile(uid: string): Promise<CustomerProfile | null> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CustomerProfile;
    }
    return localCustomersFallback.get(uid) || null;
  } catch (error) {
    console.warn('Customer profile fetch fallback:', error);
    return localCustomersFallback.get(uid) || null;
  }
}

export async function saveCustomerProfile(profile: CustomerProfile): Promise<void> {
  const sanitizedProfile: CustomerProfile = {
    ...profile,
    role: 'customer',
  };
  // Prevent customer from injecting admin flags
  delete (sanitizedProfile as unknown as Record<string, unknown>).isAdmin;

  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, sanitizedProfile.uid);
    await setDoc(docRef, sanitizedProfile);
    localCustomersFallback.set(sanitizedProfile.uid, sanitizedProfile);
  } catch (error) {
    console.warn('Customer profile save fallback:', error);
    localCustomersFallback.set(sanitizedProfile.uid, sanitizedProfile);
  }
}

export async function updateCustomerProfile(uid: string, updates: Partial<CustomerProfile>): Promise<void> {
  const safeUpdates = { ...updates };
  // Strictly prevent mutating UID, role, or administrative fields
  delete (safeUpdates as unknown as Record<string, unknown>).role;
  delete (safeUpdates as unknown as Record<string, unknown>).isAdmin;
  delete (safeUpdates as unknown as Record<string, unknown>).uid;

  const dataToUpdate = {
    ...safeUpdates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.warn('Customer profile update fallback:', error);
  }

  const existing = localCustomersFallback.get(uid);
  if (existing) {
    localCustomersFallback.set(uid, { ...existing, ...dataToUpdate });
  }
}

export async function fetchCustomerOrders(customerUid: string, phone?: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('customerUid', '==', customerUid)
    );
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });

    // Merge any locally placed orders with matching customerUid from fallback cache
    for (const localOrd of localOrdersFallback) {
      if (localOrd.customerUid === customerUid && !orders.some(o => o.id === localOrd.id)) {
        orders.push(localOrd);
      }
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Customer orders Firestore query error, checking local session cache:', error);
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    return localOrdersFallback.filter(o => {
      if (o.customerUid && o.customerUid === customerUid) return true;
      if (cleanPhone && o.customerPhone) {
        const orderPhone = o.customerPhone.replace(/\D/g, '');
        return orderPhone.includes(cleanPhone) || cleanPhone.includes(orderPhone);
      }
      return false;
    });
  }
}

export async function fetchCustomerRepairs(customerUid: string, phone?: string): Promise<RepairJob[]> {
  try {
    const q = query(
      collection(db, REPAIRS_COLLECTION),
      where('customerUid', '==', customerUid)
    );
    const snapshot = await getDocs(q);
    const repairs: RepairJob[] = [];
    snapshot.forEach((docSnap) => {
      repairs.push({ id: docSnap.id, ...docSnap.data() } as RepairJob);
    });

    // Merge any locally placed repairs with matching customerUid from fallback cache
    for (const localRep of localRepairsFallback) {
      if (localRep.customerUid === customerUid && !repairs.some(r => r.id === localRep.id)) {
        repairs.push(localRep);
      }
    }

    return repairs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Customer repairs Firestore query error, checking local session cache:', error);
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    return localRepairsFallback.filter(r => {
      if (r.customerUid && r.customerUid === customerUid) return true;
      if (cleanPhone && r.customerPhone) {
        const repPhone = r.customerPhone.replace(/\D/g, '');
        return repPhone.includes(cleanPhone) || cleanPhone.includes(repPhone);
      }
      return false;
    });
  }
}

// ================= CUSTOMERS MANAGEMENT ================= //

export async function fetchAllCustomers(): Promise<CustomerProfile[]> {
  try {
    const q = query(collection(db, CUSTOMERS_COLLECTION));
    const snapshot = await getDocs(q);
    const customers: CustomerProfile[] = [];
    snapshot.forEach((docSnap) => {
      customers.push(docSnap.data() as CustomerProfile);
    });
    // Merge fallback
    Array.from(localCustomersFallback.values()).forEach((cust) => {
      if (!customers.some((c) => c.uid === cust.uid)) {
        customers.push(cust);
      }
    });
    return customers;
  } catch (error) {
    console.warn('Fetch all customers fallback:', error);
    return Array.from(localCustomersFallback.values());
  }
}

// ================= BUSINESS SETTINGS SERVICES ================= //

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  id: 'primary',
  storeName: 'ICONTECH Gadgets & Repairs',
  contactPhone: '07039420600',
  whatsappNumber: '2347039420600',
  storeEmail: 'support@icontech.ng',
  businessAddress: 'Opposite Adeyemi Federal University of Education, Ondo City, Ondo State',
  businessHours: 'Mon – Sat: 8:00 AM – 7:00 PM, Sun: 12:00 PM – 5:00 PM',
  bankName: 'Moniepoint MFB / Zenith Bank',
  accountName: 'ICONTECH GADGETS & REPAIRS',
  accountNumber: '8249019231',
  bankNotes: 'Please include your Order ID or Repair ID in the transfer payment reference.',
  deliveryFeeStandard: 2500,
  freeDeliveryThreshold: 100000,
  repairWarrantyDays: 90,
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Primary'
};

let localSettingsFallback: BusinessSettings = { ...DEFAULT_BUSINESS_SETTINGS };

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'primary');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    }
    return localSettingsFallback;
  } catch (error) {
    console.warn('Fetch settings fallback:', error);
    return localSettingsFallback;
  }
}

export async function updateBusinessSettings(
  updates: Partial<BusinessSettings>,
  adminEmail: string
): Promise<BusinessSettings> {
  const merged: BusinessSettings = {
    ...localSettingsFallback,
    ...updates,
    id: 'primary',
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'Super Administrator'
  };

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'primary');
    await setDoc(docRef, merged);
    localSettingsFallback = merged;
  } catch (error) {
    console.warn('Update settings fallback:', error);
    localSettingsFallback = merged;
  }

  await logActivity(
    'SETTINGS_UPDATE',
    'settings',
    `Updated store settings and operational parameters by ${adminEmail}`,
    'primary',
    updates
  );

  return merged;
}

// ================= ACTIVITY & SECURITY AUDIT LOG SERVICES ================= //

let localActivityLogsFallback: ActivityLog[] = [
  {
    id: 'log-sys-001',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actorEmail: 'raydiamond108@gmail.com',
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOT',
    entityType: 'system',
    details: 'ICONTECH Super Administrator security parameters verified and active.'
  }
];

export async function logActivity(
  action: string,
  entityType: ActivityLog['entityType'],
  details: string,
  entityId?: string,
  metadata?: Record<string, any>
): Promise<ActivityLog> {
  const actorEmail = auth.currentUser?.email || 'raydiamond108@gmail.com';
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newLog: ActivityLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole: 'super_admin',
    action,
    entityType,
    entityId,
    details,
    metadata
  };

  try {
    const docRef = doc(db, ACTIVITY_LOGS_COLLECTION, logId);
    await setDoc(docRef, newLog);
  } catch (error) {
    console.warn('Activity log write fallback:', error);
  }

  localActivityLogsFallback.unshift(newLog);
  return newLog;
}

export async function fetchActivityLogs(limitCount = 50): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, ACTIVITY_LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const logs: ActivityLog[] = [];
    snap.forEach((docSnap) => {
      logs.push(docSnap.data() as ActivityLog);
    });

    // Merge fallback
    const merged = [...logs];
    for (const item of localActivityLogsFallback) {
      if (!merged.some(m => m.id === item.id)) {
        merged.push(item);
      }
    }
    return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.warn('Activity logs fetch fallback:', error);
    return localActivityLogsFallback;
  }
}

// ================= BUSINESS APPROVAL SYSTEM SERVICES ================= //

let localApprovalsFallback: ApprovalRequest[] = [];

export async function fetchApprovalRequests(statusFilter?: ApprovalStatus): Promise<ApprovalRequest[]> {
  try {
    let q = query(collection(db, APPROVALS_COLLECTION));
    if (statusFilter) {
      q = query(collection(db, APPROVALS_COLLECTION), where('status', '==', statusFilter));
    }
    const snap = await getDocs(q);
    const list: ApprovalRequest[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as ApprovalRequest);
    });

    const merged = [...list];
    for (const item of localApprovalsFallback) {
      if (!merged.some(m => m.id === item.id)) {
        if (!statusFilter || item.status === statusFilter) {
          merged.push(item);
        }
      }
    }
    return merged.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  } catch (error) {
    console.warn('Approval requests fetch fallback:', error);
    return statusFilter 
      ? localApprovalsFallback.filter(a => a.status === statusFilter)
      : localApprovalsFallback;
  }
}

export async function createApprovalRequest(
  data: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'> & { id?: string }
): Promise<ApprovalRequest> {
  // Validate authorization: non-super-admins can ONLY submit order_confirmation, payment_verification, or repair_quote
  const isSuperAdmin = auth.currentUser?.email?.toLowerCase() === 'raydiamond108@gmail.com';
  const customerAllowedTypes = ['order_confirmation', 'payment_verification', 'repair_quote'];

  if (!isSuperAdmin && !customerAllowedTypes.includes(data.type)) {
    throw new Error(`Security Violation: Unauthorized approval request type "${data.type}". Only the Super Administrator can request sensitive business changes.`);
  }

  const reqId = data.id || `appr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newReq: ApprovalRequest = {
    ...data,
    id: reqId,
    status: 'pending',
    requestedBy: isSuperAdmin ? (data.requestedBy || auth.currentUser?.uid || 'admin') : (auth.currentUser?.uid || data.requestedBy),
    requestedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, APPROVALS_COLLECTION, reqId);
    await setDoc(docRef, newReq);
  } catch (error) {
    console.warn('Create approval fallback:', error);
  }

  localApprovalsFallback.unshift(newReq);
  return newReq;
}

export async function resolveApprovalRequest(
  approvalId: string,
  decision: 'approved' | 'rejected',
  adminEmail: string,
  notes?: string,
  rejectionReason?: string
): Promise<ApprovalRequest> {
  // Strict authorization: only the sole Super Administrator can resolve approvals
  if (!adminEmail || adminEmail.toLowerCase() !== 'raydiamond108@gmail.com') {
    throw new Error('Security Violation: Only the verified Super Administrator is authorized to approve or reject requests.');
  }

  const req = localApprovalsFallback.find(a => a.id === approvalId);
  if (!req) {
    throw new Error(`Approval request ${approvalId} not found.`);
  }

  // Prevent duplicate execution
  if (req.status !== 'pending') {
    throw new Error(`Security Violation: Approval request ${approvalId} has already been ${req.status} and cannot be processed again.`);
  }

  const now = new Date().toISOString();

  const updates: Partial<ApprovalRequest> = {
    status: decision,
    reviewedAt: now,
    reviewedBy: adminEmail,
    notes: notes || '',
  };

  if (decision === 'rejected') {
    updates.rejectionReason = rejectionReason || notes || 'Rejected by Super Administrator';
  }

  // If approved, execute the corresponding mutation on the target collection with sanitized parameters
  if (decision === 'approved') {
    const safeChanges = { ...req.proposedChanges };
    delete (safeChanges as any).id;
    delete (safeChanges as any).customerUid;
    delete (safeChanges as any).createdAt;

    try {
      if (req.targetCollection === 'products') {
        if (req.type === 'product_delete') {
          await deleteProduct(req.targetDocId);
        } else if (req.type === 'product_publish' && !localProductsFallback.some(p => p.id === req.targetDocId)) {
          await addProduct({ ...safeChanges, id: req.targetDocId } as any);
        } else {
          await updateProduct(req.targetDocId, safeChanges);
        }
      } else if (req.targetCollection === 'orders') {
        const docRef = doc(db, ORDERS_COLLECTION, req.targetDocId);
        await updateDoc(docRef, safeChanges);
        localOrdersFallback = localOrdersFallback.map(o => 
          o.id === req.targetDocId ? { ...o, ...safeChanges } : o
        );
      } else if (req.targetCollection === 'repairs') {
        await updateRepairJob(req.targetDocId, safeChanges);
      } else if (req.targetCollection === 'business_settings') {
        await updateBusinessSettings(safeChanges, adminEmail);
      }
    } catch (err) {
      console.error('Error applying approved changes:', err);
      throw err;
    }
  }

  try {
    const docRef = doc(db, APPROVALS_COLLECTION, approvalId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Update approval fallback:', error);
  }

  localApprovalsFallback = localApprovalsFallback.map(a => 
    a.id === approvalId ? { ...a, ...updates } : a
  );

  // Log to immutable activity audit
  await logActivity(
    decision === 'approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
    'approval',
    `${decision.toUpperCase()}: ${req.title || approvalId} by Super Admin. Notes: ${notes || 'None'}`,
    approvalId,
    { targetCollection: req.targetCollection, targetDocId: req.targetDocId, decision }
  );

  return { ...req, ...updates } as ApprovalRequest;
}

