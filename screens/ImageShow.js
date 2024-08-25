import { StyleSheet, View, Pressable, Image } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters';


const ImageShow = ({ navigation, route }) => {

  const { uri } = route.params;

  return (
    <View styles={styles.ImageShowContainer}>
      <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
        <Image source={require('../assets/Icons/BackButtonWhite.png')} style={styles.BackButtonImage} />
      </Pressable>
      {uri && <Image source={{ uri: uri }} style={styles.MainImage} />}
    </View>
  )
}

export default ImageShow;

const styles = StyleSheet.create({
  MainImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
    marginHorizontal: moderateScale(16),
    position: 'absolute',
    marginTop: moderateScale(30),
    zIndex: 1,
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
});