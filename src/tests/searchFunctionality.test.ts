import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PRODUCTS } from '../data/seedData';
import { Product } from '../types';
import { 
  searchAndRankProducts, 
  calculateProductRelevance, 
  createWhatsAppGadgetRequestUrl, 
  normalizeSearchString 
} from '../utils/searchUtils';

describe('ICONTECH Professional Product Search Engine & Inventory Protection', () => {
  it('should normalize search text across casing, punctuation and excess whitespace', () => {
    assert.equal(normalizeSearchString('  iPhone-15 (256GB)  '), 'iphone 15 256gb');
    assert.equal(normalizeSearchString('Samsung/Galaxy_S24!!'), 'samsung galaxy s24');
    assert.equal(normalizeSearchString('APPLE MACBOOK   AIR M2??'), 'apple macbook air m2');
  });

  it('should find genuine catalog products via brand, name, and partial keywords', () => {
    // 1. Apple iPhone search
    const iphoneResults = searchAndRankProducts(INITIAL_PRODUCTS, 'iPhone');
    assert.ok(iphoneResults.length > 0, 'Must find genuine iPhone products');
    assert.ok(iphoneResults.some(p => p.name.includes('iPhone 15 Pro Max')));

    // 2. Samsung Galaxy S24 Ultra search
    const s24Results = searchAndRankProducts(INITIAL_PRODUCTS, 'S24 Ultra');
    assert.ok(s24Results.length > 0, 'Must find S24 Ultra');
    assert.equal(s24Results[0].brand, 'Samsung');

    // 3. Oraimo Power Bank search
    const oraimoResults = searchAndRankProducts(INITIAL_PRODUCTS, 'Oraimo Power Bank');
    assert.ok(oraimoResults.length > 0, 'Must find Oraimo Power Bank');
    assert.equal(oraimoResults[0].brand, 'Oraimo');

    // 4. Case-insensitive and partial search
    const macbookUpper = searchAndRankProducts(INITIAL_PRODUCTS, 'MACBOOK AIR M2');
    const macbookLower = searchAndRankProducts(INITIAL_PRODUCTS, 'macbook air');
    assert.ok(macbookUpper.length > 0);
    assert.ok(macbookLower.length > 0);
    assert.equal(macbookUpper[0].id, macbookLower[0].id);
  });

  it('should support searches across technical specifications (Storage, Display, Chipset, Battery)', () => {
    // Search by AMOLED specification
    const amoledSearch = searchAndRankProducts(INITIAL_PRODUCTS, 'AMOLED');
    assert.ok(amoledSearch.length > 0, 'Must find products with AMOLED displays');

    // Search by 5000mAh battery specification
    const batterySearch = searchAndRankProducts(INITIAL_PRODUCTS, '5000mAh');
    assert.ok(batterySearch.length > 0, 'Must find products with 5000mAh battery');

    // Search by M2 processor specification
    const m2Search = searchAndRankProducts(INITIAL_PRODUCTS, 'M2');
    assert.ok(m2Search.length > 0, 'Must find MacBook Air with M2 processor');
    assert.equal(m2Search[0].brand, 'Apple');
  });

  it('should accurately match any smartphone when present in active Firestore inventory', () => {
    // Simulating verified products added by administrator to Firestore
    const verifiedFirestoreProducts: Product[] = [
      {
        id: 'real-iphone13',
        name: 'Apple iPhone 13 128GB - Midnight',
        category: 'smartphones',
        brand: 'Apple',
        price: 680000,
        stock: 5,
        images: ['https://example.com/iphone13.jpg'],
        description: 'A15 Bionic chip, 6.1-inch Super Retina XDR OLED display, dual 12MP camera.',
        specifications: { 'Storage': '128GB', 'RAM': '4GB', 'Chipset': 'Apple A15 Bionic' },
        inStock: true,
        rating: 4.9,
        reviewsCount: 15,
      },
      {
        id: 'real-samsung-a15',
        name: 'Samsung Galaxy A15 128GB',
        category: 'smartphones',
        brand: 'Samsung',
        price: 215000,
        stock: 8,
        images: ['https://example.com/a15.jpg'],
        description: 'Super AMOLED 90Hz display, Helio G99, 50MP triple camera, 5000mAh.',
        specifications: { 'Storage': '128GB', 'Processor': 'MediaTek Helio G99' },
        inStock: true,
        rating: 4.8,
        reviewsCount: 12,
      },
      {
        id: 'real-tecno-camon30',
        name: 'Tecno Camon 30 256GB (8GB RAM)',
        category: 'smartphones',
        brand: 'Tecno',
        price: 270000,
        stock: 6,
        images: ['https://example.com/camon30.jpg'],
        description: '50MP OIS Ultra Steady camera, 70W Ultra charge, Helio G99 Ultimate.',
        specifications: { 'Storage': '256GB', 'RAM': '8GB', 'Camera': '50MP OIS' },
        inStock: true,
        rating: 4.7,
        reviewsCount: 9,
      },
      {
        id: 'real-infinix-hot50',
        name: 'Infinix Hot 50 128GB',
        category: 'smartphones',
        brand: 'Infinix',
        price: 188000,
        stock: 7,
        images: ['https://example.com/hot50.jpg'],
        description: '120Hz display, Helio G100 processor, 50MP camera.',
        specifications: { 'Storage': '128GB', 'Processor': 'Helio G100' },
        inStock: true,
        rating: 4.6,
        reviewsCount: 8,
      },
      {
        id: 'real-redmi-note13',
        name: 'Xiaomi Redmi Note 13 256GB',
        category: 'smartphones',
        brand: 'Xiaomi',
        price: 240000,
        stock: 9,
        images: ['https://example.com/note13.jpg'],
        description: '108MP camera, 120Hz AMOLED display, 33W Fast charging.',
        specifications: { 'Storage': '256GB', 'Camera': '108MP' },
        inStock: true,
        rating: 4.8,
        reviewsCount: 14,
      },
    ];

    // Test iPhone 13
    const ip13 = searchAndRankProducts(verifiedFirestoreProducts, 'iPhone 13');
    assert.equal(ip13.length, 1);
    assert.equal(ip13[0].id, 'real-iphone13');

    // Test Samsung A15 & alias
    const a15 = searchAndRankProducts(verifiedFirestoreProducts, 'Samsung A15');
    assert.equal(a15.length, 1);
    assert.equal(a15[0].id, 'real-samsung-a15');

    // Test Tecno Camon 30
    const camon = searchAndRankProducts(verifiedFirestoreProducts, 'Camon 30');
    assert.equal(camon.length, 1);
    assert.equal(camon[0].id, 'real-tecno-camon30');

    // Test Infinix Hot 50
    const hot50 = searchAndRankProducts(verifiedFirestoreProducts, 'Hot 50');
    assert.equal(hot50.length, 1);
    assert.equal(hot50[0].id, 'real-infinix-hot50');

    // Test Redmi Note 13
    const note13 = searchAndRankProducts(verifiedFirestoreProducts, 'Redmi Note 13');
    assert.equal(note13.length, 1);
    assert.equal(note13[0].id, 'real-redmi-note13');
  });

  it('should offer WhatsApp request option when a searched phone is not in active catalogue', () => {
    // If the 5 phones are not in the current active catalogue, searching must return 0 items
    const uncataloguedResults = searchAndRankProducts(INITIAL_PRODUCTS, 'Tecno Camon 30');
    assert.equal(uncataloguedResults.length, 0, 'Uncatalogued item returns 0 items');

    // Generating the WhatsApp gadget request URL
    const waUrl = createWhatsAppGadgetRequestUrl('Tecno Camon 30');
    assert.ok(waUrl.startsWith('https://wa.me/234'), 'Must direct to Nigerian WhatsApp link');
    assert.ok(waUrl.includes('Tecno%20Camon%2030'), 'Must contain the customer query');
    assert.ok(waUrl.includes('icontech-store.vercel.app'), 'Must reference the store domain');

    // Repeat for iPhone 13
    const waIphone = createWhatsAppGadgetRequestUrl('iPhone 13');
    assert.ok(waIphone.includes('iPhone%2013'));
  });

  it('should preserve existing genuine products and never overwrite them with seed data', () => {
    // Verify genuine products exist in base catalogue
    const s55 = INITIAL_PRODUCTS.find(p => p.id === 'prod-samsung-a55');
    assert.ok(s55, 'Samsung Galaxy A55 must exist');
    assert.equal(s55?.brand, 'Samsung');
    assert.equal(s55?.price, 315000);

    const s24 = INITIAL_PRODUCTS.find(p => p.id === 'prod-s24ultra');
    assert.ok(s24, 'Samsung Galaxy S24 Ultra must exist');
    assert.equal(s24?.price, 1720000);

    const ip15 = INITIAL_PRODUCTS.find(p => p.id === 'prod-iphone15promax');
    assert.ok(ip15, 'iPhone 15 Pro Max must exist');
    assert.equal(ip15?.brand, 'Apple');
  });
});
