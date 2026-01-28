const crypto = require('crypto');
const axios = require('axios');

/**
 * Check if a password has been compromised using Pwned Passwords API (k-anonymity)
 * @param {string} password - The plain text password
 * @returns {Promise<boolean>} - True if compromised
 */
const checkPwnedPassword = async (password) => {
    try {
        // 1. Hash password using SHA-1 (required by API)
        const hash = crypto
            .createHash('sha1')
            .update(password)
            .digest('hex')
            .toUpperCase();

        // 2. Split into prefix (5 chars) and suffix
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        // 3. Query API with prefix (k-anonymity)
        const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);

        // 4. Check if suffix exists in response lines
        const pwnedHashes = response.data.split('\n');
        const isPwned = pwnedHashes.some(line => {
            const [hashSuffix] = line.split(':');
            return hashSuffix.trim() === suffix;
        });

        if (isPwned) {
            console.warn('Security Alert: User attempted to use a compromised password.');
        }

        return isPwned;
    } catch (error) {
        console.error('Pwned Check Failed:', error.message);
        // If API fails, default to false (fail open) or true (fail closed)?
        // Fail open is better for UX, don't block registration if API is down.
        return false;
    }
};

module.exports = { checkPwnedPassword };
