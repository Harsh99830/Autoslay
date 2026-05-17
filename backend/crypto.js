import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Lazy-load the key so dotenv has time to run before this is read
function getKey() {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY env variable is not set');
  }
  return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
}

/**
 * Encrypt a value (string, array, or object).
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex-encoded).
 * Returns the value unchanged if it is null / undefined / empty string.
 */
export function encrypt(value) {
  if (value === null || value === undefined || value === '') return value;

  const str = typeof value === 'string' ? value : JSON.stringify(value);

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a value previously encrypted with encrypt().
 * Arrays / objects are automatically JSON-parsed on return.
 * Returns the raw value if it cannot be decrypted (backward compat for plain rows).
 */
export function decrypt(value) {
  if (value === null || value === undefined || value === '') return value;
  if (typeof value !== 'string' || !value.includes(':')) return value;

  try {
    const parts = value.split(':');
    if (parts.length < 3) return value;

    const [ivHex, authTagHex, ...rest] = parts;
    const encryptedHex = rest.join(':'); // in case ciphertext somehow contained ':'

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');

    // Restore arrays / objects that were serialized
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('Decryption failed for a field — returning raw value:', err.message);
    return value;
  }
}

/**
 * Encrypt every value in a flat object.
 * @param {object} obj   - Plain object with string / array values
 * @param {string[]} skip - Keys to leave unencrypted (e.g. primary keys)
 */
export function encryptObject(obj, skip = []) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = skip.includes(key) ? val : encrypt(val);
  }
  return result;
}

/**
 * Decrypt every value in a flat object.
 * @param {object} obj   - Object with encrypted values from Supabase
 * @param {string[]} skip - Keys to leave untouched (e.g. primary keys, timestamps)
 */
export function decryptObject(obj, skip = []) {
  if (!obj) return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = skip.includes(key) ? val : decrypt(val);
  }
  return result;
}
