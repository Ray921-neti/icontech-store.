/**
 * Professional Image Optimization, Validation & Media Processing Utilities
 * Designed to ensure reliable, lightweight image uploads that never exceed
 * Cloud Firestore's 1MB document size limit or break in offline/slow networks.
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeBytes?: number; // Max allowed input file size before processing
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/svg+xml'
];

/**
 * Validates an image file type and size.
 */
export function validateImageFile(
  file: File, 
  maxSizeBytes = 10 * 1024 * 1024 // 10MB default threshold for raw camera photos
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || 
    file.name.match(/\.(jpg|jpeg|png|webp|gif|heic)$/i);

  if (!isAllowedType) {
    return { 
      isValid: false, 
      error: 'Unsupported file format. Please upload a JPEG, PNG, or WebP photo.' 
    };
  }

  if (file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return { 
      isValid: false, 
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxMB}MB.` 
    };
  }

  return { isValid: true };
}

/**
 * Compresses an image client-side to an optimized base64 Data URL.
 * Automatically downscales large phone camera pictures (e.g. 12MP/4000px)
 * to a crisp 800-1000px web asset under 100KB, preventing Firestore document overflow.
 */
export function processAndCompressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.8,
    maxSizeBytes = 10 * 1024 * 1024
  } = options;

  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file, maxSizeBytes);
    if (!validation.isValid) {
      return reject(new Error(validation.error));
    }

    // SVG files do not require raster canvas compression
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('The uploaded file could not be parsed as an image.'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Maintain aspect ratio while bounding within maxWidth & maxHeight
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas context could not be created.'));
          }

          // Use high quality interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Prefer WebP if supported, fallback to JPEG
          let outputDataUrl: string;
          try {
            outputDataUrl = canvas.toDataURL('image/webp', quality);
            if (!outputDataUrl.startsWith('data:image/webp')) {
              outputDataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            outputDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(outputDataUrl);
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Image compression failed.'));
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Checks whether an image URL is a valid web link or Data URL.
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('/')
  );
}
