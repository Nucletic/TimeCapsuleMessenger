import React, { useState, useEffect } from 'react'
import MainNavigation from '../navigation/MainNavigation'
import Registration from './Registration'
import * as WebBrowser from "expo-web-browser";
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

import Constants from 'expo-constants';
import { collection, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const Index = () => {

  WebBrowser.maybeCompleteAuthSession();

  const [loading, setLoading] = useState(true);
  const [LoggedIn, setLoggedIn] = useState(null);


  const checkLogin = async () => {
    setLoading(true);
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          if (user.emailVerified) {
            await updateActivityStatus();
            setLoggedIn(true);
            setLoading(false);
          } else {
            setLoggedIn(false);
            setLoading(false);
          }
        } else {
          setLoggedIn(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    });
    return () => unsubscribe();
  }

  const updateActivityStatus = async () => {
    try {
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const querySnapshot = await getDocs(query(collection(FIREBASE_DB, 'users'), where('userId', '==', CustomUUID)));

      if (!querySnapshot.empty) {
        const userRef = querySnapshot.docs[0].ref;
        await updateDoc(userRef, {
          activityStatus: 'active',
          lastActive: serverTimestamp(),
        });
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



  return (
    <>
      {LoggedIn ? <MainNavigation /> : <Registration setLoggedIn={setLoggedIn} />}
    </>
  );
}

export default Index;


// cd C:\Users\pc\AppData\Local\Android\Sdk\tools
// emulator -avd Pixel_4_XL_API_34 -feature -Vulkan
// emulator -avd Pixel_2_API_34 -feature -Vulkan

// for Cold Boot
// -no-snapshot-load