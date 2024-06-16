import { Pressable, Image, StyleSheet, Text, View, ScrollView, TextInput } from 'react-native'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import BlockedAccountCard from '../components/BlockedAccountComponents/BlockedAccountCard'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import ConfirmationPrompt from '../components/SmallEssentials/ConfirmationPrompt'
import NoUserFoundAnimation from '../components/SmallEssentials/NoUserFoundAnimation'

import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;




import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AppContext from '../ContextAPI/AppContext'

const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/7457627420';





const BlockedAccounts = ({ navigation }) => {


  const { showAds } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState(null);
  const [unblockingUser, setUnblockingUser] = useState(null);
  const [showConfirmationPrompt, setShowConfirmationPrompt] = useState(false);

  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const getBlockedAccounts = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/getBlockedAccounts`, {
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
        setAccounts(data.accounts);
        setSearchResults(data.accounts);
        setUnblockingUser(null);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }


  const unblockUser = async (userId) => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/unblockUser/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status === 200) {
        setShowConfirmationPrompt(false);
        getBlockedAccounts();
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getConfirmation = (index) => {
    setUnblockingUser(searchResults[index]);
    setShowConfirmationPrompt(true);
  }

  useEffect(() => {
    getBlockedAccounts();
  }, [])

  useEffect(() => {
    if (accounts) {
      const filteredAccounts = accounts.filter(account => account.username.toLowerCase().includes(searchQuery.toLowerCase()));
      setSearchResults(filteredAccounts);
    }
  }, [searchQuery]);




  return (
    <View style={styles.Container}>
      <View style={styles.SettingsPrivacyNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <Text style={styles.PageTitle}>Blocked Accounts</Text>
      </View>
      <Pressable style={styles.SearchBox}>
        <View style={styles.MainSearchBoxContainer}>
          <Image source={require('../assets/Icons/Search.png')} style={styles.MainSearchBoxIcon} />
          <TextInput ref={inputRef} style={styles.MainSearchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder='Search Blocked Accounts' placeholderTextColor={'#c3c3c3'} />
        </View>
      </Pressable>
      {loading ?
        <View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View> :
        <ScrollView contentContainerStyle={styles.MainContent}>
          {searchResults.length > 0 ? (searchResults?.map((account, index) => {
            return (
              <BlockedAccountCard key={index} profileImage={account.profileImage} username={account.username} onPress={() => { getConfirmation(index) }} userId={account.userId} />
            )
          })) :
            (<NoUserFoundAnimation titleText={`No Blocked Users found${searchQuery && ` with "${searchQuery}"`}`} />)}
        </ScrollView>}
      <ConfirmationPrompt showConfirmationPrompt={showConfirmationPrompt} TitleText={`Are you sure you wants to unblock ${unblockingUser?.username}?`}
        onPressOne={() => { setShowConfirmationPrompt(false) }} onPressTwo={() => { unblockUser(unblockingUser.userId) }} OneText={'Cancel'} TwoText={'Unblock'} />
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

export default BlockedAccounts;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  SettingsPrivacyNav: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
    gap: moderateScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
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
  MainContent: {
    padding: moderateScale(16),
    gap: moderateScale(21),
  },
  SearchBox: {
    padding: moderateScale(16),
    backgroundColor: '#F8F9FA',
  },
  MainSearchBoxContainer: {
    borderWidth: moderateScale(1),
    borderColor: '#49505B',
    borderRadius: moderateScale(6),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    paddingHorizontal: moderateScale(5),
    paddingVertical: moderateScale(3),
  },
  MainSearchBoxIcon: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  MainSearchBoxText: {
    color: '#C3C3C3',
    fontSize: Height * 0.016,
  },
  MainSearchInput: {
    width: '90%'
  },
  LoadingContainer: {
    height: Height - moderateScale(240),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});