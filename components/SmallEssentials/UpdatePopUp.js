import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'

const UpdatePopUp = () => {
  return (
    <View style={styles.MainContainer}>
      <View style={styles.MainContent}>
        <Text style={styles.MainHeading}>
          New Update is Available
        </Text>
        <Text style={styles.SecondaryHeading}>
          It seems you're using an older app version.
        </Text>
        <Text style={styles.SecondaryHeading}>
          Update for the newest features and experience.
        </Text>
        <Pressable onPress={() => { Linking.openURL('https://play.google.com/store/apps/details?id=com.nucletic.locbridge&hl=en') }} style={styles.UpdateButton}>
          <Text style={styles.UpdateButtonText}>GET UPDATE NOW</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default UpdatePopUp

const styles = StyleSheet.create({
  MainContainer: {
    backgroundColor: '#00000099',
    height: Height,
    width: Width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  MainContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(25),
    height: '22%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  MainHeading: {
    fontSize: Height * 0.026,
    fontWeight: '600',
    color: '#49505B',
    marginBottom: moderateScale(10),
  },
  SecondaryHeading: {
    fontSize: Height * 0.016,
    fontWeight: '400',
    color: '#9095A0'
  },
  UpdateButton: {
    borderRadius: moderateScale(50),
    width: '90%',
    height: moderateScale(45),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7706E',
    marginTop: moderateScale(24),
  },
  UpdateButtonText: {
    fontSize: Height * 0.018,
    fontWeight: '500',
    color: '#fff',
  },
});