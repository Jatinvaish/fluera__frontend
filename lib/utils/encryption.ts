// lib/utils/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'fluera-default-secret-key-2024';

export class EncryptionService {
  /**
   * Encrypt a value for URL query parameters
   */
  static encrypt(value: string | number): string {
    try {
      const stringValue = String(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      // Make URL-safe by replacing characters
      return encodeURIComponent(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      return String(value);
    }
  }

  /**
   * Decrypt a value from URL query parameters
   */
  static decrypt(encryptedValue: string): string | null {
    try {
      const decoded = decodeURIComponent(encryptedValue);
      const decrypted = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      return result || null;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Encrypt an object to query string
   */
  static encryptObject(obj: Record<string, any>): string {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      console.error('Object encryption error:', error);
      return '';
    }
  }

  /**
   * Decrypt query string to object
   */
  static decryptObject<T = any>(encryptedValue: string): T | null {
    try {
      const decrypted = this.decrypt(encryptedValue);
      if (!decrypted) return null;
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Object decryption error:', error);
      return null;
    }
  }
}
