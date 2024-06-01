import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'

const BlockedAccountCard = ({ profileImage, username, onPress, userId }) => {
  
  return (
    <Pressable style={styles.Container}>
      <View style={styles.blockedAccountButtonLeft}>
        {profileImage && <Image source={{ uri: profileImage }} style={styles.BlockedAccountImage} />}
        <Text style={styles.BlockedAccountText}>{username && username}</Text>
      </View>
      <Pressable onPress={onPress} style={styles.blockedAccountUnblockButton}>
        <Text style={styles.blockedAccountUnblockButtonText}>Unblock</Text>
      </Pressable>
    </Pressable>
  )
}

export default BlockedAccountCard;

const styles = StyleSheet.create({
  Container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  BlockedAccountImage: {
    height: moderateScale(45),
    width: moderateScale(45),
    borderRadius: moderateScale(100),
  },
  blockedAccountButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(8),
  },
  BlockedAccountText: {
    fontSize: Height * 0.018,
    fontWeight: '600',
    color: '#2F3237',
  },
  blockedAccountUnblockButton: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderWidth: moderateScale(1),
    borderColor: '#C3C3C3',
    borderRadius: moderateScale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedAccountUnblockButtonText: {
    fontSize: Height * 0.016,
    fontWeight: '600',
    color: '#49505B',
  },
});