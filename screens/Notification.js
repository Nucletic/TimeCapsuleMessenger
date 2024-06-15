import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import TimeIndicatorTitle from '../components/NotificationComponents/TimeIndicatorTitle'
import NotificationCard from '../components/NotificationComponents/NotificationCard'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'


import Constants from 'expo-constants';
import FollowRequestComponenet from '../components/NotificationComponents/FollowRequestComponenet'
import MessageNotificationCard from '../components/NotificationComponents/MessageNotificationCard'
import { useFocusEffect } from '@react-navigation/native'
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AppContext from '../ContextAPI/AppContext'

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/9355418052';



const Notification = ({ navigation }) => {


  const { showAds } = useContext(AppContext);

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
      const response = await fetch(`http://192.168.29.8:5000/users/${CustomUUID}/getAllNotifications`, {
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
      const response = await fetch(`http://192.168.29.8:5000/users/AcceptChatmateRequest`, {
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
      const response = await fetch(`http://192.168.29.8:5000/users/RejectChatmateRequest`, {
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
      const response = await fetch(`http://192.168.29.8:5000/users/markNotificationsAsRead/?CustomUUID=${CustomUUID}/notificationId?=${notification.notificationId}`, {
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
      const response = await fetch(`http://192.168.29.8:5000/users/markNotificationsAsRead/${CustomUUID}/${null}`, {
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
      <Text style={styles.PageTitle}>Notification</Text>
      <View style={styles.NotificationSettingsContainer}>
        <View style={styles.NotificationSettingsContainerLeft}>
          <Pressable onPress={() => { setSelectedType('All') }} style={[styles.AllNotificationsButton, selectedType === 'All' && { backgroundColor: '#F3F4F6', }]}>
            <Text style={[styles.AllNotificationsButtonText, selectedType === 'All' && { color: '#2F3237', }]}>All</Text>
          </Pressable>
          <Pressable onPress={() => { setSelectedType('Unread') }} style={[styles.UnreadNotificationsButton, selectedType === 'Unread' && { backgroundColor: '#F3F4F6', }]}>
            <Text style={[styles.UnreadNotificationsButtonText, selectedType === 'Unread' && { color: '#2F3237', }]}>Unread</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => { MarkAllAsRead() }} style={styles.MarkReadButton}>
          <Text style={styles.MarkReadButtonText}>Mark all as read</Text>
        </Pressable>
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
      {(!showAds || showAds === false) &&
        <View style={{ position: 'absolute', bottom: 0 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>}
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
  PageTitle: {
    paddingBottom: moderateScale(16),
    fontSize: Height * 0.026,
    color: '#49505B',
    fontWeight: '900',
    textAlign: 'center',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  NotificationSettingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
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