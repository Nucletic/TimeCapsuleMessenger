import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native';
import { moderateScale } from 'react-native-size-matters';

const LoaderAnimation = ({ size, color }) => {

  let runAnimation;
  useEffect(() => {
    runAnimation.play();
  }, [runAnimation]);


  return (
    <LottieView autoPlay loop
      ref={(animation) => {
        runAnimation = animation
      }} colorFilters={[{
        keypath: 'å½¢ç¶å¾å± 2',
        color: color ? color : '#fff'
      }]} style={{
        width: moderateScale(size),
        height: moderateScale(size),
      }} source={require('../../assets/Animations/WhiteLoadingAnimation.json')} />
  )
}

export default LoaderAnimation

const styles = StyleSheet.create({});