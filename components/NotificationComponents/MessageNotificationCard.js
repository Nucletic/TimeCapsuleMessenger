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
          {(data && data.profileImage) ? <Image source={{ uri: data.profileImage }} style={styles.NotificationUserImage} />
            : <Image source={require('../../assets/Images/user3.jpg')} style={styles.NotificationUserImage} />}
          <View style={styles.NotificationUserDetails}>
            <View style={styles.NameAndTimeContainer}>
              <Text style={styles.NotificationUserDetailsOne}>
                {`${data && data.senderName} `}
              </Text>
              <View style={styles.NotificationCardButtonRight}>
                <Text style={styles.unreadNotificationTimeText}>{data && timeAgo(data.timestamp)}</Text>
                {(data && data.pending) && <View style={styles.unreadNotificationIndicator} />}
              </View>
            </View>
            <Text style={styles.NotificationUserDetailsTwo}>
              sent you {`${data && (data.messageCount > 9 ? '9+' : data.messageCount)}`} messages
            </Text>
          </View>
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
    // backgroundColor: '#F0F7FF',
  },
  FolllowRequestUserInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(-18),
  },
  NotificationCardButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  NotificationUserDetails: {
    marginLeft: moderateScale(8),
    width: '83%',
  },
  NameAndTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  NotificationUserDetailsOne: {
    color: '#1C170D',
    fontSize: Height * 0.02,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans',
  },
  NotificationUserDetailsTwo: {
    color: '#A1824A',
    fontSize: Height * 0.018,
    fontFamily: 'PlusJakartaSans',
    fontWeight: '400',
    lineHeight: Height * 0.023,
  },
  NotificationUserImage: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(100),
  },
  NotificationCardButtonRight: {
    gap: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadNotificationTimeText: {
    fontSize: Height * 0.018,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  unreadNotificationIndicator: {
    height: moderateScale(10),
    width: moderateScale(10),
    borderRadius: moderateScale(100),
    backgroundColor: '#029861',
  },
});