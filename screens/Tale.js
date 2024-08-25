import { Animated, Easing, Image, KeyboardAvoidingView, Keyboard, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import {
  Grayscale, sepia, tint, ColorMatrix, concatColorMatrices, invert, contrast, saturate
} from 'react-native-color-matrix-image-filters'
import { collection, doc, getDoc, getDocs, Timestamp, setDoc, addDoc, updateDoc, serverTimestamp, query, where, writeBatch } from 'firebase/firestore';

import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const Tale = ({ route }) => {

  const navigation = useNavigation();
  const { data } = route.params || [];
  const remainingDuration = useRef(10000);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const LikedAnimation = useRef(new Animated.Value(0)).current;
  const [talePaused, setTalePaused] = useState(false);
  const [taleLiked, setTaleLiked] = useState(false);
  const [reply, setReply] = useState('');
  const [totalImages, setTotalImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const startLikedAnimation = () => {
    const likedAnimationSequence = Animated.sequence([
      Animated.timing(LikedAnimation, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.delay(60),
      Animated.timing(LikedAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]);
    likedAnimationSequence.start();
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

  const LikedAnimationInterpolate = LikedAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  })

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        progressAnimation.stopAnimation((value) => {
          progressAnimation.setValue(value);
        });
        saveProgress();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        resumeProgress();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    startProgressAnimation();
  }, [totalImages, currentImageIndex]);

  useEffect(() => {
    if (data) {
      const images = [];
      for (let i = 0; i < data.tale.length; i++) {
        for (let j = 0; j < data.tale[i].images.length; j++) {
          images.push({
            image: data.tale[i].images[j],
            filter: data.tale[i].filters[j],
            caption: data.tale[i].caption,
            createdAt: data.tale[i].createdAt,
            likedBy: data.tale[i].likedBy,
            seenBy: data.tale[i].seenBy,
          })
        }
      }
      setTotalImages([...images]);
    }
  }, [data]);

  const sendReply = async () => {
    try {
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      if (reply.length > 0 && CustomUUID) {
        setReply('');

        const timestamp = Date.now();
        const messageId = `${timestamp}_${CustomUUID}`;

        const newMessage = {
          messageId: messageId,
          content: reply,
          senderId: CustomUUID,
          receiverId: data.userId,
          timestamp: Timestamp.now(),
          soundLevels: [],
          audioDuration: '00:00',
          readStatus: 'unread',
          messageType: 'TaleReply',
          metadata: {
            attachments: [],
            reactions: [],
          }
        };

        const senderId = CustomUUID;
        const receiverId = data.userId;

        const chatDocId1 = `${senderId}_${receiverId}`;
        const chatDocId2 = `${receiverId}_${senderId}`;

        let chatRef = doc(FIREBASE_DB, 'chats', chatDocId1);
        let chatSnapshot = await getDoc(chatRef);

        if (!chatSnapshot.exists()) {
          chatRef = doc(FIREBASE_DB, 'chats', chatDocId2);
          chatSnapshot = await getDoc(chatRef);

          if (!chatSnapshot.exists()) {
            await setDoc(chatRef, {
              chatId: chatDocId1,
              participants: [senderId, receiverId],
              unreadCount: 0,
              createdAt: serverTimestamp(),
              lastMessage: newMessage,
            });
          }
        }

        const messagesRef = collection(chatRef, 'messages');
        await addDoc(messagesRef, newMessage);

        await updateDoc(chatRef, { lastMessage: newMessage });
        sendMobileNotification('TALE_REPLY', data.ExpoPushToken, data.profileImage, data.username);
      }
    } catch (error) {
      throw new Error(error);
    }
  }



  const sendMobileNotification = async (Type, ExpoPushToken, profileImage, username) => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/sendNotification`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Type, ExpoPushToken, profileImage, username })
      })
      const data = await response.json();
      if (response.status === 200) {
        console.log('notification sent')
      }
    } catch (error) {
      throw new Error(error);
    }
  }







  const LikeTale = async () => {
    try {
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');

      const userQuerySnapshot = await getDocs(query(collection(FIREBASE_DB, 'users'), where('userId', '==', data.userId)));
      const likerQuerySnapshot = await getDocs(query(collection(FIREBASE_DB, 'users'), where('userId', '==', CustomUUID)));
      const batch = writeBatch(FIREBASE_DB);

      userQuerySnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const likerDataSnapshot = likerQuerySnapshot.docs[0];
        const likerData = likerDataSnapshot.data();
        const updatedTale = userData.tale.map((tale) => {
          if (!tale.likedBy || !tale.likedBy.includes(CustomUUID)) {
            return {
              ...tale,
              likedBy: [...(tale.likedBy || []), {
                profileImage: likerData.profileImage || null,
                username: likerData.username,
                userId: CustomUUID,
                timestamp: new Date(),
              }],
            };
          } else {
            return tale;
          }
        });

        const userRef = doc(FIREBASE_DB, 'users', userDoc.id);
        batch.update(userRef, { tale: updatedTale });
      });

      await batch.commit();
      sendMobileNotification('TALE_LIKED', data.ExpoPushToken, data.profileImage, data.username);

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

  const UpdateSeenBy = async (ShowerUUID) => {
    try {
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/UpdateSeenBy`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ WatcherUUID: CustomUUID, ShowerUUID: ShowerUUID })
      })
      const data = await response.json();
      if (response.status == 200) {
        console.log('updatedSeenBy');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  useEffect(() => {
    if (data.userId) {
      UpdateSeenBy(data.userId);
    }
  }, [data])

  useEffect(() => {
    if (data.userId && taleLiked) {
      LikeTale();
    }
  }, [data, taleLiked])



  return (
    <View style={styles.Tale}>
      {(totalImages && navigation) && RenderTaleImage()}
      {(totalImages && totalImages[currentImageIndex].caption) && <Text style={styles.CaptionText}>{totalImages[currentImageIndex].caption}</Text>}
      <Pressable style={styles.TaleMainContainer} onPress={Keyboard.dismiss} onPressIn={saveProgress} onPressOut={resumeProgress} {...panResponder.panHandlers}>
        <Animated.View style={[styles.LikeHeartAnimationView, { opacity: LikedAnimationInterpolate }]} />
        <View style={styles.TaleTopContent}>
          <View style={[styles.ProgressBarContainer, { flexDirection: 'row', alignItems: 'center', gap: moderateScale(3) }]}>
            {totalImages && progressBarRender()}
          </View>
          <View style={styles.PlayNameContainer}>
            <View style={styles.NameContainer}>
              <Image source={{ uri: data.profileImage }} style={styles.UserProfilePicture} />
              <Text style={styles.NameText}>{data && data.username}</Text>
              {(totalImages && totalImages[currentImageIndex] && totalImages[currentImageIndex].timestamp)
                && <Text style={styles.TimeAgo}>{formatFirebaseTimestamp(totalImages[currentImageIndex].timestamp)}</Text>}
            </View>
            <View style={styles.PlayContainer}>
              <Pressable style={styles.TalePlayButton}>
                {talePaused ?
                  <Image source={require('../assets/Icons/PlayButton.png')} style={styles.TalePlayButtonImage} />
                  : <Image source={require('../assets/Icons/PauseButton.png')} style={styles.TalePlayButtonImage} />}
              </Pressable>
            </View>
          </View>
        </View>
        <KeyboardAvoidingView behavior='height'>
          <View style={styles.TaleBottomContent}>
            <View style={styles.ReplyContainer}>
              <TextInput style={styles.ReplyInput} value={reply} onChangeText={setReply} placeholder={`Reply to ${data && data.username}...`} placeholderTextColor='#A4A4A4' />
            </View>
            <Pressable onPress={() => { startLikedAnimation(); setTaleLiked(true) }} style={styles.LikeButton}>
              {taleLiked ?
                <Image source={require('../assets/Icons/Liked.png')} style={styles.LikeButtonImage} />
                : <Image source={require('../assets/Icons/LikeButton.png')} style={styles.LikeButtonImage} />}
            </Pressable>
            <Pressable onPress={() => { sendReply() }} style={styles.SendButton}>
              <Image source={require('../assets/Icons/SendButton.png')} style={styles.SendButtonImage} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
    </View>
  )
}

export default Tale;

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
    gap: moderateScale(16),
  },
  TalePlayButton: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  TaleMuteButton: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  TalePlayButtonImage: {
    height: '100%',
    width: '100%',
  },
  TaleMuteButtonImage: {
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
  }
});