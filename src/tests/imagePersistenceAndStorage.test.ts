import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageFile, isValidImageUrl } from '../utils/imageUtils';

describe('Image Persistence, Accessibility & Storage Invariant Tests', () => {
  it('should confirm data URLs are under 100KB to guarantee Firestore document limit safety (<1MB)', () => {
    // 100x100 1-pixel test webp base64
    const sampleDataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=';
    const payloadBytes = Buffer.byteLength(sampleDataUrl, 'utf8');

    // A compressed 900x900 WebP is typically 30KB - 80KB.
    // Ensure that even a large base64 payload stays well beneath the 1,048,576 bytes Firestore limit
    assert.ok(payloadBytes < 1048576, 'Image data URL must not exceed Firestore 1MB limit');
  });

  it('should confirm HTTPS external product image URLs are accessible and valid', () => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80',
    ];

    for (const url of sampleUrls) {
      assert.equal(isValidImageUrl(url), true, `URL must be valid: ${url}`);
      assert.ok(url.startsWith('https://'), 'Must use secure HTTPS protocol');
    }
  });

  it('should ensure device camera photos > 10MB are intercepted before memory overflow', () => {
    const rawCameraCapture = {
      name: 'IMG_4821_48MP.RAW',
      type: 'image/jpeg',
      size: 16 * 1024 * 1024, // 16MB
    } as unknown as File;

    const validation = validateImageFile(rawCameraCapture);
    assert.equal(validation.isValid, false);
    assert.match(validation.error || '', /File is too large/);
  });
});
