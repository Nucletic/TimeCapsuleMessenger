import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LoaderAnimation from './LoaderAnimation'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'

const SavingProfileLoader = () => {
  return (
    <View style={styles.AnimationContainer}>
      <LoaderAnimation size={40} />
    </View>
  )
}

export default SavingProfileLoader

const styles = StyleSheet.create({
  AnimationContainer: {
    position: 'absolute',
    height: Height,
    width: Width,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});