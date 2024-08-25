import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { Height } from '../../utils/constants'

const FollowingInfo = ({ UserCustomUUID, CurrentUserData, mutualFriends }) => {

  const navigation = useNavigation();

  return (
    <View style={styles.ProfileFollowingInfo}>
      {UserCustomUUID &&
        <Pressable onPress={() => {
          navigation.navigate('FriendsInfo', {
            userId: CurrentUserData?.userId,
            mutualFriends: mutualFriends,
            username: CurrentUserData.username,
            name: CurrentUserData.name,
            profileImage: CurrentUserData.profileImage
          })
        }} style={styles.FollowingCommonButton}>
          <Text style={styles.FollowingButtonsText}>{mutualFriends ? `${mutualFriends.length} mutual friends,` : '0 mutual friends,'}</Text>
        </Pressable>}


      <Pressable onPress={() => {
        navigation.navigate('FriendsInfo', {
          userId: CurrentUserData?.userId,
          mutualFriends: mutualFriends,
          username: CurrentUserData.username,
          name: CurrentUserData.name,
          profileImage: CurrentUserData.profileImage
        })
      }} style={styles.FollowingChatmatesButton}>
        {CurrentUserData?.chatmateCount ?
          <Text style={styles.FollowingButtonsText}>{`${CurrentUserData?.chatmateCount} friends`}</Text>
          : <Text style={styles.FollowingButtonsText}>0 friends</Text>}
      </Pressable>




    </View>
  )
}

export default FollowingInfo

const styles = StyleSheet.create({
  ProfileFollowingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4),
  },
  FollowingCommonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  FollowingChatmatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  FollowingButtonsText: {
    fontSize: Height * 0.018,
    color: '#9095A0',
    fontFamily: 'PlusJakartaSans',
  },
});