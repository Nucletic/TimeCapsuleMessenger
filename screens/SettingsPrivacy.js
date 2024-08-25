import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'



const SettingsPrivacy = ({ navigation }) => {

  

  return (
    <View style={styles.Container}>
      <View style={styles.SettingsPrivacyNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <Text style={styles.PageTitle}>Settings and Privacy</Text>
      </View>
      <View style={styles.MainContent}>
        <Pressable onPress={() => { navigation.navigate('EditProfile') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <View style={styles.IconBackground}>
              <Image source={require('../assets/Icons/animeIcons/pencilDark.png')} style={styles.SettingsOptionButtonImage} />
            </View>
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Edit Profile</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Name, username, profile picture, bio, etc</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/animeIcons/ChevronRight.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
        <Pressable onPress={() => { navigation.navigate('AccountPrivacy') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <View style={styles.IconBackground}>
              <Image source={require('../assets/Icons/animeIcons/Lock.png')} style={styles.SettingsOptionButtonImage} />
            </View>
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Account Privacy</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Who can see you</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/animeIcons/ChevronRight.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
        <Pressable onPress={() => { navigation.navigate('BlockedAccounts') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <View style={styles.IconBackground}>
              <Image source={require('../assets/Icons/animeIcons/Blocked.png')} style={styles.SettingsOptionButtonImage} />
            </View>
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Blocked</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Blocked Accounts</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/animeIcons/ChevronRight.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
        <Pressable onPress={() => { navigation.navigate('Subscribe') }} style={styles.SettingsOptionButton}>
          <View style={styles.SettingsOptionButtonLeft}>
            <View style={styles.IconBackground}>
              <Image source={require('../assets/Icons/animeIcons/Membership.png')} style={styles.SettingsOptionButtonImage} />
            </View>
            <View style={styles.SettingsOptionDetails}>
              <Text style={styles.SettingsOptionDetailsTextOne}>Block Ads For Free</Text>
              <Text style={styles.SettingsOptionDetailsTextTwo}>Watch 15 ads and go Ad Free For a month</Text>
            </View>
          </View>
          <Image source={require('../assets/Icons/animeIcons/ChevronRight.png')} style={styles.SettingsOptionButtonLeftArrow} />
        </Pressable>
      </View>
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
    color: '#1C170D',
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
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
  IconBackground: {
    backgroundColor: '#f5efe8',
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  SettingsOptionButtonImage: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  SettingsOptionButtonLeftArrow: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  SettingsOptionDetailsTextOne: {
    fontSize: Height * 0.018,
    color: '#1C170D',
    fontFamily: 'PlusJakartaSans',
  },
  SettingsOptionDetailsTextTwo: {
    fontSize: Height * 0.015,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
});