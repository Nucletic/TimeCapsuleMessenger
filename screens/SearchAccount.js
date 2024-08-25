import { StyleSheet, Text, View, Image, TextInput, Pressable, Keyboard, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { moderateScale } from 'react-native-size-matters';
import { Height, Width } from '../utils';
import SearchProfileCard from '../components/SearchComponents/SearchProfileCard';
import { FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { getDocs, collection, query, where } from 'firebase/firestore';
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation';
import NoUserFoundAnimation from '../components/SmallEssentials/NoUserFoundAnimation';
import { encryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const SearchAccount = ({ navigation }) => {
  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noUserFound, setNoUserFound] = useState(false);
  const [searches, setSearches] = useState([]);
  const [CustomUUID, setCustomUUID] = useState(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  AsyncStorage.getItem('CustomUUID').then(CustomUUID => {
    setCustomUUID(CustomUUID);
  })

  useEffect(() => {
    if (CustomUUID) {
      const fetchSearchResults = async () => {
        try {
          setLoading(true);
          const q = query(
            collection(FIREBASE_DB, 'users'),
            where('username', '>=', searchQuery.trim()),
            where('username', '<=', searchQuery.trim() + '\uf8ff'),
            where('privateAccount', '==', false),
          );


          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(doc => !doc.blockedUsers.includes(CustomUUID) && doc.userId !== CustomUUID);

          if (data.length === 0) {
            setNoUserFound(true);
          } else {
            setNoUserFound(false);
            setSearchResults(data);
          }
          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      };

      if (searchQuery.trim() !== '') {
        fetchSearchResults();
      } else {
        setNoUserFound(false);
        setSearchResults([]);
      }
    }
  }, [searchQuery]);


  const getRecentSearch = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/getRecentSearches/${CustomUUID}`, {
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
        setSearches(data.recentSearches);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }


  const removeRecentSearch = async (userId, index) => {
    try {
      const updatedSearches = [...searches];
      updatedSearches.splice(index, 1);
      setSearches([...updatedSearches]);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/removeRecentSearches/${CustomUUID}/${userId}`, {
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

  useFocusEffect(
    useCallback(() => {
      if (CustomUUID) {
        getRecentSearch();
      }
    }, [CustomUUID])
  );

  return (
    <View style={styles.SearchAccount}>
      <View style={styles.SearchAccountNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <View style={styles.SearchContainer}>
          <Image source={require('../assets/Icons/animeIcons/SearchIcon.png')} style={styles.SearchIcon} />
          <TextInput ref={inputRef} style={styles.SearchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder='Search account' placeholderTextColor={'#a3814a'} />
        </View>
      </View>
      <Pressable onPress={Keyboard.dismiss} style={styles.SearchAccountMainContent}>
        {(loading && searchQuery.length > 0) ?
          (<View style={styles.LoadingContainer}>
            <LoaderAnimation size={40} color={'#49505B'} />
          </View>) :
          (<>
            {searchResults.length > 0 ?
              (<View style={styles.MainContentTitleContainer}>
                <Text style={styles.MainContentTitle}>Search Results</Text>
              </View>) :
              (<View style={styles.MainContentTitleContainer}>
                {(searches.length > 0 && !loading) &&
                  <>
                    <Text style={styles.MainContentTitle}>Recent Searches</Text>
                    <Pressable onPress={() => { navigation.navigate('RecentSearches', { searches }); }} style={styles.SeeAllButton}>
                      <Text style={styles.SeeAllButtonText}>See All</Text>
                    </Pressable>
                  </>
                }
              </View>)
            }
            <ScrollView contentContainerStyle={styles.SearchResultContent}>
              {searchQuery.trim().length === 0 && searches?.slice(0, 3).map((search, i) => {
                return (
                  <SearchProfileCard key={i} data={search} crossButton={true} removeSearch={() => { removeRecentSearch(search.userId, i) }} />
                )
              })}
              {searchQuery.trim().length !== 0 && searchResults.length === 0 && noUserFound ? (
                <NoUserFoundAnimation titleText={`No Users found${searchQuery && ` with "${searchQuery.trim()}"`}`} />
              ) : (
                searchResults.map((result) => (
                  <SearchProfileCard key={result.id} data={result} crossButton={false} />
                ))
              )}
            </ScrollView>
          </>)}
      </Pressable>
    </View>
  )
}

export default SearchAccount;

const styles = StyleSheet.create({
  SearchAccount: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
    height: '100%',
  },
  SearchAccountNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30)
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
  SearchContainer: {
    paddingHorizontal: moderateScale(8),
    gap: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    height: moderateScale(40),
    backgroundColor: '#f5efe8',
    borderRadius: moderateScale(12),
    width: Width - moderateScale(32) - moderateScale(10) - moderateScale(30)
  },
  SearchIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  SearchInput: {
    fontSize: Height * 0.019,
    width: '90%',
  },
  SearchResultContent: {
    gap: moderateScale(16),
    paddingTop: moderateScale(16),
  },
  SearchAccountMainContent: {
  },
  MainContentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: moderateScale(12),
  },
  MainContentTitle: {
    fontSize: Height * 0.018,
    fontWeight: '900',
    color: '#1b160b',
  },
  SeeAllButton: {},
  SeeAllButtonText: {
    fontSize: Height * 0.016,
    fontWeight: '600',
    color: '#A1824A',
  },
  SearchCardsContainer: {
    gap: moderateScale(12),
  },
  LoadingContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});