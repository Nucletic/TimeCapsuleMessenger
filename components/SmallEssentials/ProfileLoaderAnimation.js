import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native';
import { Width } from '../../utils/constants';

const ProfileLoaderAnimation = () => {

  let runAnimation;
  useEffect(() => {
    runAnimation.play();
  }, [runAnimation]);


  return (
    <View style={styles.ProfileLoaderContainer}>
      <LottieView autoPlay loop
        ref={(animation) => {
          runAnimation = animation
        }} colorFilters={[{
          keypath: 'ContactsStatus1',
          color: '#fff'
        }]} style={{
          width: '100%',
        }} source={require('../../assets/Animations/ProfileLoading.json')} />
    </View>
  )
}

export default ProfileLoaderAnimation

const styles = StyleSheet.create({
  ProfileLoaderContainer: {
    width: Width,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
});