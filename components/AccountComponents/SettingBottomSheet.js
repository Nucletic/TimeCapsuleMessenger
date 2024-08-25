import { Pressable, StyleSheet, Text, View, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { encryptData, decryptData } from '../../EncryptData'
import ConfirmationPrompt from '../SmallEssentials/ConfirmationPrompt'
import AsyncStorage from '@react-native-async-storage/async-storage'


import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const SettingBottomSheet = ({ settingSheetOpen, setSettingSheetOpen, setBlockSheetOpen, CustomUUID, Blocked, ChatId, notInAccountPage }) => {

  const navigation = useNavigation();
  const HeightAnimation = useRef(new Animated.Value(0)).current;
  const OpacityAnimation = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    Animated.timing(HeightAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(OpacityAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }

  const stopAnimation = () => {
    Animated.timing(HeightAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(OpacityAnimation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }

  const HeightAnimationInterpolate = HeightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${moderateScale(Height * 0.035)}%`, notInAccountPage ? `-${moderateScale(Height * 0.017)}%` : CustomUUID ? `-${moderateScale(Height * 0.012)}%` : `-${moderateScale(Height * 0.012)}%`],
  });
  const OpacityAnimationInterpolate = OpacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    if (settingSheetOpen) {
      startAnimation();
    } else stopAnimation();
  }, [settingSheetOpen])


  const [showLogOutPrompt, setShowLogOutPrompt] = useState(false);


  const logOut = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      // const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      // const parsedCustomUUID = JSON.parse(CustomUUID);
      // const cacheProfile = await AsyncStorage.removeItem(parsedCustomUUID);
      await AsyncStorage.removeItem('CustomUUID');

    } catch (error) {
      throw new Error(error)
    }
  }

  const removeChatmate = async () => {
    try {
      const senderUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/removeChatmate/${senderUUID}/${CustomUUID}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status === 200) {

      }
    } catch (error) {
      throw new Error(error);
    }
  }



  return (
    <View style={styles.Container}>
      <Pressable onPress={() => { setSettingSheetOpen(false) }} style={{ pointerEvents: settingSheetOpen ? 'auto' : 'none' }}>
        <Animated.View style={[styles.ContainerCover, { opacity: OpacityAnimationInterpolate }]} />
      </Pressable>
      <Animated.View style={[styles.ContainerMainContent, { bottom: HeightAnimationInterpolate }]}>
        {CustomUUID ?
          (<>
            {Blocked ?
              <Pressable onPress={() => { setSettingSheetOpen(false); setBlockSheetOpen(true) }} style={styles.SettingsButton}>
                <Text style={[styles.SettingsButtonText, { color: '#2278FF', }]}>Unblock...</Text>
              </Pressable>
              : <Pressable onPress={() => { setSettingSheetOpen(false); setBlockSheetOpen(true) }} style={styles.SettingsButton}>
                <Text style={[styles.SettingsButtonText, { color: '#A1824A' }]}>Block...</Text>
              </Pressable>}
            {ChatId ?
              <Pressable onPress={() => { setSettingSheetOpen(false) }} style={styles.SettingsButton}>
                <Text style={styles.SettingsButtonText}>Mute</Text>
              </Pressable>
              : <Pressable onPress={() => { removeChatmate(); setSettingSheetOpen(false) }} style={styles.SettingsButton}>
                <Text style={styles.SettingsButtonText}>Remove Chatmate</Text>
              </Pressable>
            }
          </>)
          : (<>
            <Pressable onPress={() => { setSettingSheetOpen(false); navigation.navigate('SettingsPrivacy') }} style={styles.SettingsButton}>
              <Text style={styles.SettingsButtonText}>Settings</Text>
            </Pressable>
            {/* <Pressable style={styles.AddAccountButton}>
              <Text style={styles.AddAccountButtonText}>Add Account</Text>
            </Pressable>
            <Pressable style={styles.SwitchAccountsButton}>
              <Text style={styles.SwitchAccountsButtonText}>Switch Accounts</Text>
            </Pressable> */}
            <Pressable onPress={() => { setShowLogOutPrompt(true) }} style={styles.LogOutButton}>
              <Text style={styles.LogOutButtonText}>Log Out</Text>
            </Pressable>
          </>)}
      </Animated.View>
      <ConfirmationPrompt showConfirmationPrompt={showLogOutPrompt} TitleText={'Log Out of your Account ?'}
        onPressOne={() => { setShowLogOutPrompt(false); }} onPressTwo={() => { setShowLogOutPrompt(false); logOut() }} OneText={'Cancel'} TwoText={'Log Out'} />
    </View>
  )
}

export default SettingBottomSheet

const styles = StyleSheet.create({
  Container: {
    height: Height,
    width: Width,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ContainerCover: {
    backgroundColor: '#00000099',
    height: '100%',
    width: '100%',
  },
  ContainerMainContent: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    height: '35%',
    padding: moderateScale(16),
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    gap: moderateScale(30),
  },
  SettingsButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '500',
    color: '#1b160b',
  },
  AddAccountButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '500',
    color: '#2278FF',
  },
  SwitchAccountsButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '500',
    color: '#2278FF',
  },
  LogOutButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '500',
    color: '#F23051',
  }
});