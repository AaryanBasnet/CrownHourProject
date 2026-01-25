const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * OTP (One-Time Password) Utility Functions
 * Handles Multi-Factor Authentication (MFA) with TOTP
 *
 * Security: MFA adds an extra layer of security
 * - Uses time-based one-time passwords (TOTP)
 * - Secrets are stored encrypted
 * - Backup codes for account recovery
 */

/**
 * Generate MFA secret for user
 * @param {String} email - User's email
 * @returns {Object} Secret and otpauth URL
 */
const generateMFASecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `${process.env.MFA_ISSUER || 'CrownHour'} (${email})`,
    issuer: process.env.MFA_ISSUER || 'CrownHour',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

/**
 * Generate QR code for MFA setup
 * @param {String} otpauthUrl - OTP auth URL
 * @returns {Promise<String>} QR code data URL
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify TOTP token
 * @param {String} token - 6-digit token from authenticator app
 * @param {String} secret - User's MFA secret
 * @returns {Boolean} Whether token is valid
 */
const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 6, // Allow 6 time steps (3 minutes) before/after to handle clock skew
  });
};

/**
 * Generate backup codes for MFA recovery
 * @param {Number} count - Number of codes to generate (default 10)
 * @returns {Array} Array of backup codes
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code: code,
      used: false,
    });
  }
  return codes;
};

/**
 * Generate email OTP (for alternative MFA method)
 * @returns {String} 6-digit OTP
 */
const generateEmailOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for storage
 * @param {String} otp - OTP to hash
 * @returns {String} Hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify email OTP
 * @param {String} inputOTP - OTP provided by user
 * @param {String} storedHash - Stored hashed OTP
 * @returns {Boolean} Whether OTP is valid
 */
const verifyEmailOTP = (inputOTP, storedHash) => {
  const inputHash = hashOTP(inputOTP);
  return inputHash === storedHash;
};

module.exports = {
  generateMFASecret,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  generateEmailOTP,
  hashOTP,
  verifyEmailOTP,
};
