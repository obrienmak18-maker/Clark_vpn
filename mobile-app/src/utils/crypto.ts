import CryptoJS from 'crypto-js';
import { VpnConfig } from '../types';

// In a production app, this key should be hidden in native code (C++ or Android Keystore)
const SECRET_KEY = 'ClarkVpn_Secure_Key_2026_!@#'; 

export const exportConfig = (config: VpnConfig, message: string, expireDate?: string): string => {
  // Create a locked copy of the config
  const lockedConfig: VpnConfig = {
    ...config,
    isLocked: true,
    message,
    expireDate,
  };

  // Convert to JSON
  const jsonString = JSON.stringify(lockedConfig);

  // Encrypt with AES
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();

  // Return formatted string (can be saved as .clark file)
  return `clark://${encrypted}`;
};

export const importConfig = (encryptedData: string): VpnConfig => {
  try {
    // Remove prefix if present
    const cleanData = encryptedData.replace('clark://', '').trim();

    // Decrypt
    const bytes = CryptoJS.AES.decrypt(cleanData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error('Fichier corrompu ou clé invalide');
    }

    // Parse JSON
    const config: VpnConfig = JSON.parse(decryptedString);

    // Validate expiration if present
    if (config.expireDate) {
      const expiry = new Date(config.expireDate).getTime();
      const now = Date.now();
      if (now > expiry) {
        throw new Error('Cette configuration a expiré.');
      }
    }

    // Force locked state upon import to prevent tampering
    return {
      ...config,
      isLocked: true,
      // Create a new unique ID so it doesn't overwrite if imported multiple times
      id: Date.now().toString(),
    };
  } catch (error) {
    throw new Error('Erreur lors de l\'importation de la configuration.');
  }
};
