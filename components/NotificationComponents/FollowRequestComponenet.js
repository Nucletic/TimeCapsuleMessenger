import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'

const FollowRequestComponenet = ({ data, onAccept, onReject }) => {

  function timeAgo(timestamp) {
    const seconds = timestamp._seconds;
    const nanoseconds = timestamp._nanoseconds;

    // Create a Date object using the seconds and nanoseconds
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);

    // Get the current time
    const now = new Date();

    // Calculate the difference in milliseconds
    const diff = now - date;

    // Convert milliseconds to minutes
    const minutes = Math.floor(diff / (1000 * 60));

    // Determine the appropriate time format based on the difference
    if (minutes < 1) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? '' : ''} ago`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} h${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes < 43200) {
      const days = Math.floor(minutes / 1440);
      return `${days} d${days !== 1 ? 's' : ''} ago`;
    } else if (minutes < 525600) {
      const months = Math.floor(minutes / 43200);
      return `${months} mon${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(minutes / 525600);
      return `${years} y${years !== 1 ? 's' : ''} ago`;
    }
  }

  return (
    <Pressable style={styles.NotificationCardButton}>
      <View style={styles.FolllowRequestUserInfo}>
        <View style={styles.NotificationCardButtonLeft}>
          <Image source={require('../../assets/Images/user3.jpg')} style={styles.NotificationUserImage} />
          <View style={styles.NotificationUserDetails}>
            <Text style={styles.NotificationUserDetailsOne}>
              {`${data && data.senderName} `}
              <Text style={styles.NotificationUserDetailsTwo}>
                wants to be your Chat Mate ?
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.NotificationCardButtonRight}>
          <Text style={styles.unreadNotificationTimeText}>{data && timeAgo(data.timestamp)}</Text>
          <View style={styles.unreadNotificationIndicator} />
        </View>
      </View>
      <View style={styles.FollowRequestButtons}>
        <Pressable onPress={onAccept} style={styles.AcceptButton}>
          <Text style={styles.AcceptButtonText}>Accept</Text>
        </Pressable>
        <Pressable onPress={onReject} style={styles.RejectButton}>
          <Text style={styles.RejectButtonText}>Reject</Text>
        </Pressable>
      </View>
    </Pressable>
  )
}

export default FollowRequestComponenet;

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
  },
  unreadNotificationIndicator: {
    height: moderateScale(10),
    width: moderateScale(10),
    borderRadius: moderateScale(100),
    backgroundColor: '#F7706E',
  },
  FollowRequestButtons: {
    marginTop: moderateScale(10),
    paddingLeft: moderateScale(49),
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  AcceptButton: {
    backgroundColor: '#F7706E',
    height: moderateScale(30),
    width: moderateScale(80),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  AcceptButtonText: {
    fontSize: Height * 0.018,
    color: '#fff',
    fontWeight: '600',
  },
  RejectButton: {
    backgroundColor: '#fff',
    height: moderateScale(30),
    width: moderateScale(80),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  RejectButtonText: {
    fontSize: Height * 0.018,
    color: '#2F3237',
    fontWeight: '600',
  },
});