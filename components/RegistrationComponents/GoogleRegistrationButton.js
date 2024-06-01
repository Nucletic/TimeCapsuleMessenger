import { Image, Pressable, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height, Width } from '../../utils';

const GoogleRegistrationButton = ({ title, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.InputContainer}>
      <Text style={styles.ButtonText}>{title}</Text>
      <Image source={require('../../assets/Images/GoogleRegistration.png')} style={styles.ButtonImage} />
    </Pressable>
  )
}

export default GoogleRegistrationButton;

const styles = StyleSheet.create({
  InputContainer: {
    backgroundColor: '#fff',
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(12),
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    height: moderateScale(45),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(16),
  },
  ButtonText: {
    color: '#9095A0',
    fontSize: Height * 0.020,
  },
  ButtonImage: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
});