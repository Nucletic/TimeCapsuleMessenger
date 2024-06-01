import { Pressable, StyleSheet, Text, View, Animated, FlatList, Image } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Height, Width, width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import ConfirmationPrompt from '../SmallEssentials/ConfirmationPrompt'
import AsyncStorage from '@react-native-async-storage/async-storage'


const SeenByBottomSheet = ({ ByData, settingSheetOpen, setSettingSheetOpen, byType }) => {

  const navigation = useNavigation();
  const HeightAnimation = useRef(new Animated.Value(0)).current;
  const OpacityAnimation = useRef(new Animated.Value(0)).current;

  function formatFirebaseTimestamp(timestamp) {
    const seconds = timestamp.seconds || timestamp._seconds;
    const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const currentDate = new Date();
    const currentTime = currentDate.getTime();
    const difference = currentTime - milliseconds;

    const secondsDifference = Math.floor(difference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);
    const weeksDifference = Math.floor(daysDifference / 7);

    if (secondsDifference < 60 * 60) {
      return `${Math.floor(secondsDifference / 60)}m ago`;
    }
    else if (hoursDifference < 24) {
      return `${hoursDifference}h ago`;
    }
    else if (daysDifference < 7) {
      return `${daysDifference}d ago`;
    }
    else if (weeksDifference < 4) {
      return `${weeksDifference}w ago`;
    }
    else {
      return `${Math.floor(daysDifference / 7)}w ago`;
    }
  }

  const startAnimation = () => {
    Animated.timing(HeightAnimation, {
      toValue: 1,
      duration: 160,
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
      duration: 160,
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
    outputRange: ['-50%', '0%'],
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

  return (
    <View style={styles.Container}>
      <Pressable onPress={() => { console.log('first'); setSettingSheetOpen(false) }} style={{ pointerEvents: settingSheetOpen ? 'auto' : 'none' }}>
        <Animated.View style={[styles.ContainerCover, { opacity: OpacityAnimationInterpolate }]} />
      </Pressable>
      <Animated.View style={[styles.ContainerMainContent, { bottom: HeightAnimationInterpolate }]}>
        <Text style={styles.ByTitle}>{`${byType} ${ByData ? ByData.length : 0}`}</Text>
        {(ByData) &&
          <FlatList contentContainerStyle={styles.byList} data={ByData} renderItem={({ item, index }) => {
            return (
              <Pressable key={index} onPress={() => {
                setSettingSheetOpen(false); navigation.navigate('SearchStack',
                  {
                    screen: 'Account',
                    params: {
                      CustomUUID: item.userId,
                    }
                  })
              }} style={styles.profileButton}>
                <View style={styles.ProfileInfoView}>
                  <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                  <Text style={styles.profileButtonText}>{item.username}</Text>
                </View>
                <Text style={styles.byTimestamp}>{formatFirebaseTimestamp(item.timestamp)}</Text>
              </Pressable>
            )
          }} />}
      </Animated.View>
    </View>
  )
}

export default SeenByBottomSheet


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
    height: '50%',
    padding: moderateScale(16),
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    gap: moderateScale(30),
  },
  ByTitle: {
    color: '#49505B',
    fontWeight: '600',
    fontSize: 0.022 * Height,
    marginBottom: moderateScale(-16),
  },
  profileButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(16),
  },
  ProfileInfoView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(16),
  },
  profileImage: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(24),
  },
  profileButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '500',
    color: '#49505B',
  },
  byList: {
    gap: moderateScale(10),
    alignItems: 'flex-start',
  },
  byTimestamp: {
    color: '#C3C3C3',
    fontSize: Height * 0.015,
    fontWeight: '500',
  },
});