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
    fontSize: Height * 0.022,
    color: '#1C170D',
    fontWeight: '700',
    paddingHorizontal: moderateScale(16),
    paddingVertical: (6),
  }
});