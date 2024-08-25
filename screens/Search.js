import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Height } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import SearchBar from '../components/SearchComponents/SearchBar'
import RecommendedSearchCard from '../components/SearchComponents/RecommendedSearchCard'

import { FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { encryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;




const Search = ({ navigation }) => {

  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [CustomUUID, setCustomUUID] = useState(null);

  AsyncStorage.getItem('CustomUUID').then(CustomUUID => {
    setCustomUUID(CustomUUID);
  })

  const getUserRecommendation = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/getUserRecommendations/${CustomUUID}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status === 200) {
        setRecommendedUsers(data.recommendations);
      }
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    if (CustomUUID && recommendedUsers.length === 0) {
      getUserRecommendation();
    }
  }, [CustomUUID])


  return (
    <View style={styles.Container}>
      <SearchBar title={'Search Account'} onPress={() => { navigation.navigate('SearchAccount') }} />
      {(recommendedUsers.length > 0) && <Text style={styles.SearchRecommendedTitle}>Recommended for you</Text>}
      <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.SearchRecommendedContent}>
        {(recommendedUsers.length > 0) && recommendedUsers.map((user, i) => {
          return (
            <RecommendedSearchCard key={i} userId={user.userId} profileImage={user.profileImage} username={user.username} />
          )
        })}
      </ScrollView>
    </View>
  )
}

export default Search;

const styles = StyleSheet.create({
  Container: {
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
    height: '100%',
  },
  SearchRecommendedContent: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(22),
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
  SearchRecommendedTitle: {
    fontSize: Height * 0.018,
    color: '#49505B',
    fontWeight: '900',
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(16),
    marginHorizontal: moderateScale(16),
  },
});