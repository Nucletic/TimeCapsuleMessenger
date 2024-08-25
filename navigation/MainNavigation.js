import React, { useContext, useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './TabNavigation';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import DeviceInfo from 'react-native-device-info';
import UpdatePopUp from '../components/SmallEssentials/UpdatePopUp';
import AppContext from '../ContextAPI/AppContext';

import { TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4598459833894527/5020971664';

const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['games', 'gaming', 'fashion', 'clothing'],
});



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
        const latestVersion = parseFloat(data.version.split('.').slice(0, 2).join('.'));
        const currentVersion = parseFloat(DeviceInfo.getVersion().split('.').slice(0, 2).join('.'))
        if (latestVersion > currentVersion) {
          setUpToDate(false);
        } else {
          setUpToDate(true);
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
