import { Pressable, StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../utils'
import SearchProfileCard from '../components/SearchComponents/SearchProfileCard'

import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AppContext from '../ContextAPI/AppContext'

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/1476928037';


const RecentSearches = ({ navigation, route }) => {

  const { searches } = route.params;

  const { showAds } = useContext(AppContext);

  const [searchesRecent, setSearchesRecent] = useState([...searches]);


  const removeRecentSearch = async (userId, index) => {
    try {
      const updatedSearches = [...searchesRecent];
      updatedSearches.splice(index, 1);
      setSearchesRecent([...updatedSearches]);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const response = await fetch(`http://192.168.29.8:5000/users/removeRecentSearches/${CustomUUID}/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      if (response.status === 200) {
        console.log('recent search removed');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const clearAllRecentSearches = async () => {
    try {
      setSearchesRecent([]);
      navigation.goBack();
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const CustomUUID = await AsyncStorage.getItem('CustomUUID');
      const response = await fetch(`http://192.168.29.8:5000/users/clearAllRecentSearches/${CustomUUID}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      if (response.status === 200) {
        console.log('recent search removed');
      }
    } catch (error) {
      console.error(error);
    }
  }




  return (
    <View style={styles.RecentSearches}>
      <View style={styles.RecentSearchesNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <Text style={styles.PageTitle}>Recent Searches</Text>
      </View>
      <ScrollView style={styles.SearchAccountMainContent}>
        <View style={styles.MainContentTitleContainer}>
          {searchesRecent.length > 0 &&
            <>
              <Text style={styles.MainContentTitle}>Recent Searches</Text>
              <Pressable onPress={() => { clearAllRecentSearches() }} style={styles.SeeAllButton}>
                <Text style={styles.SeeAllButtonText}>Clear All</Text>
              </Pressable>
            </>}
        </View>
        <View style={styles.SearchCardsContainer}>
          {searchesRecent?.map((search, i) => {
            return (
              <SearchProfileCard key={i} data={search} crossButton={true} removeSearch={() => { removeRecentSearch(userId, i) }} />
            )
          })}
        </View>
      </ScrollView>
      {(!showAds || showAds === false) &&
        <View style={{ position: 'absolute', bottom: 0 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>
      }
    </View>
  )
}

export default RecentSearches;

const styles = StyleSheet.create({
  RecentSearches: {
    height: '100%',
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
  },
  RecentSearchesNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    paddingBottom: moderateScale(10),
    paddingHorizontal: moderateScale(16),
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
  PageTitle: {
    fontSize: Height * 0.026,
    color: '#49505B',
    fontWeight: '900',
  },
  SearchAccountMainContent: {
  },
  MainContentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: moderateScale(16),
    paddingHorizontal: moderateScale(16),
  },
  MainContentTitle: {
    fontSize: Height * 0.018,
    fontWeight: '900',
    color: '#49505B',
  },
  SeeAllButton: {},
  SeeAllButtonText: {
    fontSize: Height * 0.016,
    fontWeight: '600',
    color: '#F7706E',
  },
  SearchCardsContainer: {
    gap: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
});