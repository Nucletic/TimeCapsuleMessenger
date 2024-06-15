import { StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native';
import { moderateScale } from 'react-native-size-matters';

const ProfileLoaderAnimation = () => {


  let runAnimation;
  useEffect(() => {
    runAnimation.play();
  }, [runAnimation]);


  return (
    <LottieView autoPlay loop
      ref={(animation) => {
        runAnimation = animation
      }} colorFilters={[{
        keypath: 'ContactsStatus1',
        color: '#fff'
      }]} style={{
        width: '100%',
        // height: 100%,
      }} source={require('../../assets/Animations/ProfileLoading.json')} />
  )
}

export default ProfileLoaderAnimation

const styles = StyleSheet.create({});