// Assume you have a master key
const masterKey = "!@#FSDSesdfs#$%^4.?=="; // Assume you have a master key

// Function to generate a key from a password using the Web Crypto API
async function deriveKeyFromPassword(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Function to encrypt data using the Web Crypto API
async function encryptData(data, key) {
    const encoder = new TextEncoder();
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        key,
        encoder.encode(data)
    );
    return arrayBufferToBase64(encryptedData);
    //return new Uint8Array(encryptedData).toString();
}

// Function to decrypt data using the Web Crypto API
async function decryptData(encryptedData, key) {
    const decoder = new TextDecoder();
    const binary = atob(encryptedData);
    const encryptedBuffer = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        encryptedBuffer[i] = binary.charCodeAt(i);
    }

    const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        key,
        encryptedBuffer
    );
    return decoder.decode(decryptedData);
}

// Function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const binary = String.fromCharCode.apply(null, bytes);
    return btoa(binary);
}

// Usage example
export async function getEncryptedData({ encryptionKey, password }) {
    // Derive a key from the master key
    const userMasterKey = await deriveKeyFromPassword(masterKey);

    // Encrypt the encryptionKey field with the derived key
    const encryptedEncryptionKey = await encryptData(
        encryptionKey,
        userMasterKey
    );

    // Store the encryptedEncryptionKey in the database or elsewhere

    // Now, encrypt the password field with the encryptedEncryptionKey
    const passwordKey = await deriveKeyFromPassword(encryptedEncryptionKey);
    const encryptedPassword = await encryptData(password, passwordKey);

    const response = {
        encrypted_key: encryptedEncryptionKey,
        password: encryptedPassword,
    };

    return response;

    // Log the results
    //console.log('Encrypted Encryption Key:', encryptedEncryptionKey);
    //console.log('Encrypted Password:', encryptedPassword);

    // Decrypt the data for demonstration purposes
    //const decryptedEncryptionKey = await decryptData(encryptedEncryptionKey, userMasterKey);
    //const decryptedPassword = await decryptData(encryptedPassword, passwordKey);

    //console.log('Decrypted Encryption Key:', decryptedEncryptionKey);
    //console.log('Decrypted Password:', decryptedPassword);
}

// Usage example
export async function getEncryptedPassword({ encryptedEncryptionKey, password }) {
    const passwordKey = await deriveKeyFromPassword(encryptedEncryptionKey);
    const encryptedPassword = await encryptData(password, passwordKey);

    return encryptedPassword;
}
