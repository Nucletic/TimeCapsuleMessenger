import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useCallback, useContext } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import TimeIndicatorTitle from '../components/NotificationComponents/TimeIndicatorTitle'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import FollowRequestComponenet from '../components/NotificationComponents/FollowRequestComponenet'
import MessageNotificationCard from '../components/NotificationComponents/MessageNotificationCard'


import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native'
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


import FilterAllUnread from '../components/SmallEssentials/FilterAllUnread'

const Notification = ({ navigation }) => {

  const [loading, setLoading] = useState(true);
  const [followRequests, setFollowRequests] = useState([]);
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState('All');

  const [unreadFollowRequests, setUnreadFollowRequests] = useState([]);
  const [unreadMessageNotifications, setUnreadMessageNotifications] = useState([]);


  




  const getAllNotifications = async () => {
    try {
      setLoading(true);
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/${CustomUUID}/getAllNotifications`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status === 200) {
        unreadFollow = [];
        unreadMessage = [];


        for (let i = 0; i < data.followRequests.length; i++) {
          if (data.followRequests[i].isRead === false) {
            unreadFollow.push(data.followRequests[i]);
          }
        }
        for (let i = 0; i < data.messageNotifications.length; i++) {
          if (data.messageNotifications[i].isRead === false) {
            unreadMessage.push(data.messageNotifications[i]);
          }
        }
        setFollowRequests(data.followRequests);
        setMessageNotifications(data.messageNotifications);
        setUnreadFollowRequests([...unreadFollow]);
        setUnreadMessageNotifications([...unreadMessage]);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const AcceptChatmateRequest = async (requestIndex, ReciverUUID, SenderUUID) => {
    try {
      const requestToSave = followRequests[requestIndex];
      const updatedFollowRequests = [...followRequests];
      updatedFollowRequests.splice(requestIndex, 1);
      setFollowRequests(updatedFollowRequests);

      await AsyncStorage.setItem(SenderUUID, JSON.stringify(requestToSave));

      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/AcceptChatmateRequest`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ReciverUUID: ReciverUUID, SenderUUID: SenderUUID })
      });

      if (response.status === 200) {
        console.log('accepted');
      } else {
        const savedRequest = await AsyncStorage.getItem(SenderUUID);
        const parsedSavedRequest = JSON.parse(savedRequest);
        setFollowRequests(prevState => [...prevState, parsedSavedRequest]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const RejectChatmateRequest = async (requestIndex, ReciverUUID, SenderUUID) => {
    try {
      const requestToSave = followRequests[requestIndex];
      const updatedFollowRequests = [...followRequests];
      updatedFollowRequests.splice(requestIndex, 1);
      setFollowRequests(updatedFollowRequests);
      await AsyncStorage.setItem(SenderUUID, JSON.stringify(requestToSave));

      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch(`http://10.0.2.2:5000/users/RejectChatmateRequest`, {
      const response = await fetch(`http://192.168.29.62:5000/users/RejectChatmateRequest`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ReciverUUID: ReciverUUID, SenderUUID: SenderUUID })
      })
      const data = await response.json();
      if (response.status === 200) {
        console.log('rejected');
      } else {
        const savedRequest = await AsyncStorage.getItem(SenderUUID);
        const parsedSavedRequest = JSON.parse(savedRequest);
        updatedFollowRequests.splice(requestIndex, 0, parsedSavedRequest);
        setFollowRequests(updatedFollowRequests);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getAllNotifications();
    }, [])
  );

  const onMessageNotificationPress = async (notification) => {
    try {
      navigation.navigate('ChatBox', { chatId: notification.chatId, username: notification.senderName, profileImage: notification.profileImage });
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const response = await fetch(`http://192.168.29.62:5000/users/markNotificationsAsRead/?CustomUUID=${CustomUUID}/notificationId?=${notification.notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error(error);
    }
  }

  const MarkAllAsRead = async () => {
    try {
      setFollowRequests(prevFollowRequests => prevFollowRequests.map(request => ({ ...request, isRead: true })));
      setMessageNotifications(prevMessageNotifications => prevMessageNotifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadFollowRequests([]);
      setUnreadMessageNotifications([]);


      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const response = await fetch(`http://192.168.29.62:5000/users/markNotificationsAsRead/${CustomUUID}/${null}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.Container}>
      <View style={styles.PageTitleContainer}>
        <Text style={styles.PageTitle}>Notifications</Text>
        <Pressable onPress={() => { MarkAllAsRead() }} style={styles.MarkReadButton}>
          <Image source={require('../assets/Icons/animeIcons/MarkAllAsRead.png')} style={styles.MarkReadIcon} />
        </Pressable>
      </View>
      <View style={styles.NotificationSettingsContainer}>
        <FilterAllUnread firstFuncText={'All'} secondFuncText={'Unread'} onAllPress={() => { setSelectedType('All') }} onUnreadPress={() => { setSelectedType('Unread') }} />
      </View>
      <ScrollView style={styles.MainNotificationContent}>
        <TimeIndicatorTitle titleText={'RECENT'} />
        {loading ?
          <View style={styles.LoadingContainer}>
            <LoaderAnimation size={40} color={'#49505B'} />
          </View> :
          selectedType === 'All' ?
            <>
              {followRequests.length > 0 && followRequests?.map((request, i) => (
                <FollowRequestComponenet key={i} data={request} onReject={() => { RejectChatmateRequest(i, request.receiverId, request.senderId) }}
                  onAccept={() => { AcceptChatmateRequest(i, request.receiverId, request.senderId) }} />
              ))}
              {messageNotifications.length > 0 && messageNotifications?.map((notification, i) => (
                <MessageNotificationCard
                  key={i}
                  data={notification}
                  onPress={() => { onMessageNotificationPress(notification) }}
                />
              ))}
            </> :
            <>
              {unreadFollowRequests.length > 0 && unreadFollowRequests?.map((request, i) => (
                <FollowRequestComponenet key={i} data={request} onReject={() => { RejectChatmateRequest(i, request.receiverId, request.senderId) }}
                  onAccept={() => { AcceptChatmateRequest(i, request.receiverId, request.senderId) }} />
              ))}
              {unreadMessageNotifications.length > 0 && unreadMessageNotifications?.map((notification, i) => (
                <MessageNotificationCard key={i} data={notification} onPress={() => { onMessageNotificationPress(notification) }} />
              ))}
            </>
        }
      </ScrollView>
    </View>
  )
}



export default Notification;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
    paddingTop: moderateScale(30),
  },
  PageTitleContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(10),
  },
  MarkReadIcon: {
    height: moderateScale(22),
    width: moderateScale(22),
  },
  PageTitle: {
    fontSize: Height * 0.032,
    color: '#1C170D',
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
  },
  NotificationSettingsContainer: {
    alignItems: 'center',
    marginTop: -moderateScale(10),
    paddingBottom: moderateScale(8),
  },
  NotificationSettingsContainerLeft: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  AllNotificationsButton: {
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(100),
  },
  AllNotificationsButtonText: {
    color: '#9095A0',
    fontSize: Height * 0.017,
    fontWeight: '600',
  },
  UnreadNotificationsButton: {
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(100),
  },
  UnreadNotificationsButtonText: {
    color: '#9095A0',
    fontSize: Height * 0.017,
    fontWeight: '600',
  },
  MarkReadButton: {},
  MarkReadButtonText: {
    color: '#F7706E',
    fontSize: Height * 0.018,
    fontWeight: '600',
  },
  LoadingContainer: {
    height: Height - moderateScale(256),
    width: Width,
    alignItems: 'center',
    justifyContent: 'center',
  },
});