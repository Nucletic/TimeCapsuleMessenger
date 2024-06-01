import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height, Width } from '../../utils';
import LoaderAnimation from '../SmallEssentials/LoaderAnimation';

const SubmitButton = ({ loading, onPress, title, titleTwo, ButtonText, underOnPress }) => {
  return (
    <View style={styles.SubmitButton}>
      <Pressable onPress={onPress} style={styles.MainSubmitButton}>
        {!loading ?
          <Text style={styles.SubmitButtonText}>{title}</Text>
          : <LoaderAnimation size={30} />}
      </Pressable>
      {(titleTwo && ButtonText) &&
        <View style={styles.underSubmitView}>
          <Text style={styles.underSubmitText}>{titleTwo}</Text>
          <Pressable onPress={underOnPress} style={styles.underSubmitButton}>
            <Text style={styles.underSubmitButtonText}>{ButtonText}</Text>
          </Pressable>
        </View>}
    </View>
  )
}

export default SubmitButton;

const styles = StyleSheet.create({
  SubmitButton: {
    marginTop: moderateScale(35),
    width: '100%',
    alignItems: 'center',
  },
  MainSubmitButton: {
    height: moderateScale(45),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7706E',
    borderRadius: moderateScale(40),
  },
  SubmitButtonText: {
    fontSize: Height * 0.026,
    color: '#fff',
    fontWeight: '900',
  },
  underSubmitView: {
    flexDirection: 'row',
    gap: moderateScale(6),
    marginTop: moderateScale(6),
  },
  underSubmitText: {
    fontSize: Height * 0.017,
    color: '#9095A0',
  },
  underSubmitButtonText: {
    fontSize: Height * 0.017,
    color: '#F7706E',
    fontWeight: '900',
  },
});