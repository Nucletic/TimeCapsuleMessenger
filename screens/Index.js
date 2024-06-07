import React, { useState, useEffect, useContext } from 'react'
import MainNavigation from '../navigation/MainNavigation'
import Registration from './Registration'
import * as WebBrowser from "expo-web-browser";
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

import Constants from 'expo-constants';
import { arrayRemove, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import AppContext from '../ContextAPI/AppContext';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const Index = () => {

  const { setShowAds, showAds } = useContext(AppContext)

  WebBrowser.maybeCompleteAuthSession();

  const [loading, setLoading] = useState(true);
  const [LoggedIn, setLoggedIn] = useState(null);


  const checkLogin = async () => {
    setLoading(true);
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          if (user.emailVerified) {
            setLoggedIn(true);
            setLoading(false);
            await updateActivityStatus(user.uid);
            checkMember(user.uid);
            deleteTimedOutTale(user.uid);
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




  const deleteTimedOutTale = async (uid) => {
    try {
      const docRef = doc(FIREBASE_DB, 'users', uid)
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tale) {
          const talesToRemove = data.tale.filter(tale => timeOutTimestamp24h(tale.createdAt));
          for (const tale of talesToRemove) {
            await updateDoc(docRef, {
              tale: arrayRemove(tale)
            });
            console.log('deleted')
          }
        }
      }
    } catch (error) {
      console.log("Error Deleting Outdated Tale", error);
    }
  }

  const timeOutTimestamp24h = (timestamp) => {
    const timestampDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const now = new Date();
    const differenceInMillis = now - timestampDate;
    const differenceInHours = differenceInMillis / (1000 * 60 * 60);
    return differenceInHours >= 24;
  };


  const updateActivityStatus = async (uid) => {
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