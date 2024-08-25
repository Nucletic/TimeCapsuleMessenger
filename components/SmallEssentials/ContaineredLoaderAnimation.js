import { StyleSheet, View } from 'react-native'
import React from 'react'
import LoaderAnimation from './LoaderAnimation'

const ContaineredLoaderAnimation = () => {
  return (
    <View style={styles.LoadingContainer}>
      <LoaderAnimation size={40} color={'#49505B'} />
    </View>
  )
}

export default ContaineredLoaderAnimation

const styles = StyleSheet.create({
  LoadingContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});