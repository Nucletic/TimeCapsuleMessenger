import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React, { useContext } from 'react'
import { moderateScale } from 'react-native-size-matters';


import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AppContext from '../ContextAPI/AppContext';

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/7353685640';


const ImageShow = ({ navigation, route }) => {

  const { uri } = route.params;

  const { showAds } = useContext(AppContext);

  return (
    <View styles={styles.ImageShowContainer}>
      <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
        <Image source={require('../assets/Icons/BackButtonWhite.png')} style={styles.BackButtonImage} />
      </Pressable>
      {uri && <Image source={{ uri: uri }} style={styles.MainImage} />}
      {(!showAds || showAds === false) &&
        <View style={{ position: 'absolute', bottom: 0 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>}
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