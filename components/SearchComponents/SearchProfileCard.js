import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils'
import { useNavigation } from '@react-navigation/native'

import { FIREBASE_AUTH } from '../../firebaseConfig'
import { encryptData, decryptData } from '../../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const SearchProfileCard = ({ data, crossButton, removeSearch }) => {

  const navigation = useNavigation();

  const addRecentSearch = async () => {
    try {
      navigation.navigate('Account', { CustomUUID: data.userId });
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const response = await fetch(`http://192.168.29.8:5000/users/addRecentSearches/${CustomUUID}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: data.username, name: data.name, profileImage: data.profileImage, userId: data.userId })
      })
      if (response.status === 200) {
        console.log('recent search added');
      }
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <Pressable onPress={() => { addRecentSearch() }} style={styles.SearchProfileCardButton}>
      <View style={styles.SearchProfileCardButtonLeft}>
        {data && <Image source={{ uri: data.profileImage }} style={styles.SearchProfileCardButtonImage} />}
        <View style={styles.SearchProfileDetails}>
          <Text style={styles.SearchProfileDetailsTextOne}>{data && data.username}</Text>
          <Text style={styles.SearchProfileDetailsTextTwo}>{data && data.name}</Text>
        </View>
      </View>
      {crossButton &&
        <Pressable onPress={() => { removeSearch() }} style={styles.SearchProfileCardButtonRight}>
          <Image source={require('../../assets/Icons/RecentUserRemoveButton.png')} style={styles.SearchProfileCardButtonRightImage} />
        </Pressable>}
    </Pressable>
  )
}

export default SearchProfileCard

const styles = StyleSheet.create({
  SearchProfileCardButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  SearchProfileCardButtonImage: {
    height: moderateScale(45),
    width: moderateScale(45),
    borderRadius: moderateScale(100),
  },
  SearchProfileCardButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
  },
  SearchProfileDetailsTextOne: {
    color: '#2F3237',
    fontSize: Height * 0.016,
    fontWeight: '500',
  },
  SearchProfileDetailsTextTwo: {
    color: '#9095A0',
    fontSize: Height * 0.016,
    fontWeight: '500',
  },
  SearchProfileCardButtonRight: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  SearchProfileCardButtonRightImage: {
    height: '100%',
    width: '100%',
  },
});