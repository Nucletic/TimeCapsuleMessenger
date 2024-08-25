import CryptoJS from 'crypto-js';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from '../firebaseConfig';
import { SECRET_KEY } from './constants';


export function encryptData(data, secretKey) {
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // Generate IV
  const cipherParams = CryptoJS.AES.encrypt(data, secretKey, { iv });
  const cipherText = cipherParams.toString();
  return cipherParams.iv.toString(CryptoJS.enc.Base64) + ':' + cipherText; // Combine IV and ciphertext
}


export function decryptData(combinedData, secretKey) {
  const [ivString, cipherText] = combinedData.split(':');
  const iv = CryptoJS.enc.Base64.parse(ivString); // Parse the Base64 string
  const cipherParams = CryptoJS.AES.decrypt(cipherText, secretKey, { iv });
  const decrypted = cipherParams.toString(CryptoJS.enc.Utf8);
  return decrypted;
}


export const getCustomUUID = async () => {
  try {
    const CustomUUID = await AsyncStorage.getItem('CustomUUID');
    return CustomUUID;
  } catch (error) {
    console.error('Error Fetching CustomUUID from AsyncStorage', error);
    throw error
  }
}


export const getUserIDToken = async () => {
  try {
    const IDToken = await FIREBASE_AUTH.currentUser.getIdToken();
    const encryptedIDToken = encryptData(IDToken, SECRET_KEY);
    return encryptedIDToken;
  } catch (error) {
    console.error('Error getting IDToken', error)
    throw error
  }
}