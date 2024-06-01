import { Pressable, StyleSheet, Text, View, Image, TextInput, ScrollView, FlatList, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import { Audio } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import { FIREBASE_DB, FIREBASE_STORAGE } from '../firebaseConfig'
import { collection, doc, getDoc, onSnapshot, updateDoc, arrayUnion, increment, Timestamp, query, where, getDocs, addDoc, deleteDoc, orderBy, startAfter, limit, endBefore } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import SettingBottomSheet from '../components/AccountComponents/SettingBottomSheet'
import BlockAccountConfirmation from '../components/AccountComponents/BlockAccountConfirmation'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'


const Chatbox = ({ navigation, route }) => {

  const [recording, setRecording] = useState(null);
  const [recordedURI, setRecordedURI] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [soundLevels, setSoundLevels] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState('00:00');
  const [sound, setSound] = useState(null);
  const [playingSound, setPlayingSound] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [showEmojiBoard, setShowEmojiBoard] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(null);
  const [CustomUUID, setCustomUUID] = useState(null);
  const [TimeTextAnimationCompleted, setTimeTextAnimationCompleted] = useState(false);
  const [activityStatus, setActivityStatus] = useState(onlineStatus ? onlineStatus : 'inactive');
  const [lastActive, setLastActive] = useState(null);
  const [chatSettingSheetOpen, setChatSettingSheetOpen] = useState(false);
  const [blockSheetOpen, setBlockSheetOpen] = useState(false);
  const [blockedFromOurSide, setBlockedFromOurSide] = useState(blockedFromOur);
  const [blockedFromOtherSide, setBlockedFromOtherSide] = useState(blockedFromOther);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState([]);

  const scrollViewRef = useRef(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);


  AsyncStorage.getItem('CustomUUID').then((CustomUUID) => {
    setCustomUUID(CustomUUID);
  });

  const { chatId, username, profileImage, blockedFromOther, blockedFromOur, onlineStatus, lastOnline } = route.params;

  const audioTimeAnimation = useRef(new Animated.Value(0)).current;
  const audioBinAnimation = useRef(new Animated.Value(0)).current;

  const startAudioTimeAnimation = () => {
    Animated.timing(audioTimeAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const stopAudioTimeAnimation = () => {
    Animated.timing(audioTimeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setTimeTextAnimationCompleted(true);
    });
  };

  const audioTimeAnimationInterpolate = audioTimeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [moderateScale(0), Width - moderateScale(110)],
  });

  const startRecording = async () => {
    try {
      setIsRecording(true);
      startAudioTimeAnimation();
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
          onRecordingStatusUpdate
        );
        setRecording(recording);
        setIsRecording(true);
        setRecordedURI(recording.getURI());
      } else {
        console.log('No Permission Granted');
      }
    } catch (error) { }
  };

  const stopRecording = async () => {
    stopAudioTimeAnimation();
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
  };

  const onRecordingStatusUpdate = (status) => {
    if (status.isRecording && status.canRecord) {
      setSoundLevels(prevLevels => [...prevLevels, status.metering]);
      setRecordingDuration(status.durationMillis);

      // Update UI or trigger sound bars animation
      // You can use soundLevels array to adjust the height of bars representing sound levels
    }
  };

  const getDurationFormatted = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const loadSound = async (URI) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: URI }
    );
    setSound(sound);
  };

  const playSound = async (URI) => {
    try {
      if (!sound) {
        await loadSound(URI);
      }
      if (sound) {
        await sound.playAsync();
        setPlayingSound(true);
      }
    } catch (error) {
      console.error('Error playing sound:', error.message);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        setPlayingSound(false);
        await sound.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping sound:', error.message);
    }
  };

  // Image Picker Code

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setAttachedImages([...attachedImages, result.assets[0].uri]);
      }
    }
  };

  const deleteImage = (index) => {
    let updatedImages = attachedImages;
    updatedImages.splice(index, 1);
    setAttachedImages([...updatedImages]);
  };


  const fetchMessages = async (chatId) => {
    if (chatId) {
      const messagesRef = collection(FIREBASE_DB, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(20));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push(doc.data());
        });
        setMessages(messages.reverse());
      });
      console.log(messages);

      return () => unsubscribe();
    }
  };


  const loadMoreMessages = async (limitAmount = 20) => {
    if (chatId && messages) {
      const messagesRef = collection(FIREBASE_DB, 'chats', chatId, 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'asc'),
        endBefore(messages[0].timestamp),
        limit(limitAmount)
      );


      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = [];
        snapshot.forEach((doc) => {
          const messageData = doc.data();
          if (!messages.some(message => message.messageId === messageData.messageId)) {
            newMessages.push(messageData);
          }
        });
        setMessages((prevMessages) => [...newMessages, ...prevMessages]);
      });

      return () => unsubscribe();
    }
  };






  const sendMessage = async () => {
    try {
      let attachments = [];
      if ((message.length > 0 || attachedImages.length > 0) && CustomUUID) {
        setMessage('');

        if (attachedImages.length > 0) {

          setUploadingImages([...attachedImages]);
          const uploadTasks = [];

          for (let i = 0; i < attachedImages.length; i++) {
            const image = attachedImages[i];

            const response = await fetch(image);
            const blob = await response.blob();

            const storageRef = ref(FIREBASE_STORAGE, `${chatId}/images/${Date.now()}_${i}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);
            uploadTasks.push(uploadTask);

            uploadTask.on('state_changed', (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              switch (snapshot.state) {
                case 'paused':
                  break;
                case 'running':
                  break;
              }
            }, (error) => { },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                attachments.push(downloadURL);
                setUploadingImages(prevArray => prevArray.slice(1));
                if (attachments.length === attachedImages.length) {
                  setUploadingImages([]);
                  setAttachedImages([]);
                  sendChatMessage(attachments, (attachments.length > 0) ? 'image' : 'text');
                }
              }
            );
          }
          await Promise.all(uploadTasks);
          await Promise.all(attachments);
        } else {
          sendChatMessage(attachments, 'text');
        }
      } else if (recordedURI) {
        const response = await fetch(recordedURI);
        const blob = await response.blob();

        const storageRef = ref(FIREBASE_STORAGE, `${chatId}/audios/audio_${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          switch (snapshot.state) {
            case 'paused':
              break;
            case 'running':
              break;
          }
        }, (error) => { },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            attachments.push(downloadURL);
            if (attachments.length > 0) {
              sendChatMessage(attachments, 'audio');
            }
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendChatMessage = async (attachments, type) => {
    try {

      const timestamp = Date.now();
      const messageId = `${timestamp}_${CustomUUID}`;

      updateLastRead();
      const newMessage = {
        messageId: messageId,
        content: message,
        senderId: CustomUUID,
        receiverId: CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0],
        timestamp: Timestamp.now(),
        soundLevels: soundLevels,
        audioDuration: recordingDuration,
        readStatus: 'unread',
        messageType: type,
        metadata: {
          attachments: attachments,
          reactions: [],
        }
      };
      const chatRef = doc(FIREBASE_DB, 'chats', chatId);
      const messagesRef = collection(FIREBASE_DB, 'chats', chatId, 'messages');

      await addDoc(messagesRef, newMessage);
      await updateDoc(chatRef, {
        lastMessage: newMessage,
      });
      console.log(activityStatus);
      if (activityStatus === 'inactive') {
        sendMessageNotification();
      }

      setRecording(null);
      setRecordedURI(null);
      setIsRecording(false);
      setSoundLevels([]);
      setRecordingDuration('00:00');
      setSound(null);
    } catch (error) {
      console.error('sendmessage', error);
    }
  };

  const updateLastRead = async () => {
    try {
      const chatRef = doc(FIREBASE_DB, 'chats', chatId);

      await updateDoc(chatRef, {
        'lastMessage.readStatus': 'read',
        lastSeen: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating last read:', error);
    }
  };

  const listenActivityChanges = async () => {
    const contactCustomUUID = CustomUUID === chatId.split('_')[0]
      ? chatId.split('_')[1]
      : chatId.split('_')[0];

    const qry = query(collection(FIREBASE_DB, 'users'), where('userId', '==', contactCustomUUID));

    const unsubscribe = onSnapshot(qry, (snapshot) => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.blockedUsers && data.blockedUsers.includes(CustomUUID)) {
          setBlockedFromOtherSide(true);
        } else {
          setBlockedFromOtherSide(false);
        }
        setActivityStatus(data.activityStatus);
        setLastActive(data.lastActive);
      });
    });

    return unsubscribe;
  };

  const listenBlockingChanges = () => {
    const qry = query(collection(FIREBASE_DB, 'users'), where('userId', '==', CustomUUID));

    const unsubscribe = onSnapshot(qry, (snapshot) => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.blockedUsers && data.blockedUsers.includes(CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])) {
          setBlockedFromOurSide(true);
        } else {
          setBlockedFromOurSide(false);
        }
      });
    });

    return unsubscribe;
  };

  const sendMessageNotification = async () => {
    try {
      const qry = query(
        collection(FIREBASE_DB, 'notifications'),
        where('senderId', '==', CustomUUID),
        where('receiverId', '==', CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]),
        where('notificationType', '==', 'message')
      );

      const snapshot = await getDocs(qry);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        if (doc) {
          const docRef = doc.ref;
          await updateDoc(docRef, {
            messageCount: increment(1),
          });
        }
      } else {
        await addDoc(collection(FIREBASE_DB, 'notifications'), {
          notificationId: 'notification_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          chatId: chatId,
          senderName: username,
          profileImage: profileImage,
          senderId: CustomUUID,
          receiverId: CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0],
          notificationType: 'message',
          messageCount: 1,
          status: 'pending',
          isRead: false,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error sending message notification read:', error);
    }
  };

  const updateMessageNotification = async () => {
    try {
      const qry = query(collection(FIREBASE_DB, 'notifications'),
        where('senderId', '==', CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]),
        where('receiverId', '==', CustomUUID),
        where('notificationType', '==', 'message'));

      const snapshot = await getDocs(qry);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        if (doc) {
          const docRef = doc.ref;
          await updateDoc(docRef, {
            isRead: true,
          });
        }
      }
    } catch (error) {
      console.error('Error deleteing message notification read:', error);
    }
  };

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
  };

  const handleScrollToTop = async (event) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y === 0) {
      await loadMoreMessages();
    }

  }



  useEffect(() => {
    const fetchData = async () => {
      if (chatId && CustomUUID) {
        await fetchMessages(chatId);
        await listenActivityChanges();
        listenBlockingChanges();
        setLastActive(lastOnline);
        setBlockedFromOurSide(blockedFromOur);
        setBlockedFromOtherSide(blockedFromOther);
        await updateLastRead();
        await updateMessageNotification();
        setLoading(false);
      }
    };
    fetchData();
  }, [chatId, CustomUUID, blockedFromOur, blockedFromOther]);



  return (
    <View style={styles.ChatBox}>
      <View style={styles.ChatBoxTopContent}>
        <View style={styles.ChatBoxTopRightContent}>
          <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
            <Image source={require('../assets/Icons/BackButton.png')} style={styles.BackButtonImage} />
          </Pressable>
          <Pressable onPress={() => { navigation.navigate('ChatInfo', { chatId, username, profileImage }) }} style={styles.ProfileButton}>
            <Image source={{ uri: profileImage }} style={styles.ProfileButtonImage} />
            <View style={styles.ProfileName}>
              <Text style={styles.ProfileNameText} numberOfLines={1} ellipsizeMode="tail">{username && username}</Text>
              {!loading && <View style={styles.ProfileStatus}>
                {(!blockedFromOtherSide && !blockedFromOurSide) &&
                  <>
                    {activityStatus === 'active' && <View style={styles.ProfileStatusCircle} />}
                    <Text style={styles.ProfileStatusText}>
                      {activityStatus === 'active' ? 'Active Now' : (`last seen ${lastActive && formatFirebaseTimestamp(lastActive)}`)}
                    </Text>
                  </>}
              </View>}
            </View>
          </Pressable>
        </View>
        <View style={styles.ChatBoxTopLeftContent}>
          <Pressable onPress={() => { setChatSettingSheetOpen(true) }} style={styles.ChatOptionsButton}>
            <Image source={require('../assets/Icons/ChatOptions.png')} style={styles.ChatOptionsButtonImage} />
          </Pressable>
        </View>
      </View>
      {(loading && !messages) ? (
        <View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>
      ) : (
        <>
          <ScrollView onScrollBeginDrag={() => { setUserScrolledUp(true) }} onScrollEndDrag={() => { setUserScrolledUp(false) }}
            keyboardDismissMode='on-drag' onScroll={handleScrollToTop} style={styles.ChatBoxCenterContent} ref={scrollViewRef} onContentSizeChange={() => {
              if (scrollViewRef.current && !userScrolledUp) {
                scrollViewRef.current.scrollToEnd({ animated: false })
              }
            }}>
            {messages?.map((message, i) => {
              if (message.senderId === CustomUUID) {
                return (
                  <React.Fragment key={i}>
                    {message.messageType === 'audio' &&
                      (<View style={[styles.ReciverContent, messages[i - 1]?.senderId !== (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                        && { marginTop: moderateScale(8) }]}>
                        <View style={styles.ReciverMessage}>
                          <View style={styles.SenderAudioView}>
                            {playingSound ?
                              (<Pressable onPress={() => { stopSound() }} style={{
                                height: moderateScale(24), width: moderateScale(24), alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Image source={require('../assets/Icons/PauseButton.png')} style={styles.senderAudioPlayImage} />
                              </Pressable>)
                              : (<Pressable onPress={() => { playSound(message.metadata.attachments[0]) }} style={{
                                height: moderateScale(24), width: moderateScale(24), alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Image source={require('../assets/Icons/PlayButton.png')} style={styles.senderAudioPlayImage} />
                              </Pressable>)
                            }
                            <ScrollView horizontal contentContainerStyle={styles.SenderAudioLevelsView}>
                              {message.soundLevels.map((level, index) => {
                                return (
                                  <View key={index} style={[{
                                    backgroundColor: '#DADBE0',
                                    width: moderateScale(3), borderRadius: moderateScale(3),
                                    height: `${level * 0.1}%`,
                                  }]} />
                                );
                              })}
                            </ScrollView>
                            <Text style={[styles.SenderAudioTimingText, { color: '#fff' }]}>{getDurationFormatted(parseInt(message.audioDuration))}</Text>
                          </View>
                        </View>
                      </View>)}

                    {message.messageType === 'image' &&
                      (message.metadata.attachments.map((image, index) => {
                        return (
                          <View key={index} style={[styles.ReciverContent, messages[i - 1]?.senderId !== (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                            && { marginTop: moderateScale(8) }]}>
                            <View style={[styles.ReciverMessage, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                              <Pressable onPress={() => { navigation.navigate('ImageShow', { uri: image }) }} style={styles.ChatImageButton}>
                                <Image source={{ uri: image }} style={styles.ChatImage} />
                              </Pressable>
                            </View>
                          </View>
                        )
                      }))
                    }


                    {(message.content && message.content.length > 0) &&
                      (
                        <View style={[styles.ReciverContent, messages[i - 1]?.senderId !== CustomUUID && { marginTop: moderateScale(8) }]}>
                          <View style={styles.ReciverMessage}>
                            {message.messageType === 'TaleReply' && (
                              <>
                                <Text style={{ color: '#FFFFFF99', fontSize: 13, fontWeight: '500', marginVertical: moderateScale(3), }}>you replied to there Tale</Text>
                                <View style={{ width: '100%', height: 1, backgroundColor: '#FFFFFF99', marginBottom: moderateScale(5), marginTop: moderateScale(5) }} />
                              </>
                            )}
                            <Text style={styles.ReciverMessageText}>
                              {message.content}
                            </Text>
                          </View>
                        </View>
                      )}
                  </React.Fragment>
                )
              } else {
                return (
                  <React.Fragment key={i}>
                    {message.messageType === 'audio' &&
                      (<View style={[styles.SenderContent, messages[i - 1]?.senderId !== (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                        && { marginTop: moderateScale(8) }]}>
                        <View style={styles.SenderView}>
                          {messages[i - 1]?.senderId === (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                            ? <View style={styles.SenderProfileImage} />
                            : <Image source={require('../assets/Images/Mei-Ling.jpg')} style={styles.SenderProfileImage} />}
                          <View style={styles.SenderMessage}>
                            <View style={styles.SenderAudioView}>
                              {playingSound ?
                                (<Pressable onPress={() => { stopSound() }} style={{
                                  height: moderateScale(24), width: moderateScale(24), alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Image source={require('../assets/Icons/DarkPauseButton.png')} style={styles.senderAudioPlayImage} />
                                </Pressable>)
                                : (<Pressable onPress={() => { playSound(message.metadata.attachments[0]) }} style={{
                                  height: moderateScale(24), width: moderateScale(24), alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Image source={require('../assets/Icons/AudioPlayButton.png')} style={styles.senderAudioPlayImage} />
                                </Pressable>)
                              }
                              <ScrollView horizontal contentContainerStyle={styles.SenderAudioLevelsView}>
                                {message.soundLevels.map((level, index) => {
                                  return (
                                    <View key={index} style={[{
                                      backgroundColor: '#DADBE0',
                                      // backgroundColor: '#49505B',
                                      width: moderateScale(3), borderRadius: moderateScale(3),
                                      height: `${level * 0.1}%`,
                                    }]} />
                                  );
                                })}
                              </ScrollView>
                              <Text style={[styles.SenderAudioTimingText, { color: '#49505B' }]}>{getDurationFormatted(parseInt(message.audioDuration))}</Text>
                            </View>
                          </View>
                        </View>
                      </View>)}


                    {message.messageType === 'image' &&
                      (message.metadata.attachments.map((image, index) => {
                        return (
                          <View key={index} style={[styles.SenderContent, messages[i - 1]?.senderId !== (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                            && { marginTop: moderateScale(8) }]}>
                            <View style={styles.SenderView}>
                              {messages[i - 1]?.senderId === (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                                ? <View style={styles.SenderProfileImage} />
                                : <Image source={{ uri: profileImage }} style={styles.SenderProfileImage} />}
                              <View style={[styles.SenderMessage, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                                <Pressable onPress={() => { navigation.navigate('ImageShow', { uri: image }) }} style={styles.ChatImageButton}>
                                  <Image source={{ uri: image }} style={styles.ChatImage} />
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        )
                      }))
                    }

                    {(message.content && message.content.length > 0) &&
                      (<View style={[styles.SenderContent, messages[i - 1]?.senderId !== (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                        && { marginTop: moderateScale(8) }]}>
                        <View style={styles.SenderView}>
                          {messages[i - 1]?.senderId === (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                            ? <View style={styles.SenderProfileImage} />
                            : <Image source={{ uri: profileImage }} style={styles.SenderProfileImage} />}
                          <View style={styles.SenderMessage}>
                            {message.messageType === 'TaleReply' && (
                              <>
                                <Text style={{ color: '#999', fontSize: 13, fontWeight: '500', marginVertical: moderateScale(3), }}>{username} replied to your Tale</Text>
                                <View style={{ width: '100%', height: 1, backgroundColor: '#c3c3c3', marginBottom: moderateScale(5), marginTop: moderateScale(5) }} />
                              </>
                            )}
                            <Text style={styles.SenderMessageText}>
                              {message.content}
                            </Text>
                          </View>
                        </View>
                      </View>)}

                  </React.Fragment>
                )
              }
            })}

            {(uploadingImages.length > 0) &&
              (uploadingImages.map((image, index) => {
                return (
                  <View key={index} style={[styles.ReciverContent, messages[messages.length - 1]?.senderId !== (CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0])
                    && { marginTop: moderateScale(8) }]}>
                    <View style={[styles.ReciverMessage, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                      <Pressable onPress={() => { navigation.navigate('ImageShow', { uri: image }) }}
                        style={[styles.ChatImageButton, { height: moderateScale(230), }]}>
                        <Image source={{ uri: image }} style={styles.ChatImage} />
                        <Image source={require('../assets/Icons/uploadingIcon.png')} style={{
                          width: moderateScale(20),
                          height: moderateScale(20),
                          marginRight: moderateScale(10),
                          marginTop: moderateScale(5),
                        }} />
                      </Pressable>
                    </View>
                  </View>
                )
              }))
            }
          </ScrollView>
          <View style={styles.ChatBoxBottomContent}>
            {(attachedImages.length > 0 && uploadingImages.length === 0) &&
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.AttachmentContainer}>
                {attachedImages.map((image, i) => {
                  return (
                    <View key={i} style={styles.DeleteImageButton}>
                      <Image source={{ uri: image }} style={styles.AttachmentImage} />
                      <Pressable onPress={() => { deleteImage(i) }} style={styles.DeleteImageButtonMain}>
                        <Image source={require('../assets/Icons/DeleteAudio.png')} style={styles.DeleteImageButtonImage} />
                      </Pressable>
                    </View>
                  )
                })}
                <Pressable onPress={pickImage} style={styles.AttachMoreImagesButton}>
                  <Image source={require('../assets/Icons/SendToAddIcon.png')} style={styles.AttachMoreImagesButtonIcon} />
                </Pressable>
              </ScrollView>}
            <View style={styles.ChatBoxBottomOptions}>
              {(!blockedFromOtherSide && !blockedFromOurSide) &&
                <>
                  {(!attachedImages.length > 0) &&
                    <>
                      <Pressable onPress={pickImage} style={styles.MessageBoxButton}>
                        <Image source={require('../assets/Icons/AttachFile.png')} style={styles.MessageBoxButtonImage} />
                      </Pressable>
                    </>
                  }
                  <View style={[styles.MessageInputView, attachedImages.length > 0 && { width: '90%' }]}>
                    <TextInput placeholder='Message...' value={message} onChangeText={setMessage} placeholderTextColor={'#C3C3C3'} style={[styles.MessageInput, attachedImages.length > 0 && { width: '100%' }]} />
                  </View>
                  <Pressable onPress={sendMessage} style={styles.SendMessageButton}>
                    <Image source={require('../assets/Icons/SendMessage.png')} style={styles.SendMessageButtonImage} />
                  </Pressable>
                </>}


              {blockedFromOther && <Text style={styles.BlockedText}>You have been blocked by {username}</Text>}
              {blockedFromOur && <Text style={styles.BlockedText}>You blocked {username}</Text>}

            </View>
          </View>
          <SettingBottomSheet settingSheetOpen={chatSettingSheetOpen} setSettingSheetOpen={setChatSettingSheetOpen} setBlockSheetOpen={setBlockSheetOpen}
            CustomUUID={CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]} Blocked={blockedFromOurSide} chatId={chatId}
            notInAccountPage={true} />
          <BlockAccountConfirmation setBlockSheetOpen={setBlockSheetOpen} blockSheetOpen={blockSheetOpen} username={username} profileImage={profileImage}
            CustomUUID={CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]} unBlockUser={blockedFromOurSide} notInAccountPage={true} />
        </>)
      }
    </View>
  )
}

export default Chatbox;

const styles = StyleSheet.create({
  ChatBox: {
    paddingTop: moderateScale(30),
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  ChatBoxTopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    justifyContent: 'space-between',
    borderBottomWidth: moderateScale(2),
    borderBottomColor: '#F8F9FA',
    paddingBottom: moderateScale(7),
  },
  ChatBoxTopRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  ChatBoxTopLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(19),
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  BackButtonImage: {
    height: '100%',
    width: '100%',
  },
  ProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    width: '50%',
  },
  ProfileButtonImage: {
    height: moderateScale(35),
    width: moderateScale(35),
    borderRadius: moderateScale(50),
  },
  ProfileName: {
    justifyContent: 'center',
  },
  ProfileNameText: {
    fontSize: Height * 0.018,
    fontWeight: '900',
    color: '#49505B',
  },
  ProfileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(3),
  },
  ProfileStatusCircle: {
    backgroundColor: '#1DD75B',
    height: moderateScale(9),
    width: moderateScale(9),
    borderRadius: moderateScale(50),
  },
  ProfileStatusText: {
    fontSize: Height * 0.015,
    fontWeight: '500',
    color: '#9095A0',
  },
  CallButton: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  CallButtonImage: {
    height: '100%',
    width: '100%',
  },
  ChatOptionsButton: {
    width: moderateScale(18),
    height: moderateScale(18),
  },
  ChatOptionsButtonImage: {
    width: '100%',
    height: '100%',
  },
  ChatBoxCenterContent: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
  },
  TimeStampText: {
    textAlign: 'center',
    color: '#9095A0',
    fontSize: Height * 0.014,
  },
  SenderContent: {
    marginVertical: moderateScale(1),
    gap: moderateScale(1.2),
  },
  SenderView: {
    maxWidth: '50%',
    flexDirection: 'row',
    gap: moderateScale(6),
  },
  SenderMessage: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(10),
  },
  SenderMessageText: {
    color: '#49505B',
    fontWeight: '500',
    fontSize: Height * 0.016,
    lineHeight: moderateScale(Height * 0.019),
  },
  SenderProfileImage: {
    height: moderateScale(25),
    width: moderateScale(25),
    borderRadius: moderateScale(50),
  },
  SenderAudioView: {
    height: moderateScale(40),
    maxWidth: Width * 0.48,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  senderAudioPlayImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  SenderAudioLevelsView: {
    maxWidth: Width * 0.30,
    // flexDirection: 'row',
    height: moderateScale(30),
    gap: moderateScale(3),
  },
  SenderAudioTimingText: {
    fontWeight: '600',
    fontSize: Height * 0.016,
  },
  ReciverContent: {
    marginVertical: moderateScale(1),
    maxWidth: '55%',
    alignSelf: 'flex-end',
    gap: moderateScale(1.2),
  },
  ChatImageButton: {
    width: Width * 0.55 - moderateScale(20),
    height: moderateScale(200),
    alignItems: 'flex-end',
    backgroundColor: '#3797F0',
    borderRadius: moderateScale(10),
  },
  ChatImage: {
    width: '100%',
    height: moderateScale(200),
    borderRadius: moderateScale(10),
    resizeMode: 'cover',
  },
  ReciverMessage: {
    backgroundColor: '#3797F0',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(10),
  },
  ReciverMessageText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: Height * 0.016,
    lineHeight: moderateScale(Height * 0.019),
  },
  ChatBoxBottomContent: {
    padding: moderateScale(16),
    borderTopWidth: moderateScale(2),
    borderTopColor: '#F8F9FA',
  },
  ChatBoxBottomOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  MessageBoxButton: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  MessageBoxButtonImage: {
    height: '100%',
    width: '100%',
  },
  MessageInputView: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: moderateScale(35),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    width: '80%',
  },
  MessageInput: {
    fontSize: Height * 0.018,
    width: '90%',
    color: '#49505B',
  },
  SendMessageButton: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  SendMessageButtonImage: {
    height: '100%',
    width: '100%',
  },
  ChatBoxRecordingOptions: {
    backgroundColor: '#3797F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(2),
    position: 'absolute',
    width: Width - moderateScale(32),
    height: moderateScale(35),
    top: moderateScale(16),
    left: moderateScale(16),
    borderRadius: moderateScale(50),
  },
  RecordingDeleteButton: {
    height: moderateScale(30),
    width: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(50),
    backgroundColor: '#fff',
  },
  RecordingDeleteButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  RecordingDurationText: {
    fontSize: Height * 0.016,
    color: '#fff',
    fontWeight: '600',
    left: moderateScale(-10),
  },
  AttachmentContainer: {
    backgroundColor: '#fff',
    height: moderateScale(80),
    marginBottom: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  DeleteImageButton: {
    height: moderateScale(80),
    width: moderateScale(80),
  },
  AttachmentImage: {
    height: '100%',
    width: '100%',
    borderRadius: moderateScale(10),
  },
  DeleteImageButtonImage: {
    height: moderateScale(14),
    width: moderateScale(14),
  },
  DeleteImageButtonMain: {
    height: moderateScale(22),
    width: moderateScale(22),
    borderRadius: moderateScale(100),
    backgroundColor: '#fff',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: '64%',
    top: '64%',
  },
  AttachMoreImagesButton: {
    height: moderateScale(45),
    width: moderateScale(45),
    borderRadius: moderateScale(100),
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  AttachMoreImagesButtonIcon: {
    height: moderateScale(26),
    width: moderateScale(26),
  },
  SoundBarsView: {
    width: moderateScale(250),
    height: moderateScale(35),
    gap: moderateScale(2),
    marginHorizontal: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    backgroundColor: '#fff',
    width: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  BlockedText: {
    backgroundColor: '#F3F4F6',
    width: '100%',
    paddingVertical: moderateScale(6),
    textAlign: 'center',
    fontWeight: '500',
    color: '#999',
    borderRadius: moderateScale(4),
    fontSize: Height * 0.016,
  },
  LoadingContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});