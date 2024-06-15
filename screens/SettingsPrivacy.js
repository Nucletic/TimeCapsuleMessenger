import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import AppContext from '../ContextAPI/AppContext'


import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/4350503386';


const SettingsPrivacy = ({ navigation }) => {

  const { showAds } = useContext(AppContext);


  return (
    <View style={styles.Container}>
      <View style={styles.SettingsPrivacyNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <Text style={styles.PageTitle}>Settings and Privacy</Text>
      </View>
      <View style={styles.MainContent}>
        <Pressable onPress={() => { navigation.navigate('EditProfile') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <Image source={require('../assets/Icons/EditProfileIcon.png')} style={styles.SettingsOptionButtonImage} />
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Edit Profile</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Name, username, profile picture, bio, interests</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/RightChevron.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
        <Pressable onPress={() => { navigation.navigate('AccountPrivacy') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <Image source={require('../assets/Icons/AccountPrivacyIcon.png')} style={styles.SettingsOptionButtonImage} />
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Account Privacy</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Who can see you</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/RightChevron.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
        <Pressable onPress={() => { navigation.navigate('BlockedAccounts') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <Image source={require('../assets/Icons/BlockedUsersIcon.png')} style={styles.SettingsOptionButtonImage} />
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Blocked</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Blocked Accounts</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/RightChevron.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
        <Pressable onPress={() => { navigation.navigate('Subscribe') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <Image source={require('../assets/Icons/Member.png')} style={styles.SettingsOptionButtonImage} />
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Block Ads For Free</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Watch 15 ads and go Ad Free For a month</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/RightChevron.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
      </View>
      {(!showAds || showAds === false) &&
        <View style={{ position: 'absolute', bottom: 0 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>}
    </View>
  )
}

export default SettingsPrivacy;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  SettingsPrivacyNav: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
    gap: moderateScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
  PageTitle: {
    fontSize: Height * 0.026,
    color: '#49505B',
    fontWeight: '900',
  },
  MainContent: {
    padding: moderateScale(16),
    gap: moderateScale(21),
  },
  SettingsOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  SettingsOptionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(10),
  },
  SettingsOptionButtonImage: {
    height: moderateScale(34),
    width: moderateScale(34),
  },
  SettingsOptionButtonLeftArrow: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  SettingsOptionDetailsTextOne: {
    fontSize: Height * 0.016,
    color: '#49505B',
  },
  SettingsOptionDetailsTextTwo: {
    fontSize: Height * 0.013,
    color: '#9095A0',
  },
});