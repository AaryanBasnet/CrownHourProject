const crypto = require('crypto');

/**
 * Field-Level Encryption Utility
 *
 * Security Enhancement: High-Level Data Privacy
 * - Encrypts PII (Personally Identifiable Information) at rest
 * - Uses AES-256-GCM for authenticated encryption
 * - Prevents unauthorized access to sensitive data even if DB is compromised
 *
 * This demonstrates defense-in-depth security:
 * 1. Passwords are hashed (one-way, cannot be decrypted)
 * 2. PII like phone numbers are encrypted (two-way, can be decrypted with key)
 * 3. Encryption key stored separately from database (environment variable)
 *
 * AES-256-GCM provides:
 * - Confidentiality: Data cannot be read without the key
 * - Authenticity: Data cannot be tampered with (authenticated encryption)
 * - IV (Initialization Vector): Each encryption is unique
 */

/**
 * Encryption algorithm and key
 */
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Security: Validate encryption key on module load
if (!ENCRYPTION_KEY) {
  console.warn('WARNING: ENCRYPTION_KEY not set. Field-level encryption disabled.');
}

if (ENCRYPTION_KEY && ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
}

/**
 * Encrypt a string value
 *
 * @param {String} text - Plain text to encrypt
 * @returns {String} Encrypted value in format: iv:authTag:encryptedData (all hex)
 * @throws {Error} If encryption fails
 *
 * Security: Returns format includes:
 * - IV (Initialization Vector): Random 16 bytes for uniqueness
 * - Auth Tag: 16 bytes for authenticity verification (prevents tampering)
 * - Encrypted Data: The actual encrypted content
 */
const encrypt = (text) => {
  try {
    // Return null/undefined as-is
    if (!text) return text;

    // Security: If no encryption key, return plain text (with warning)
    if (!ENCRYPTION_KEY) {
      console.warn('Encryption key not available. Storing data unencrypted.');
      return text;
    }

    // Security: Generate random IV for each encryption
    // This ensures same data encrypted twice produces different ciphertext
    const iv = crypto.randomBytes(16);

    // Convert hex key to buffer
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Security: Get authentication tag for GCM mode
    // This prevents tampering with encrypted data
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt an encrypted string value
 *
 * @param {String} encryptedText - Encrypted value from encrypt()
 * @returns {String} Decrypted plain text
 * @throws {Error} If decryption fails or data is tampered
 *
 * Security: Verifies auth tag before decryption
 * - If auth tag doesn't match, data was tampered with
 * - Throws error instead of returning corrupted data
 */
const decrypt = (encryptedText) => {
  try {
    // Return null/undefined as-is
    if (!encryptedText) return encryptedText;

    // Security: If no encryption key, assume data is not encrypted
    if (!ENCRYPTION_KEY) {
      return encryptedText;
    }

    // Parse encrypted format: iv:authTag:encryptedData
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Data might not be encrypted (backward compatibility)
      return encryptedText;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Convert hex key to buffer
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

    // Security: Set auth tag for verification
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Security: If decryption fails, data may be corrupted or tampered
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data - possible data corruption or tampering');
  }
};

/**
 * Check if a value appears to be encrypted
 *
 * @param {String} value - Value to check
 * @returns {Boolean} True if value appears to be encrypted
 */
const isEncrypted = (value) => {
  if (!value || typeof value !== 'string') return false;

  // Check for our encryption format: iv:authTag:encryptedData
  const parts = value.split(':');
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/i.test(part));
};

module.exports = {
  encrypt,
  decrypt,
  isEncrypted,
};
