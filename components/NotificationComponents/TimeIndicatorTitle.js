import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'

const TimeIndicatorTitle = ({ titleText }) => {
  return (
    <Text style={styles.TimeIndicatorTitle}>{titleText && titleText}</Text>
  )
}

export default TimeIndicatorTitle

const styles = StyleSheet.create({
  TimeIndicatorTitle: {
    fontSize: Height * 0.017,
    color: '#9095A0',
    paddingHorizontal: moderateScale(16),
    paddingVertical: (4),
    backgroundColor: '#F3F4F6',
  }
});