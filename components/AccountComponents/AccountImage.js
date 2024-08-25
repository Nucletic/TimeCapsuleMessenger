import { StyleSheet, View, Image } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'

const AccountImage = ({ CurrentUserData }) => {
  return (
    <View style={styles.ProfileImagesContainer}>
      {CurrentUserData &&
        <>
          {CurrentUserData?.bannerImage ?
            <Image source={{ uri: CurrentUserData.bannerImage }} style={styles.ProfileBannerImage} />
            : <Image source={require('../../assets/Images/RegistrationBackground.jpg')} style={styles.ProfileBannerImage} />}

          {CurrentUserData?.profileImage ?
            <Image source={{ uri: CurrentUserData.profileImage }} style={styles.ProfileImage} />
            : <Image source={require('../../assets/Images/User.png')} style={styles.ProfileImage} />}
        </>
      }
    </View>
  )
}

export default AccountImage

const styles = StyleSheet.create({
  ProfileImagesContainer: {
    height: moderateScale(220),
    width: '100%',
    alignItems: 'center',
  },
  ProfileBannerImage: {
    height: moderateScale(160),
    width: '100%',
  },
  ProfileImage: {
    position: 'absolute',
    height: moderateScale(120),
    width: moderateScale(120),
    borderRadius: moderateScale(120),
    top: '45%',
    borderWidth: moderateScale(2),
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
});