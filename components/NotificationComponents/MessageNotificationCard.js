import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'


const MessageNotificationCard = ({ data, onPress }) => {


  function timeAgo(milliseconds) {
    const msPerSecond = 1000;
    const msPerMinute = msPerSecond * 60;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerWeek = msPerDay * 7;

    const elapsed = Date.now() - milliseconds;

    if (elapsed < msPerMinute) {
      const seconds = Math.round(elapsed / msPerSecond);
      return `${seconds}s ago`;
    } else if (elapsed < msPerHour) {
      const minutes = Math.round(elapsed / msPerMinute);
      return `${minutes}m ago`;
    } else if (elapsed < msPerDay) {
      const hours = Math.round(elapsed / msPerHour);
      return `${hours}h ago`;
    } else if (elapsed < msPerWeek) {
      const days = Math.round(elapsed / msPerDay);
      return `${days}d ago`;
    } else {
      const weeks = Math.round(elapsed / msPerWeek);
      return `${weeks}w ago`;
    }
  }

  return (
    <Pressable onPress={onPress} style={styles.NotificationCardButton}>
      <View style={[styles.FolllowRequestUserInfo, (data && data.isRead) && { gap: 0 }]}>
        <View style={styles.NotificationCardButtonLeft}>
          <Image source={{ uri: data.profileImage }} style={styles.NotificationUserImage} />
          <View style={styles.NotificationUserDetails}>
            <Text style={styles.NotificationUserDetailsOne}>
              {`${data && data.senderName} `}
              <Text style={styles.NotificationUserDetailsTwo}>
                sent you {`${data && (data.messageCount > 9 ? '9+' : data.messageCount)}`} messages
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.NotificationCardButtonRight}>
          <Text style={styles.unreadNotificationTimeText}>{data.timestamp && timeAgo(data.timestamp)}</Text>
          {data && !data.isRead &&
            <View style={styles.unreadNotificationIndicator} />}
        </View>
      </View>
    </Pressable>
  )
}

export default MessageNotificationCard


const styles = StyleSheet.create({
  NotificationCardButton: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    backgroundColor: '#F0F7FF',
  },
  FolllowRequestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(-18),
  },
  NotificationCardButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  NotificationUserDetails: {
    flexDirection: 'row',
    marginLeft: moderateScale(8),
    width: '70%',
  },
  NotificationUserDetailsOne: {
    color: '#2F3237',
    fontSize: Height * 0.017,
    fontWeight: '800',
  },
  NotificationUserDetailsTwo: {
    color: '#2F3237',
    fontSize: Height * 0.017,
    fontWeight: '400',
    lineHeight: Height * 0.023,
  },
  NotificationUserImage: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(100),
  },
  NotificationCardButtonRight: {
    gap: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadNotificationTimeText: {
    fontSize: Height * 0.017,
    color: '#9095A0',
    textAlign: 'center',
    width: moderateScale(50),
  },
  unreadNotificationIndicator: {
    height: moderateScale(10),
    width: moderateScale(10),
    borderRadius: moderateScale(100),
    backgroundColor: '#F7706E',
  },
});