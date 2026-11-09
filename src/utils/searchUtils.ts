import { Product } from '../types';
import { STORE_PHONE } from './formatters';

/**
 * Normalizes text for tolerant search matching:
 * - Lowercases
 * - Replaces hyphens, underscores, slashes, parentheses, and punctuation with spaces
 * - Trims and normalizes multiple spaces
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common phone and gadget model alias mapper to support popular Nigerian variations:
 * e.g., 'a15' <-> 'galaxy a15', 'iphone13' <-> 'iphone 13', 'hot50' <-> 'hot 50', 'camon30' <-> 'camon 30'
 */
function expandModelAliases(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  
  tokens.forEach((t) => {
    // E.g. "iphone13" -> "iphone", "13"
    const matchAlphanumeric = t.match(/^([a-z]+)(\d+)$/i);
    if (matchAlphanumeric) {
      expanded.add(matchAlphanumeric[1]);
      expanded.add(matchAlphanumeric[2]);
      expanded.add(`${matchAlphanumeric[1]} ${matchAlphanumeric[2]}`);
    }

    // E.g. "a15" -> "galaxy a15", "samsung a15"
    if (/^a\d+$/i.test(t)) {
      expanded.add(`galaxy ${t}`);
      expanded.add(`samsung ${t}`);
    }
  });

  return Array.from(expanded);
}

export interface SearchMatchResult {
  product: Product;
  score: number;
}

/**
 * Computes a relevance score for a product given a search query:
 * - Brand, Model, Name, Category, Specifications (RAM, Storage, Display, Camera)
 * - Higher score = more relevant result
 */
export function calculateProductRelevance(product: Product, rawQuery: string): number {
  const cleanQuery = normalizeSearchString(rawQuery);
  if (!cleanQuery) return 0;

  const queryTokens = cleanQuery.split(' ').filter(Boolean);
  if (queryTokens.length === 0) return 0;

  const cleanName = normalizeSearchString(product.name);
  const cleanBrand = normalizeSearchString(product.brand);
  const cleanCategory = normalizeSearchString(product.category);
  const cleanDescription = normalizeSearchString(product.description || '');

  // Extract all specification keys and values
  let cleanSpecs = '';
  if (product.specifications) {
    cleanSpecs = normalizeSearchString(
      Object.entries(product.specifications)
        .map(([k, v]) => `${k} ${v}`)
        .join(' ')
    );
  }

  // Combined searchable text corpus
  const fullSearchCorpus = `${cleanBrand} ${cleanName} ${cleanCategory} ${cleanSpecs} ${cleanDescription}`;

  // Check if ALL query tokens are present somewhere in the product
  const expandedTokens = expandModelAliases(queryTokens);
  
  // Every user query token must match in the corpus
  const allTokensMatch = queryTokens.every((token) => {
    if (fullSearchCorpus.includes(token)) return true;
    
    // Check if any alias of the token matches
    const tokenAliases = expandModelAliases([token]);
    return tokenAliases.some((alias) => fullSearchCorpus.includes(alias));
  });

  if (!allTokensMatch) {
    return 0; // Does not match all search requirements
  }

  // Calculate score based on where and how well it matches
  let score = 10;

  // Exact phrase match in name
  if (cleanName === cleanQuery) {
    score += 150;
  } else if (cleanName.includes(cleanQuery)) {
    score += 100;
  } else if (cleanName.startsWith(cleanQuery)) {
    score += 80;
  }

  // Exact match in brand
  if (cleanBrand === cleanQuery) {
    score += 70;
  } else if (cleanBrand.includes(cleanQuery)) {
    score += 40;
  }

  // Token-by-token scoring in name
  queryTokens.forEach((token) => {
    if (cleanName.includes(token)) {
      score += 25;
    }
    if (cleanBrand.includes(token)) {
      score += 15;
    }
    if (cleanSpecs.includes(token)) {
      score += 10;
    }
    if (cleanDescription.includes(token)) {
      score += 3;
    }
  });

  // Boost in-stock products slightly
  if (product.inStock && product.stock > 0) {
    score += 5;
  }

  // Boost featured products
  if (product.isFeatured) {
    score += 3;
  }

  return score;
}

/**
 * Filters and ranks a list of products according to the search query.
 */
export function searchAndRankProducts(products: Product[], rawQuery: string): Product[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return products;
  }

  const scored: SearchMatchResult[] = [];

  for (const prod of products) {
    const score = calculateProductRelevance(prod, trimmed);
    if (score > 0) {
      scored.push({ product: prod, score });
    }
  }

  // Sort by score descending; tie-breaker: rating, then reviews count
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.product.rating - a.product.rating || b.product.reviewsCount - a.product.reviewsCount;
  });

  return scored.map((item) => item.product);
}

/**
 * Creates a pre-populated WhatsApp URL for customers searching for an unavailable or uncatalogued phone
 */
export function createWhatsAppGadgetRequestUrl(searchQuery: string): string {
  const sanitizedQuery = searchQuery.trim() || 'Gadget / Phone';
  const message = `Hello ICONTECH Electronics Ondo! I am searching for "${sanitizedQuery}" on your online store (icontech-store.vercel.app). Is it currently available in your shop, or can you arrange a verified order for me?`;
  return `https://wa.me/234${STORE_PHONE.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
}

/**
 * List of popular gadget search shortcuts in Nigeria for quick customer navigation
 */
export const POPULAR_SEARCH_TERMS = [
  'iPhone 13',
  'Samsung A15',
  'Tecno Camon 30',
  'Infinix Hot 50',
  'Redmi Note 13',
  'AirPods Pro 2',
  'Oraimo Power Bank',
  'MacBook Air M2',
  'Samsung S24 Ultra',
];
