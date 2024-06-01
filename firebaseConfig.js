import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage, ref } from "firebase/storage";
import Constants from "expo-constants";

// Your web app's Firebase configuration
const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGEING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MESUREMENT_ID,
} = Constants.expoConfig.extra;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGEING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MESUREMENT_ID,
};

// Initialize Firebase with LOCAL storage persistence
const authPersistence = getReactNativePersistence(AsyncStorage);
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, { persistence: authPersistence });
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);


// android: 36721383235-i01rm4kh6vigsm80rk74mo8q511hb936.apps.googleusercontent.com


// import data from './Data.json';

// import { collection, addDoc } from "firebase/firestore";

// const addBook = async () => {
//   try {
//     const docRef = await addDoc(collection(FIREBASE_DB, "books"), { ...data });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// };

// // Call the function to add a book
// addBook();