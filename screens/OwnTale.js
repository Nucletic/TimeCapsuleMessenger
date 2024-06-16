import { Animated, Easing, Image, KeyboardAvoidingView, Keyboard, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import {
  Grayscale, sepia, tint, ColorMatrix, concatColorMatrices, invert, contrast, saturate
} from 'react-native-color-matrix-image-filters'
import { Timestamp } from 'firebase/firestore'

import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
import SeenByBottomSheet from '../components/TaleComponents/SeenByBottomSheet'
import ConfirmationPrompt from '../components/SmallEssentials/ConfirmationPrompt'
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const OwnTale = ({ route }) => {

  const navigation = useNavigation();
  const { data } = route.params || [];
  const remainingDuration = useRef(10000);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [talePaused, setTalePaused] = useState(false);
  const [totalImages, setTotalImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likedBy, setLikedBy] = useState(null);
  const [seenBy, setSeenBy] = useState(null);
  const [taleMenuShown, setTaleMenuShown] = useState(false);
  const [deleteTale, setDeleteTale] = useState(false);

  const [seenBySheetOpen, setSeenBySheetOpen] = useState(false);
  const [likedBySheetOpen, setLikedBySheetOpen] = useState(false);

  const taleMenuScaleAnimation = useRef(new Animated.Value(0)).current;
  const taleMenuOpacityAnimation = useRef(new Animated.Value(0)).current;

  const startTaleMenuAnimation = () => {
    Animated.timing(taleMenuScaleAnimation, {
      toValue: 1,
      duration: 100,
      easing: Easing.linear(),
      useNativeDriver: false,
    }).start();
    Animated.timing(taleMenuOpacityAnimation, {
      toValue: 1,
      duration: 100,
      easing: Easing.linear(),
      useNativeDriver: false,
    }).start();
  }

  const stopTaleMenuAnimation = () => {
    Animated.timing(taleMenuScaleAnimation, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear(),
      useNativeDriver: false,
    }).start();
    Animated.timing(taleMenuOpacityAnimation, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear(),
      useNativeDriver: false,
    }).start();
  }

  const startProgressAnimation = () => {
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear(),
      useNativeDriver: false,
    }).start((finished) => {
      if (finished && totalImages) {
        progressAnimation.setValue(0);
        setCurrentImageIndex(currentImageIndex === totalImages.length - 1 ? currentImageIndex : currentImageIndex + 1);
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        progressAnimation.stopAnimation((value) => {
          progressAnimation.setValue(value);
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: progressAnimation.x, dy: progressAnimation.y },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        startProgressAnimation();
      },
    })
  ).current;

  const saveProgress = () => {
    setTalePaused(true);
    progressAnimation.stopAnimation((value) => {
      progressAnimation.setValue(value);
    });
    remainingDuration.current = (1 - progressAnimation.__getValue()) * 10000;
  };

  const resumeProgress = () => {
    setTalePaused(false);
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: remainingDuration.current,
      easing: Easing.linear(),
      useNativeDriver: false,
    }).start();
  };

  const progressAnimationInterpolate = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const taleMenuScaleInterpolate = taleMenuScaleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const taleMenuOpacityInterpolate = taleMenuOpacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    startProgressAnimation();
  }, [totalImages, currentImageIndex]);

  useEffect(() => {
    if (data) {
      const images = [];
      let liked = [];
      let seen = [];

      for (let i = 0; i < data.tale.length; i++) {
        for (let j = 0; j < data.tale[i].images.length; j++) {
          images.push({
            image: data.tale[i].images[j],
            filter: data.tale[i].filters[j],
            caption: data.tale[i].caption,
            createdAt: data.tale[i].createdAt,
            likedBy: data.tale[i].likedBy,
            seenBy: data.tale[i].seenBy,
            timestamp: data.tale[i].createdAt,
          });
        }
        liked = [...liked, ...data.tale[i].likedBy];
        seen = [...seen, ...data.tale[i].seenBy];
      }

      const uniqueLikedBy = liked.filter((value, index, self) =>
        index === self.findIndex((v) => (
          v.userId === value.userId
        ))
      );

      const uniqueSeenBy = seen.filter((value, index, self) =>
        index === self.findIndex((v) => (
          v.userId === value.userId
        ))
      );

      setSeenBy(uniqueSeenBy);
      setLikedBy(uniqueLikedBy);
      setTotalImages([...images]);
    }
  }, [data]);

  const deleteCurrentTale = async () => {
    try {
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch(`http://10.0.2.2:5000/users/UpdateSeenBy`, {
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/deleteCurrentTale`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageURI: totalImages[currentImageIndex].image })
      })
      const data = await response.json();
      if (response.status == 200) {
        console.log('Deleted Current Tale');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

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

  const progressBarRender = () => {
    const progressBars = [];

    if (totalImages) {
      const progressBarWidth = `${100 / totalImages.length - 1}%`;

      totalImages.forEach((tale, index) => {

        progressBars.push(
          <View key={`progress_${index}_${currentImageIndex}`} style={[styles.TaleOuterProgressBar, { width: progressBarWidth }]}>
            <Animated.View style={[styles.TaleInnerProgressBar,
            { width: currentImageIndex === index ? progressAnimationInterpolate : currentImageIndex > index ? '100%' : '0%' }]} />
          </View>
        );
      });
    }
    return progressBars;
  }

  const RenderTaleImage = () => {
    try {
      if (totalImages[currentImageIndex].image) {
        const parsed = totalImages[currentImageIndex].filter;
        return (
          <>
            {parsed.name === 'None' ? (
              <Image source={{ uri: totalImages[currentImageIndex].image }} style={styles.TaleVidImg} />
            ) : parsed.name === 'Grayscale' ? (
              <Grayscale>
                <Image source={{ uri: totalImages[currentImageIndex].image }} style={styles.TaleVidImg} />
              </Grayscale>
            ) : parsed.name === 'Combined' ? (
              <ColorMatrix matrix={concatColorMatrices(sepia(), tint(1.25))}>
                <Image source={{ uri: totalImages[currentImageIndex].image }} style={styles.TaleVidImg} />
              </ColorMatrix>
            ) : parsed.name === 'Matrix' ? (
              <ColorMatrix matrix={concatColorMatrices(saturate(-0.9), contrast(5.2), invert())}>
                <Image source={{ uri: totalImages[currentImageIndex].image }} style={styles.TaleVidImg} />
              </ColorMatrix>
            ) : null}
          </>
        )
      } else {
        // navigation.goBack();
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    if (taleMenuShown) {
      startTaleMenuAnimation();
    } else {
      stopTaleMenuAnimation();
    }
  }, [taleMenuShown])


  return (
    <View style={styles.Tale}>
      {(totalImages && navigation) && RenderTaleImage()}
      {(totalImages && totalImages[currentImageIndex].caption) && <Text style={styles.CaptionText}>{totalImages[currentImageIndex].caption}</Text>}
      <Pressable style={styles.TaleMainContainer} onPress={Keyboard.dismiss} onPressIn={saveProgress} onPressOut={resumeProgress} {...panResponder.panHandlers}>
        <View style={styles.TaleTopContent}>
          <View style={[styles.ProgressBarContainer, { flexDirection: 'row', alignItems: 'center', gap: moderateScale(3) }]}>
            {totalImages && progressBarRender()}
          </View>
          <View style={styles.PlayNameContainer}>
            <View style={styles.NameContainer}>
              <Image source={{ uri: data.profileImage }} style={styles.UserProfilePicture} />
              <Text style={styles.NameText}>{data && data.username}</Text>
              {totalImages && <Text style={styles.TimeAgo}>{formatFirebaseTimestamp(totalImages[currentImageIndex].timestamp)}</Text>}
            </View>
            <View style={styles.PlayContainer}>
              <Pressable style={styles.TalePlayButton}>
                {talePaused ?
                  <Image source={require('../assets/Icons/PlayButton.png')} style={styles.TalePlayButtonImage} />
                  : <Image source={require('../assets/Icons/PauseButton.png')} style={styles.TalePlayButtonImage} />}
              </Pressable>
              <Pressable onPress={() => { navigation.goBack() }} style={styles.TalePlayButton}>
                <Image source={require('../assets/Icons/CrossButton.png')} style={styles.TalePlayButtonImage} />
              </Pressable>
              <Pressable onPress={() => { setTaleMenuShown(!taleMenuShown) }} style={styles.TalePlayButton}>
                <Image source={require('../assets/Icons/WhiteMenu.png')} style={styles.TalePlayButtonImage} />
                <Animated.View style={[styles.TaleMenu, { opacity: taleMenuOpacityInterpolate, transform: [{ scale: taleMenuScaleInterpolate }] }]}>
                  <Pressable onPress={() => { setTaleMenuShown(false); setDeleteTale(true) }} style={styles.TaleMenuDeleteButton}>
                    <Text style={styles.TaleMenuDeleteButtonText}>Delete Tale</Text>
                  </Pressable>
                </Animated.View>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.TaleBottomContent}>
          <Pressable onPress={() => { setSeenBySheetOpen(true) }} style={styles.ByButton}>
            <Image source={require('../assets/Icons/ByArrow.png')} style={styles.ByButtonArrowIcon} />
            <Image source={require('../assets/Icons/SeenBy.png')} style={styles.ByButtonIcon} />
          </Pressable>
          <Pressable onPress={() => { setLikedBySheetOpen(true) }} style={styles.ByButton}>
            <Image source={require('../assets/Icons/ByArrow.png')} style={styles.ByButtonArrowIcon} />
            <Image source={require('../assets/Icons/LikedBy.png')} style={[styles.ByButtonIcon, { width: moderateScale(25), height: moderateScale(22), }]} />
          </Pressable>

        </View>
      </Pressable>
      <Pressable onPress={() => {
        progressAnimation.setValue(0);
        setCurrentImageIndex(currentImageIndex === 0 ? 0 : currentImageIndex - 1)
      }}
        style={[styles.nextPreviousTaleButton, { top: 0, left: 0, }]} />
      <Pressable onPress={() => {
        progressAnimation.setValue(0);
        setCurrentImageIndex(currentImageIndex === totalImages.length - 1 ? currentImageIndex : currentImageIndex + 1)
      }}
        style={[styles.nextPreviousTaleButton, { top: 0, left: '76%', }]} />
      <SeenByBottomSheet byType={'Seen By'} ByData={seenBy} settingSheetOpen={seenBySheetOpen} setSettingSheetOpen={setSeenBySheetOpen} />
      <SeenByBottomSheet byType={'Liked By'} ByData={likedBy} settingSheetOpen={likedBySheetOpen} setSettingSheetOpen={setLikedBySheetOpen} />
      <ConfirmationPrompt showConfirmationPrompt={deleteTale} TitleText={'Delete Current Tale?'} OneText={'Cancel'} TwoText={'Delete'}
        onPressOne={() => { setDeleteTale(false); }} onPressTwo={() => { setDeleteTale(false); deleteCurrentTale() }} />
    </View>
  )
}


export default OwnTale

const styles = StyleSheet.create({
  Tale: {
    backgroundColor: '#000',
  },
  CaptionText: {
    position: 'absolute',
    backgroundColor: "#00000066",
    color: '#fff',
    width: '100%',
    bottom: '20%',
    textAlign: 'center',
    fontSize: 0.02 * Height,
    fontWeight: '500',
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(4),
  },
  nextPreviousTaleButton: {
    marginTop: moderateScale(100),
    height: Height - moderateScale(200),
    width: moderateScale(90),
    position: 'absolute',
  },
  TaleVidImg: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  TaleMainContainer: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(15),
    position: 'absolute',
    width: '100%',
    justifyContent: 'space-between',
    height: '100%',
  },
  TaleTopContent: {
    width: Width - moderateScale(32),
  },
  ProgressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  LikeHeartAnimationView: {
    position: 'absolute',
    height: Height,
    width: Width,
    backgroundColor: '#F7706E',
  },
  TaleOuterProgressBar: {
    backgroundColor: '#A4A4A4',
    width: '10%',
    height: moderateScale(4),
    borderRadius: moderateScale(50),
  },
  TaleInnerProgressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(50),
  },
  PlayNameContainer: {
    marginTop: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  NameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  UserProfilePicture: {
    height: moderateScale(35),
    width: moderateScale(35),
    borderRadius: moderateScale(50),
  },
  NameText: {
    fontSize: Height * 0.018,
    color: '#fff',
    fontWeight: '500',
  },
  TimeAgo: {
    fontSize: Height * 0.016,
    color: '#9095A0',
    fontWeight: '600',
  },
  PlayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  TalePlayButton: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  TalePlayButtonImage: {
    height: '100%',
    width: '100%',
  },
  TaleBottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ReplyContainer: {
    height: moderateScale(40),
    width: '75%',
    borderWidth: moderateScale(2),
    borderColor: '#A4A4A4',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(50),
  },
  ReplyInput: {
    color: '#fff',
    height: '100%',
    width: '98%',
  },
  LikeButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  LikeButtonImage: {
    height: '100%',
    width: '100%',
  },
  SendButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  SendButtonImage: {
    height: '100%',
    width: '100%',
  },
  ByButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(48),
    height: moderateScale(48),
  },
  ByButtonArrowIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  ByButtonIcon: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  TaleMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: moderateScale(90),
    top: '120%',
    left: '-340%',
    borderRadius: moderateScale(4),
  },
  TaleMenuDeleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
  },
  TaleMenuDeleteButtonText: {
    fontSize: Height * 0.018,
    color: '#F23051',
  },

});