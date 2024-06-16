import { Pressable, StyleSheet, Text, View, Animated, Image } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Height, Width, width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { encryptData, decryptData } from '../../EncryptData'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const BlockAccountConfirmation = ({ blockSheetOpen, setBlockSheetOpen, CustomUUID, username, profileImage, unBlockUser, notInAccountPage }) => {
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
    outputRange: ['-68%', notInAccountPage ? unBlockUser ? '-12%' : '-8%' : '0%'],
  });
  const OpacityAnimationInterpolate = OpacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    if (blockSheetOpen) {
      startAnimation();
    } else stopAnimation();
  }, [blockSheetOpen])


  const blockUser = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);

      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/blockUser/${CustomUUID}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status == 200) {
        console.log(username, 'blocked');
      }

    } catch (error) {
      console.error(error);
    }
  }

  const Unblock = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);

      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/unblockUser/${CustomUUID}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status == 200) {
        console.log(username, 'unblocked');
      }

    } catch (error) {
      console.error(error);
    }
  }


  return (
    <View style={styles.Container}>
      <Pressable onPress={() => { setBlockSheetOpen(false) }} style={{ pointerEvents: blockSheetOpen ? 'auto' : 'none' }}>
        <Animated.View style={[styles.ContainerCover, { opacity: OpacityAnimationInterpolate }]} />
      </Pressable>
      <Animated.View style={[styles.ContainerMainContent, { bottom: HeightAnimationInterpolate }]}>
        <View style={styles.userInfoView}>
          <Image source={{ uri: profileImage }} style={styles.userInfoProfileImage} />
          {unBlockUser ?
            <>
              <Text style={styles.BlockTitle}>Unblock {username && username}?</Text>
              <Text style={styles.BlockSmallDesc}>This will also block- any other accounts they may have or create in the future.</Text>
            </>
            : <>
              <Text style={styles.BlockTitle}>Block {username && username}?</Text>
              <Text style={styles.BlockSmallDesc}>This will also block any other accounts they may have or create in the future.</Text>
            </>}
        </View>

        <View style={styles.BlockingPointsMainView}>
          <View style={styles.BlockingPointView}>
            <View style={styles.BlockingPointIconView}>
              <Image source={require('../../assets/Icons/BlockedUsersIcon.png')} style={{ height: moderateScale(20), width: moderateScale(20) }} />
            </View>
            {unBlockUser ?
              <Text style={styles.BlockingPointText}>They will be able to message you or find your profile or content on LocBridge.</Text>
              : <Text style={styles.BlockingPointText}>They won't be able to message you or find your profile or content on LocBridge.</Text>}
          </View>
          <View style={styles.BlockingPointView}>
            <View style={styles.BlockingPointIconView}>
              <Image source={require('../../assets/Icons/MuteIcon.png')} style={styles.BlockingPointIcon} />
            </View>
            {unBlockUser ?
              <Text style={styles.BlockingPointText}>They will eventually know that you blocked them.</Text>
              : <Text style={styles.BlockingPointText}>They will eventually know that you blocked them.</Text>}
          </View>
          <View style={styles.BlockingPointView}>
            {!unBlockUser &&
              <>
                <View style={styles.BlockingPointIconView}>
                  <Image source={require('../../assets/Icons/settings.png')} style={styles.BlockingPointIcon} />
                </View>
                <Text style={styles.BlockingPointText}>
                  You can unblock them anytime in {' '}
                  <Text style={{ fontWeight: '700' }}>Settings</Text>
                </Text>
              </>}
          </View>
        </View>
        <View style={styles.BlockButtonView}>
          <Pressable onPress={() => { setBlockSheetOpen(false); if (unBlockUser) { Unblock() } else { blockUser() }; }} style={styles.BlockButton}>
            {unBlockUser ?
              <Text style={styles.BlockButtonText}>Unblock</Text>
              : <Text style={styles.BlockButtonText}>Block</Text>}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

export default BlockAccountConfirmation

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
    height: '68%',
    padding: moderateScale(20),
    alignItems: 'center',
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    gap: moderateScale(30),
  },
  userInfoView: {
    alignItems: 'center',
  },
  userInfoProfileImage: {
    height: moderateScale(100),
    width: moderateScale(100),
    borderRadius: moderateScale(100),
    marginBottom: moderateScale(8),
  },
  BlockTitle: {
    fontWeight: '700',
    fontSize: Height * 0.024,
    color: '#2F3237',
    marginBottom: moderateScale(8),
  },
  BlockSmallDesc: {
    fontSize: Height * 0.016,
    color: '#9095A0',
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  BlockingPointsMainView: {
    gap: moderateScale(16),
    paddingHorizontal: moderateScale(30),
  },
  BlockingPointView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  BlockingPointIconView: {
    height: moderateScale(28),
    width: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  BlockingPointIcon: {
    height: moderateScale(26),
    width: moderateScale(26),
  },
  BlockingPointText: {
    fontSize: Height * 0.016,
    fontWeight: '500',
    color: '#2F3237',
    lineHeight: moderateScale(16),
  },
  BlockButtonView: {
    borderTopWidth: moderateScale(1),
    borderTopColor: '#F0F0F1',
    paddingVertical: moderateScale(12),
  },
  BlockButton: {
    backgroundColor: '#F7706E',
    width: Width - moderateScale(40),
    height: moderateScale(45),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(6),
  },
  BlockButtonText: {
    paddingVertical: moderateScale(12),
    fontSize: Height * 0.02,
    fontWeight: '600',
    color: '#fff',
  },
});