import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { Height } from '../../utils/constants'
import { moderateScale } from 'react-native-size-matters'

const AccountNav = ({ UserCustomUUID, username, setSettingSheetOpen }) => {

  const navigation = useNavigation();

  return (
    <View style={styles.AccountNav}>
      <View style={styles.AccountNavLeft}>
        {UserCustomUUID &&
          <Pressable onPress={() => { navigation.goBack(); }} style={styles.BackButton}>
            <Image source={require('../../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
          </Pressable>}
        <Text style={styles.PageTitle}>{username}</Text>
      </View>
      <Pressable onPress={() => { setSettingSheetOpen(true) }} style={styles.SettingsButton}>
        <Image source={require('../../assets/Icons/SettingsMenuButton.png')} style={styles.SettingsButtonImage} />
      </Pressable>
    </View>
  )
}

export default AccountNav

const styles = StyleSheet.create({
  AccountNav: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  AccountNavLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(10),
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
  SettingsButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  SettingsButtonImage: {
    height: '100%',
    width: '100%'
  },
});