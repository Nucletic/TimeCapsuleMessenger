import React, { useState, useEffect, useContext } from 'react'
import MainNavigation from '../navigation/MainNavigation'
import Registration from './Registration'
import * as WebBrowser from "expo-web-browser";
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import * as SplashScreen from 'expo-splash-screen';
import { usePushNotifications } from '../usePushNotifications';
import { doc, getDoc, serverTimestamp, updateDoc, collection, query, where, getDocs, setDoc, arrayUnion, } from 'firebase/firestore';
import AppContext from '../ContextAPI/AppContext';
import { encryptData } from '../EncryptData'
import { AppState } from 'react-native';



SplashScreen.preventAutoHideAsync();


import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const Index = () => {

  const { setShowAds } = useContext(AppContext)

  WebBrowser.maybeCompleteAuthSession();

  const { expoPushToken, notification } = usePushNotifications();


  const [loading, setLoading] = useState(true);
  const [LoggedIn, setLoggedIn] = useState(null);
  const [userUID, setUserUID] = useState(null);


  const checkLogin = async () => {
    setLoading(true);
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          if (user.emailVerified) {
            setUserUID(user.uid);
            setLoggedIn(true);
            onlineUserActivityUpdate(user.uid);
            checkMember(user.uid);
            deleteTimedOutTale(user.uid);
          } else {
            setLoggedIn(false);
          }
        } else {
          setLoggedIn(false);
        }
      } catch (error) {
        console.error('Error during login:', error);
      } finally {
        setLoading(false); // Set loading to false after all operations
      }
    });
    return () => unsubscribe();
  };

  useEffect(() => {
    if (expoPushToken?.data && userUID) {
      saveExpoPushTokenToFirebase(userUID);
    }
  }, [expoPushToken, userUID])

  useEffect(() => {
    if (expoPushToken?.data) {
      saveExpoPushTokenToFirebaseWithoutUserUID(expoPushToken)
    }
  }, [expoPushToken])






  const checkMember = async (uid) => {
    try {
      const docRef = doc(FIREBASE_DB, 'users', uid)
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.watchedAds === 15) {
          setShowAds(true)
        }
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const saveExpoPushTokenToFirebase = async (uid) => {
    try {
      const docRef = doc(FIREBASE_DB, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ExpoPushToken: expoPushToken?.data || null,
        })
      }
    } catch (error) {
      console.log('Error saving expo push token to firebase:', error)
    }
  }


  const saveExpoPushTokenToFirebaseWithoutUserUID = async (expoPushToken) => {
    try {
      const token = expoPushToken?.data; // Ensure you have the token data ready

      const docRef = doc(FIREBASE_DB, 'ExpoPushTokens', 'Tokens');
      await setDoc(docRef, {
        Tokens: arrayUnion(token), // Use arrayUnion to add token if it doesn't exist already
      }, { merge: true });

      console.log("Expo push token saved successfully");
    } catch (error) {
      console.error("Error saving Expo push token:", error);
    }
  };










  const deleteTimedOutTale = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/deleteTimedOutTale`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status !== 200) {
        console.log('error deleting timed out tale')
      }

    } catch (error) {
      console.log("Error Deleting Outdated Tale", error);
    }
  }

  const onlineUserActivityUpdate = async (uid) => {
    try {
      const docRef = doc(FIREBASE_DB, 'users', uid)
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          activityStatus: 'active',
          lastActive: serverTimestamp(),
        });
      } else {
        console.error('Document does not exist');
      }
    } catch (error) {
      console.error('Error during updating activity status:', error);
    }
  }

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);


  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      console.log('AppState Change Detected:', nextAppState);
      if (nextAppState === 'background' || nextAppState === 'inactive' || nextAppState === 'unknown') {
        await offlineUserActivityUpdate(userUID);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [userUID]);


  const offlineUserActivityUpdate = async (uid) => {
    try {
      const userDocRef = doc(FIREBASE_DB, 'users', uid);
      await updateDoc(userDocRef, {
        activityStatus: 'inactive',
        lastActive: serverTimestamp(),
      });
      console.log('User activity status updated successfully');
    } catch (error) {
      console.error('Error updating activity status:', error);
    }
  };



  return (
    <>
      {LoggedIn ? <MainNavigation /> : <Registration setLoggedIn={setLoggedIn} />}
    </>
  );
}

export default Index;


// D:\AndroidSDK\emulator
// emulator -avd Pixel_4_API_34 -feature -Vulkan
// emulator -avd Pixel_4_XL_API_34x -feature -Vulkan

// for Cold Boot
// -no-snapshot-load