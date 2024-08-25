import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React, { useState } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RecommendedSearchCard = ({ userId, profileImage, username }) => {

  const navigation = useNavigation();
  const [CustomUUID, setCustomUUID] = useState(null);

  AsyncStorage.getItem('CustomUUID').then(CustomUUID => {
    setCustomUUID(CustomUUID);
  })


  return (
    <Pressable onPress={() => {
      if (CustomUUID === userId) {
        navigation.navigate('AccountStack', { screen: 'Account' })
      } else {
        navigation.navigate('SearchStack', { screen: 'Account', params: { CustomUUID: userId } })
      }
    }} style={styles.RecommendedSearchCard}>
      <View style={styles.ProfileImageContainer}>
        {profileImage ?
          <Image source={{ uri: profileImage }} style={styles.ProfileImage} />
          : <Image source={require('../../assets/Images/User.png')} style={styles.ProfileImage} />}
      </View>
      <Text style={styles.ProfileName}>{username}</Text>
    </Pressable>
  )
}

export default RecommendedSearchCard

const styles = StyleSheet.create({
  RecommendedSearchCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4),
  },
  ProfileImageContainer: {
    height: moderateScale(70),
    width: moderateScale(70),
  },
  ProfileImage: {
    height: '100%',
    width: '100%',
    borderRadius: moderateScale(100),
  },
  ProfileActivityIndicator: {
    position: 'absolute',
    backgroundColor: '#1DD75B',
    height: moderateScale(12),
    width: moderateScale(12),
    borderRadius: moderateScale(100),
    borderWidth: moderateScale(1),
    borderColor: '#fff',
    top: '80%',
    left: '75%',
  },
  ProfileName: {
    fontSize: Height * 0.016,
    fontWeight: '700',
    color: '#1b160b',
    fontFamily: 'PlusJakartaSans',
  },
});