import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'


const NotificationCard = () => {
  return (
    <Pressable style={styles.NotificationCardButton}>
      <View style={styles.NotificationCardButtonLeft}>
        <Image source={require('../../assets/Images/user3.jpg')} style={styles.NotificationUserImage} />
        <View style={styles.NotificationUserDetails}>
          <Text style={styles.NotificationUserDetailsOne}>
            {'Yung Chen '}
            <Text style={styles.NotificationUserDetailsTwo}>
              Left a Time Capsule for you
            </Text>
          </Text>
        </View>
      </View>
      <View style={styles.NotificationCardButtonRight}>
        <Text style={styles.unreadNotificationTimeText}>10m ago</Text>
        <View style={styles.unreadNotificationIndicator} />
      </View>
    </Pressable>
  )
}

export default NotificationCard

const styles = StyleSheet.create({
  NotificationCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    backgroundColor: '#F0F7FF',
  },
  NotificationCardButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  NotificationUserDetails: {
    flexDirection: 'row',
    marginLeft: moderateScale(8),
    width: '60%',
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
    gap: moderateScale(16),
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
});