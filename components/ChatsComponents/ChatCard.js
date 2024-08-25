import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'
import { useNavigation } from '@react-navigation/native'





import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const ChatCard = ({ username, profileImage, activityStatus, lastMessage, timestamp, readStatus, chatId, blockedFromOtherSide, blockedFromOurSide, lastActive, ExpoPushToken }) => {

  



  const navigation = useNavigation();

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

  const renderLastMessageText = () => {
    const messageContent = lastMessage.messageType ?
      (lastMessage.messageType === 'Image' ?
        `${username} sent you a Memory`
        : lastMessage.messageType === 'audio' ? `${username} sent you a Audio Message` : lastMessage.content)
      : 'You Started a Conversation';

    return (
      <Text style={[styles.MessageText, { fontWeight: readStatus === 'unread' ? '500' : '500' }]}>
        {messageContent}
      </Text>
    )
  }

  return (
    <Pressable onPress={() => {
      navigation.navigate('ChatBox', {
        chatId, username, profileImage, blockedFromOther: blockedFromOtherSide,
        blockedFromOur: blockedFromOurSide, onlineStatus: activityStatus,
        lastOnline: lastActive, ExpoPushToken: ExpoPushToken
      })
    }} style={styles.ChatCard}>
      {username &&
        <>
          <View style={styles.ChatPictureContainer}>
            {profileImage && <Image source={{ uri: profileImage }} style={styles.ChatPicture} />}
            <Image source={require('../../assets/Images/peterparker.jpg')} style={styles.ChatPicture} />
            {(!blockedFromOtherSide && !blockedFromOurSide) && (activityStatus === 'active' && <View style={styles.ActivityIndicator} />)}
            <View style={styles.ActivityIndicator} />
          </View>
          <View style={styles.ChatInfo}>
            <View style={styles.NameContainer}>
              <Text style={styles.NameText}>{username && username}</Text>
              <View style={[styles.MessageIndicator, { backgroundColor: readStatus === 'unread' ? '#029861' : '#fff' }]} />
            </View>
            <View style={styles.MessageInfo}>
              {blockedFromOtherSide ? <Text style={[styles.MessageText, { fontWeight: readStatus === 'unread' ? '500' : '500' }]}>
                You are Blocked By {username}
              </Text> : blockedFromOurSide ? <Text style={[styles.MessageText, { fontWeight: readStatus === 'unread' ? '500' : '500' }]}>
                You Blocked {username}
              </Text> :
                (lastMessage && renderLastMessageText())}
              <Text style={styles.MessageDateText}>
                {formatFirebaseTimestamp(timestamp) === 0 ? 'Just Now' : formatFirebaseTimestamp(timestamp)}
              </Text>
            </View>
          </View>
        </>}
    </Pressable>
  )
}

export default ChatCard;

const styles = StyleSheet.create({
  ChatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    width: '100%',
  },
  ChatPictureContainer: {
    height: moderateScale(55),
    width: moderateScale(55),
  },
  ChatPicture: {
    height: '100%',
    width: '100%',
    borderRadius: moderateScale(50),
  },
  ActivityIndicator: {
    height: moderateScale(16),
    width: moderateScale(16),
    backgroundColor: '#1DD75B',
    position: 'absolute',
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(1),
    borderColor: '#fff',
    top: '68%',
    left: '68%',
  },
  ChatInfo: {
    width: Width - moderateScale(32) - moderateScale(55) - moderateScale(10),
    gap: 2,
  },
  NameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  NameText: {
    color: '#1b160b',
    fontSize: Height * 0.020,
    fontFamily: 'PlusJakartaSans',
    fontWeight: '700',
  },
  MessageIndicator: {
    height: moderateScale(12),
    width: moderateScale(12),
    borderRadius: moderateScale(50),
  },
  MessageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  MessageText: {
    color: '#A3814A',
    fontSize: Height * 0.018,
    fontFamily: 'PlusJakartaSans',
  },
  MessageDateText: {
    color: '#A3814A',
    fontSize: Height * 0.018,
    fontFamily: 'PlusJakartaSans',
  },
});