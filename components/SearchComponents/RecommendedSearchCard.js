import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'
import { useNavigation } from '@react-navigation/native'

const RecommendedSearchCard = ({ userId, profileImage, username }) => {

  const navigation = useNavigation();


  return (
    <Pressable onPress={() => { navigation.navigate('Account', { CustomUUID: userId }); }} style={styles.RecommendedSearchCard}>
      <View style={styles.ProfileImageContainer}>
        <Image source={{ uri: profileImage }} style={styles.ProfileImage} />
        {/* <View style={styles.ProfileActivityIndicator} /> */}
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
    fontSize: Height * 0.015,
    color: '#9095A0',
    fontWeight: '600',
  },
});