import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { encryptData } from '../../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RecommendedSearchCard from '../SearchComponents/RecommendedSearchCard'


import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const FollowRecommendations = () => {

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
        console.log(data.recommendations)
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
    <View style={styles.mainContainer}>
      <Text style={styles.RecommendationTitle}>Follow To Start Chating:</Text>
      <View style={styles.MainRecommendationContainer}>
        {recommendedUsers.map((user, i) => {
          return (<>
            <RecommendedSearchCard key={i} userId={user.userId} profileImage={user.profileImage} username={user.username}/>
          </>
          )
        })}
      </View>
    </View>
  )
}

export default FollowRecommendations

const styles = StyleSheet.create({
  mainContainer: {
    padding: moderateScale(16),
  },
  RecommendationTitle: {
    fontSize: Height * 0.02,
    fontWeight: '700',
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  MainRecommendationContainer: {
    marginTop: moderateScale(12),
    gap: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },
});