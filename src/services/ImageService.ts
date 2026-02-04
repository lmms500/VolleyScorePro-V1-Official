
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { platformService } from './PlatformService';
import { set, get } from 'idb-keyval';

/**
 * ImageService v3.1 (PNG Transparency Support)
 * Handles high-performance image storage.
 * - Native: Uses Filesystem
 * - Web: Uses IndexedDB (idb-keyval) to keep State light.
 */
export class ImageService {
  private static instance: ImageService;
  
  // Compression Config
  private readonly MAX_WIDTH = 512;
  private readonly MAX_HEIGHT = 512;
  // Quality is ignored for PNG, but kept for reference if we switch back to webp/jpeg
  private readonly QUALITY = 0.8; 

  private constructor() {}

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  private get isNative() {
      return platformService.isNative;
  }

  /**
   * Compresses an image using an off-screen canvas.
   * Exports as PNG to preserve transparency.
   */
  private async compressImage(dataUrl: string): Promise<string> {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Maintain aspect ratio
              if (width > height) {
                  if (width > this.MAX_WIDTH) {
                      height *= this.MAX_WIDTH / width;
                      width = this.MAX_WIDTH;
                  }
              } else {
                  if (height > this.MAX_HEIGHT) {
                      width *= this.MAX_HEIGHT / height;
                      height = this.MAX_HEIGHT;
                  }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  resolve(dataUrl); 
                  return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              
              // Export compressed PNG (Preserves Transparency)
              // Note: PNG does not support quality parameter in standard toDataURL
              const compressedDataUrl = canvas.toDataURL('image/png');
              resolve(compressedDataUrl);
          };
          img.onerror = (e) => reject(e);
      });
  }

  /**
   * Saves an image efficiently.
   * Returns a reference string (IDB key or File URI) to store in GameState.
   */
  public async saveImage(dataUrl: string, contextId: string): Promise<string> {
    try {
        const optimizedDataUrl = await this.compressImage(dataUrl);

        if (this.isNative) {
            // NATIVE: Save to Disk
            const fileName = `img_${contextId}_${Date.now()}.png`;
            const base64Data = optimizedDataUrl.split(',')[1]; 

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Data, 
                recursive: true
            });

            // Return persistent URI
            return Capacitor.convertFileSrc(savedFile.uri);

        } else {
            // WEB: Save to IndexedDB (Blob)
            // Convert Base64 to Blob
            const response = await fetch(optimizedDataUrl);
            const blob = await response.blob();
            
            const key = `img_${contextId}_${Date.now()}`;
            await set(key, blob);
            
            // Return Reference Protocol
            return `idb://${key}`;
        }

    } catch (e) {
      console.error('[ImageService] Save failed:', e);
      return dataUrl; // Fallback to raw base64 if storage fails
    }
  }

  /**
   * Resolves a stored reference into a displayable URL (Object URL or File URI).
   */
  public async resolveImage(src: string): Promise<string> {
      if (!src) return '';

      // IDB Reference
      if (src.startsWith('idb://')) {
          const key = src.replace('idb://', '');
          try {
              const blob = await get<Blob>(key);
              if (blob) {
                  return URL.createObjectURL(blob);
              }
          } catch (e) {
              console.warn('[ImageService] Failed to load from IDB', e);
          }
          return ''; // Failed
      }

      // Native/Standard/Base64
      return src;
  }
}

export const imageService = ImageService.getInstance();
