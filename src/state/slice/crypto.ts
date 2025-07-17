import CryptoJS from 'crypto-js';

const ENCRYPT_KEY = process.env.REACT_APP_ENCRYPT_KEY;
const IV = process.env.REACT_APP_IV;

if (!ENCRYPT_KEY || !IV) {
  throw new Error('Encryption key and IV must be set in environment variables.');
}

export const encrypt = (data: string | object): string => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const cipher = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Hex.parse(ENCRYPT_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  return cipher.toString();
};

export const decrypt = (cipherText: string): any => {
  const bytes = CryptoJS.AES.decrypt(
    cipherText,
    CryptoJS.enc.Hex.parse(ENCRYPT_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decryptedText);
  } catch (e) {
    return decryptedText;
  }
};