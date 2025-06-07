import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique key for a conversation
export const generateEncryptionKey = (): string => {
  return uuidv4();
};

// Encrypt message content
export const encryptMessage = (message: string, encryptionKey: string): string => {
  try {
    return CryptoJS.AES.encrypt(message, encryptionKey).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Decrypt message content
export const decryptMessage = (encryptedMessage: string, encryptionKey: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Unable to decrypt message]';
  }
};

// Store encryption key securely in localStorage (in a real app, consider more secure options)
export const storeEncryptionKey = (conversationId: string, key: string): void => {
  const encryptionKeys = getStoredEncryptionKeys();
  encryptionKeys[conversationId] = key;
  localStorage.setItem('encryption_keys', JSON.stringify(encryptionKeys));
};

// Retrieve encryption key for a conversation
export const getEncryptionKey = (conversationId: string): string | null => {
  const encryptionKeys = getStoredEncryptionKeys();
  return encryptionKeys[conversationId] || null;
};

// Get all stored encryption keys
export const getStoredEncryptionKeys = (): Record<string, string> => {
  const keysStr = localStorage.getItem('encryption_keys');
  return keysStr ? JSON.parse(keysStr) : {};
};