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
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Order, RepairJob, OrderStatus, PaymentStatus, CustomerProfile } from '../types';
import { INITIAL_PRODUCTS, INITIAL_REPAIRS } from '../data/seedData';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const REPAIRS_COLLECTION = 'repairs';
const CUSTOMERS_COLLECTION = 'customers';

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
    paymentStatus: orderData.paymentStatus || 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(docRef, newOrder);
    localOrdersFallback.unshift(newOrder);
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, REPAIRS_COLLECTION, repairId);
    await setDoc(docRef, newRepair);
    localRepairsFallback.unshift(newRepair);
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

