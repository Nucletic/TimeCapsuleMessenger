import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'



const BlockedAccountCard = ({ profileImage, username, name, onPress, userId }) => {

  



  return (
    <Pressable style={styles.Container}>
      <View style={styles.blockedAccountButtonLeft}>
        {profileImage && <Image source={{ uri: profileImage }} style={styles.BlockedAccountImage} />}
        <View style={styles.NameContainer}>
          <Text style={styles.BlockedAccountText}>{username && username}</Text>
          <Text style={styles.BlockedAccountText2}>@{name && name}</Text>
        </View>
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
    height: moderateScale(55),
    width: moderateScale(55),
    borderRadius: moderateScale(100),
  },
  blockedAccountButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(8),
  },
  BlockedAccountText: {
    fontSize: Height * 0.02,
    fontWeight: '700',
    color: '#1C170D',
    fontFamily: 'PlusJakartaSans',
  },
  BlockedAccountText2: {
    fontSize: Height * 0.018,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  blockedAccountUnblockButton: {
    backgroundColor: '#f5efe8',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedAccountUnblockButtonText: {
    fontSize: Height * 0.018,
    color: '#1C170D',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans',
  },
});