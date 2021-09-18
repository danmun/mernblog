const crypto = require("crypto");
const algorithm = "aes256";
const DEFAULT_SECRET = "not_so_secret";
const SECRET = (process.env.SECRET || DEFAULT_SECRET).trim()
if(SECRET === DEFAULT_SECRET){
    console.error("!!!!!!!!!!!!!   Production server SECRET is not set in env   !!!!!!!!!!!!! - crypto.js")
}

/**
 * Encrypt the given text using the server secret.
 * Note, when using AES-256 algo, secret must be 32 bytes and IV must be 16 bytes.
 * Can throw "Invalid key length" if SECRET is not set or is too long or short.
 * @param text
 * @returns {{encrypted: string, iv: string}}
 */
const encrypt = (text) => {
    // different init-vector every time
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, SECRET, iv);
    const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return {encrypted: encrypted, iv: iv.toString('hex')}
}

/**
 * Decrypt the given encrypted text with the server secret and the given init-vector.
 * @param encrypted
 * @param iv
 * @returns {string}
 */
const decrypt = (encrypted, iv) => {
    const ivBytes = Buffer.from(iv, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, SECRET, ivBytes);
    const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}