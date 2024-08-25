import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native';
import { moderateScale } from 'react-native-size-matters';
import { Height } from '../../utils';

const NoUserFoundAnimation = ({ titleText }) => {

  let runAnimation;
  useEffect(() => {
    runAnimation.play();
  }, [runAnimation]);


  return (
    <View style={styles.MainContainer}>
      <LottieView autoPlay loop
        ref={(animation) => {
          runAnimation = animation
        }} colorFilters={[{
          keypath: 'Comp 1.',
          color: '#f5efe8'
        }]} style={{
          width: moderateScale(140),
          height: moderateScale(140),
        }} source={require('../../assets/Animations/NoUserFoundAnimation.json')} />
      <Text style={styles.NoUserFoundText}>{titleText && titleText}</Text>
    </View>
  )
}

export default NoUserFoundAnimation;

const styles = StyleSheet.create({
  MainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  NoUserFoundText: {
    textAlign: 'center',
    color: '#49505B',
    marginLeft: moderateScale(14),
    fontWeight: '600',
    fontSize: Height * 0.02,
  },
});