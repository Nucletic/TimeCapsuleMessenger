import { Pressable, Image, StyleSheet, Text, View, ScrollView, TextInput, Animated, ToastAndroid } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import { encryptData, decryptData } from '../EncryptData'
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'
import { collection, doc, getDoc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../ContextAPI/AppContext'
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';



const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4598459833894527/3814260842';

const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['games', 'gaming', 'fashion', 'clothing'],
});

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/4663579130';


const Subscribe = ({ navigation }) => {

  const [loaded, setLoaded] = useState(false);
  const [CustomUUID, setCustomUUID] = useState(null);
  const [alreadyMember, setAlreadyMember] = useState(null);
  const [watchedAds, setWatchedAds] = useState(0);
  const { setShowAds, showAds } = useContext(AppContext);

  

  AsyncStorage.getItem('CustomUUID').then((CustomUUID) => {
    setCustomUUID(CustomUUID);
  });

  const usersCollection = collection(FIREBASE_DB, 'users');
  const q = query(usersCollection, where('userId', "==", CustomUUID));

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });
    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );
    rewarded.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, [loaded]);


  const showToast = () => {
    ToastAndroid.show(
      "Ad unavailable at the moment.",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    )
  }

  const onWatchAdPress = () => {
    if (loaded) {
      setLoaded(false);
      rewarded.show();
      increaseAdSeenCount();
    } else {
      showToast()
    }
  }


  useEffect(() => {
    if (CustomUUID) {
      getAdCount()
    }
  }, [CustomUUID]);



  const getAdCount = async () => {
    const usersCollection = collection(FIREBASE_DB, 'users');
    const q = query(usersCollection, where('userId', "==", CustomUUID));
    const querySnapshot = await getDocs(q);

    let watchedAdsCount = null;
    querySnapshot.forEach(async (docSnapshot) => {
      const data = docSnapshot.data();
      if (data.watchedAds === 15) {
        setAlreadyMember(true);
        setShowAds(true);
      }
      watchedAdsCount = data.watchedAds || 0;
      setWatchedAds(watchedAdsCount)
    });

  }
  const increaseAdSeenCount = async () => {
    try {
      const usersCollection = collection(FIREBASE_DB, 'users');
      const q = query(usersCollection, where('userId', "==", CustomUUID));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        await updateDoc(docSnapshot.ref, {
          watchedAds: increment(1)
        });
        await getAdCount();
      });
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <View style={styles.Container}>
      <View style={styles.SettingsPrivacyNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <Text style={styles.PageTitle}>Subscribe</Text>
      </View>
      <ScrollView style={styles.MainContent}>
        <View style={styles.locationEnableSwitch}>
          <View style={styles.locationEnableTop}>
            {alreadyMember ?
              <Text style={styles.LocationSwitchTitle}>You are Already a Member</Text>
              : <Text style={styles.LocationSwitchTitle}>Watch Ad {watchedAds}/15</Text>}
            {!alreadyMember &&
              <Pressable style={styles.WatchAdButton} onPress={onWatchAdPress}>
                <Image source={require('../assets/Icons/AudioPlayButton.png')} style={styles.WatchAdIcon} />
              </Pressable>}
          </View>

          <Text style={styles.LocationPrecautionText}>
            Watch 15 Ads and go Ad FREE for a total of 30 Days, sometimes ads might be unavailable,
            so come back and check in frequently to get your free subscription.
          </Text>
        </View>
      </ScrollView>
      {(!showAds || showAds === false) &&
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />}
    </View>
  )
}

export default Subscribe

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  SettingsPrivacyNav: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
    gap: moderateScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
  PageTitle: {
    fontSize: Height * 0.026,
    fontWeight: '900',
    color: '#1C170D',
    fontFamily: 'PlusJakartaSans',
  },
  MainContent: {
    padding: moderateScale(16),
    gap: moderateScale(21),
  },
  locationEnableTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  LocationSwitchTitle: {
    fontSize: Height * 0.020,
    fontWeight: '700',
    color: '#1C170D',
    fontFamily: 'PlusJakartaSans',
  },
  LocationPrecautionText: {
    fontSize: Height * 0.014,
    marginTop: moderateScale(8),
    lineHeight: Height * 0.019,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  LocationSwitchOuter: {
    borderWidth: moderateScale(2),
    borderColor: '#c3c3c3',
    height: moderateScale(24),
    width: moderateScale(40),
    borderRadius: moderateScale(100),
    justifyContent: 'center',
    padding: 2,
  },
  LocationSwitchInner: {
    height: moderateScale(16),
    width: moderateScale(16),
    borderRadius: moderateScale(100),
    backgroundColor: '#c3c3c3',
  },
  WatchAdIcon: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
});