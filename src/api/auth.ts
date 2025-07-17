import CryptoJS from 'crypto-js'

// Environment Variables
const ALGORITHM = process.env.REACT_APP_ALGORITHM // Ensure this is set appropriately
const ENCRYPT_KEY = process.env.REACT_APP_ENCRYPT_KEY
const IV = process.env.REACT_APP_IV

if (!ENCRYPT_KEY || !IV) {
  throw new Error('Encryption key and IV must be set in environment variables.')
}

/**
 * Encrypts data using AES encryption.
 * @param {string|object} data - The data to encrypt. Can be a string or an object.
 * @returns {string} The encrypted ciphertext.
 */
export const encrypt = (data:string|object): string => {
  const text = typeof data === 'string' ? data : JSON.stringify(data)
  const cipher = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Hex.parse(ENCRYPT_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(IV),
      mode: CryptoJS.mode.CBC, // Specify mode if necessary
      padding: CryptoJS.pad.Pkcs7, // Specify padding if necessary
    },
  )
  return cipher.toString()
}

/**
 * Decrypts ciphertext using AES decryption.
 * @param {string} cipherText - The encrypted ciphertext.
 * @returns {string|object} The decrypted data. Returns an object if JSON.parse succeeds.
 */
export const decrypt = (cipherText: string): string | object => {
  const bytes = CryptoJS.AES.decrypt(
    cipherText,
    CryptoJS.enc.Hex.parse(ENCRYPT_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(IV),
      mode: CryptoJS.mode.CBC, // Ensure consistency with encryption
      padding: CryptoJS.pad.Pkcs7, // Ensure consistency with encryption
    },
  )
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8)
  try {
    return JSON.parse(decryptedText)
  } catch (e) {
    return decryptedText
  }
}

/**
 * Stores a secure token in chrome.storage.local.
 * @param {string} name - The key under which the token is stored (e.g., 'authToken').
 * @param {string|object} value - The token value to store.
 */
export const setSecureToken = async (name: string, value: string | object) => {
  const encryptedValue = encrypt(value)
  const expiryTimestamp = Date.now() + 12 * 30 * 24 * 60 * 60 * 1000 // Approx. 12 months in ms

  const tokenData = {
    value: encryptedValue,
    expiresAt: expiryTimestamp,
  }

  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({ [name]: tokenData }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        // console.log(`${name} stored successfully.`)
        resolve()
      }
    })
  })
}

/**
 * Retrieves and decrypts a secure token from chrome.storage.local.
 * @param {string} name - The key of the token to retrieve.
 * @returns {Promise<string|object|null>} The decrypted token or null if not found or expired.
 */
export const getSecureToken = async (name: string): Promise<string | object | null> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([name], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
        return
      }

      const tokenData = result[name]
      if (!tokenData) {
        resolve(null)
        return
      }

      const { value, expiresAt } = tokenData

      // Check if token has expired
      if (Date.now() > expiresAt) {
        // Token expired; remove it
        chrome.storage.local.remove([name], () => {
          if (chrome.runtime.lastError) {
            // console.error(chrome.runtime.lastError)
          }
          resolve(null)
        })
        return
      }

      try {
        const decrypted = decrypt(value)
        resolve(decrypted)
      } catch (e) {
        // console.error('Decryption failed:', e)
        resolve(null)
      }
    })
  })
}

/**
 * Clears secure storage by removing all stored tokens.
 */
export const clearSecureStorage = async () => {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        // console.log('All tokens cleared successfully.')
        resolve()
      }
    })
  })
}