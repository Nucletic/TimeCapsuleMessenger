import CryptoJS from 'crypto-js';

exports.encryptData = function (data, secretKey) {
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // Generate IV
  const cipherParams = CryptoJS.AES.encrypt(data, secretKey, { iv });
  const cipherText = cipherParams.toString();
  return cipherParams.iv.toString(CryptoJS.enc.Base64) + ':' + cipherText; // Combine IV and ciphertext
}

exports.decryptData = function (combinedData, secretKey) {
  const [ivString, cipherText] = combinedData.split(':');
  const iv = CryptoJS.enc.Base64.parse(ivString); // Parse the Base64 string
  const cipherParams = CryptoJS.AES.decrypt(cipherText, secretKey, { iv });
  const decrypted = cipherParams.toString(CryptoJS.enc.Utf8);
  return decrypted;
}


// import { Crypto } from 'expo-crypto';

// async function encryptData(data, secretKey) {
//   const cipherText = await Crypto.digestStringAsync(
//     Crypto.CryptoDigestAlgorithm.SHA256,
//     data + secretKey
//   );

//   return cipherText;
// }

// import { Crypto } from 'expo-crypto';

// async function decryptData(encryptedData, secretKey) {
//   const decryptedData = await Crypto.digestStringAsync(
//     Crypto.CryptoDigestAlgorithm.SHA256,
//     encryptedData + secretKey
//   );

//   return decryptedData;
// }