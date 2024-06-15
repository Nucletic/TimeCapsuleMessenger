import { Pressable, Image, StyleSheet, Text, View, ScrollView, TextInput, Animated } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import { encryptData, decryptData } from '../EncryptData'
import { FIREBASE_AUTH } from '../firebaseConfig'


import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AppContext from '../ContextAPI/AppContext'

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/1975621483';


const AccountPrivacy = ({ navigation }) => {

  const { showAds } = useContext(AppContext);

  const [privateAccount, setPrivateAccount] = useState(null);

  const switchAnimation = useRef(new Animated.Value(0)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    Animated.timing(switchAnimation, {
      toValue: 1,
      duration: 120,
      useNativeDriver: false,
    }).start();
    Animated.timing(colorAnimation, {
      toValue: 1,
      duration: 120,
      useNativeDriver: false,
    }).start();
  }
  const stopAnimation = () => {
    Animated.timing(switchAnimation, {
      toValue: 0,
      duration: 120,
      useNativeDriver: false,
    }).start();
    Animated.timing(colorAnimation, {
      toValue: 0,
      duration: 120,
      useNativeDriver: false,
    }).start();
  }

  const switchAnimationInterpolate = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  })
  const colorAnimationInterpolate = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#c3c3c3', '#2278FF'],
  })

  useEffect(() => {
    if (privateAccount) {
      startAnimation()
    } else stopAnimation();
  }, [privateAccount]);


  const checkAccountPrivacy = async () => {
    const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
    const encryptedIdToken = encryptData(idToken, SECRET_KEY);
    const response = await fetch(`http://192.168.29.8:5000/users/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': 'Bearer ' + encryptedIdToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json();

    if (data.user.privateAccount) {
      setPrivateAccount(true);
    } else setPrivateAccount(false);
  }

  const changeAccountPrivacy = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);

      const response = await fetch('http://192.168.29.8:5000/users/AccountPrivacy', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privateAccount: privateAccount })
      })
      const data = await response.json();
      if (response.status === 200) {
        console.log('Changed Account Privacy');
      }

    } catch (error) {
      throw new Error(error);
    }
  }

  useEffect(() => {
    if (privateAccount != null) {
      changeAccountPrivacy();
    }
  }, [privateAccount])

  useEffect(() => {
    checkAccountPrivacy();
  }, [])


  return (
    <View style={styles.Container}>
      <View style={styles.SettingsPrivacyNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <Text style={styles.PageTitle}>Account Privacy</Text>
      </View>
      <ScrollView style={styles.MainContent}>
        <View style={styles.locationEnableSwitch}>
          <View style={styles.locationEnableTop}>
            <Text style={styles.LocationSwitchTitle}>Private Account</Text>
            <Pressable onPress={() => { setPrivateAccount(!privateAccount) }} style={styles.LocationSwitchButton}>
              <Animated.View style={[styles.LocationSwitchOuter, { borderColor: colorAnimationInterpolate }]}>
                <Animated.View style={[styles.LocationSwitchInner, { backgroundColor: colorAnimationInterpolate, left: switchAnimationInterpolate }]} />
              </Animated.View>
            </Pressable>
          </View>
          <Text style={styles.LocationPrecautionText}>
            When your account is public, your profile and posts can be seen by anyone, on or off
            LocBridge, even if they don't have an LocBridge account.
          </Text>
          <Text style={styles.LocationPrecautionText}>
            When your account is private, your profile won't be shown to anyone, and won't be
            recommended anymore, only your chatmates,  and people you add as chatmate can
            see your profile
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

export default AccountPrivacy

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
    color: '#49505B',
    fontWeight: '900',
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
    color: '#49505B',
    fontWeight: '600',
  },
  LocationPrecautionText: {
    fontSize: Height * 0.014,
    color: '#C3C3C3',
    marginTop: moderateScale(8),
    lineHeight: Height * 0.019,
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
});