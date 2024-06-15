import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './TabNavigation';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import DeviceInfo from 'react-native-device-info';
import UpdatePopUp from '../components/SmallEssentials/UpdatePopUp';

const MainNavigation = () => {


  const [upToDate, setUpToDate] = useState(true);


  useEffect(() => {
    checkAppUpdate();
  }, [])


  const checkAppUpdate = async () => {
    try {
      const docRef = doc(FIREBASE_DB, 'versions', 'dWqsS2bBqCUFCTzu65rl')
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.version === String(DeviceInfo.getVersion())) {
          setUpToDate(true);
        } else {
          setUpToDate(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {upToDate ?
        (<NavigationContainer>
          <TabNavigation />
        </NavigationContainer>)
        : (upToDate === false && <UpdatePopUp />)}
    </>
  )
}

export default MainNavigation;
