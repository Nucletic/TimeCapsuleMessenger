import { Image, Pressable, StyleSheet, Text, View, Animated, ScrollView, TextInput, FlatList } from 'react-native'
import React, { useRef, useState, useEffect, useContext } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height, Width } from '../utils';
import FriendsInfoMateCard from '../components/AccountComponents/FriendsInfoMateCard';
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import NoUserFoundAnimation from '../components/SmallEssentials/NoUserFoundAnimation';
import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'


import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

import FilterAllUnread from '../components/SmallEssentials/FilterAllUnread';

const FriendsInfo = ({ navigation, route }) => {

  

  const { userId, mutualFriends, username, profileImage, name } = route.params;

  const [chatmates, setChatmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownCustomUUID, setOwnCustomUUID] = useState(true);

  AsyncStorage.getItem('CustomUUID').then((CustomUUID) => {
    setOwnCustomUUID(CustomUUID);
  });

  const FriendsInfoTabs = [<MainContentOne chatmates={chatmates} ownCustomUUID={ownCustomUUID} />,
  <MainContentTwo chatmates={mutualFriends} ownCustomUUID={ownCustomUUID} />];

  const scrollX = useRef(new Animated.Value(0)).current;

  const indicatorPosition = scrollX.interpolate({
    inputRange: [0, Width],
    outputRange: [0, Width / 2],
    extrapolate: 'clamp',
  });
  const flatListRef = useRef(null);

  const handleTabPress = (index) => {
    Animated.timing(scrollX, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
    flatListRef.current.scrollToIndex({ index });
  };


  const fetchChatmates = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/getChatmates/${userId}`, {
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
        setChatmates(data.chatmates);
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  useEffect(() => {
    fetchChatmates();
  }, [])


  return (
    <View style={styles.Container}>
      <View style={styles.FriendsInfoNav}>
        <Pressable onPress={() => { navigation.goBack(); }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <View style={styles.FriendsNavDetails}>
          <Image source={{ uri: profileImage }} style={styles.FriendsNavDetailsImage} />
          <Text style={styles.FriendsNavDetailsName}>{username && username}</Text>
        </View>
        <View style={styles.MockElementOne} />
      </View>
      {(loading) ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>) :
        (<>
          <FilterAllUnread firstFuncText={`${chatmates?.length} Chatmates`} secondFuncText={`${mutualFriends ? mutualFriends?.length : 0} Common Mates`}
            onAllPress={() => handleTabPress(0)} onUnreadPress={() => handleTabPress(1)} />
          <Animated.FlatList horizontal pagingEnabled ref={flatListRef}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            bounces={false} showsHorizontalScrollIndicator={false}
            data={FriendsInfoTabs} contentContainerStyle={styles.MainContent} renderItem={(({ item }) => {
              return (
                item
              )
            })} />
        </>)}
    </View>
  )
}

const MainContentOne = ({ chatmates, ownCustomUUID }) => {

  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(0);


  useEffect(() => {
    setLoading(true);
    if (chatmates && chatmates.length > 0) {
      const filteredChatmates = chatmates.filter(chatmate => chatmate.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setSearchResults(filteredChatmates);
    }
    setLoading(false);
    setLevel(0)
  }, [searchQuery, chatmates]);




  return (
    <View style={styles.MainContentOne}>
      <View style={styles.FriendsInfoSearch}>
        <View style={styles.FriendsInfoSearchView}>
          <Image source={require('../assets/Icons/animeIcons/SearchIcon.png')} style={styles.FriendsInfoSearchViewIcon} />
          <TextInput ref={inputRef} placeholder='Search Chatmates' value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={'#A1824A'} style={styles.FriendsInfoSearchInput} />
        </View>
      </View>
      {(loading) ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>) :
        (<View style={styles.MainContentCards}>

          {(level !== searchResults.length && searchQuery.length === 0) &&
            <Image source={require('../assets/Animations/LoadingFriendsInfo.gif')} style={styles.loadingFriendsInfoGIF} />}
          {searchResults?.length > 0 ? (searchResults?.map((chatmate, index) => {
            return (
              <FriendsInfoMateCard key={index} setLevel={setLevel} ownCustomUUID={ownCustomUUID} username={chatmate.username} name={chatmate.name} profileImage={chatmate.profileImage} userId={chatmate.userId} />
            )
          }))
            : (<NoUserFoundAnimation titleText={`No Chatmates found${searchQuery && ` with "${searchQuery}"`}`} />)}
        </View>)}
    </View>
  )
}
const MainContentTwo = ({ chatmates, ownCustomUUID }) => {

  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [level, setLevel] = useState(0);

  useEffect(() => {
    setLoading(true);
    if (chatmates && chatmates.length > 0) {
      const filteredChatmates = chatmates.filter(chatmate => chatmate.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setSearchResults(filteredChatmates);
    }
    setLoading(false);
    setLevel(0)
  }, [searchQuery, chatmates]);




  return (
    <View style={styles.MainContentOne}>
      <View style={styles.FriendsInfoSearch}>
        <View style={styles.FriendsInfoSearchView}>
          <Image source={require('../assets/Icons/Search.png')} style={styles.FriendsInfoSearchViewIcon} />
          <TextInput ref={inputRef} placeholder='Search Mutual Chatmates' value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={'#A1824A'} style={styles.FriendsInfoSearchInput} />
        </View>
      </View>
      {(loading) ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>) :
        (<View style={styles.MainContentCards}>
          {(level !== searchResults.length && searchQuery.length === 0) &&
            <Image source={require('../assets/Animations/LoadingFriendsInfo.gif')} style={styles.loadingFriendsInfoGIF} />}
          {searchResults?.length > 0 ? (searchResults?.map((chatmate, index) => {
            return (
              <FriendsInfoMateCard key={index} setLevel={setLevel} ownCustomUUID={ownCustomUUID} username={chatmate.username} name={chatmate.name} profileImage={chatmate.profileImage} userId={chatmate.userId} />
            )
          }))
            : (<NoUserFoundAnimation titleText={`No Chatmates found${searchQuery && ` with "${searchQuery}"`}`} />)}
        </View>)}
    </View>
  )
}

export default FriendsInfo;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  FriendsInfoNav: {
    paddingTop: moderateScale(30),
    padding: moderateScale(16),
    backgroundColor: '#fff',
    borderBottomWidth: moderateScale(1),
    borderColor: '#F8F9FA',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
  FriendsNavDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(10),
    marginLeft: moderateScale(10),
  },
  FriendsNavDetailsImage: {
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(100),
  },
  FriendsNavDetailsName: {
    fontSize: Height * 0.026,
    color: '#1C170D',
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
  },
  FriendsInfoNavigation: {
    height: moderateScale(55),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  FriendsInfoNavigationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: Width / 2,
  },
  FriendsInfoNavigationButtonText: {
    fontSize: Height * 0.017,
    color: '#9095A0',
    fontFamily: 'PlusJakartaSans',
  },
  FriendsInfoNavigationIndicator: {
    position: 'absolute',
    top: '95%',
    left: '0%',
    backgroundColor: '#F7706E',
    width: Width / 2,
    height: moderateScale(3),
  },
  MainContent: {
    flexDirection: 'row',
  },
  FriendsInfoSearch: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(12),
    height: moderateScale(40),
    backgroundColor: '#f5efe8',
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    gap: moderateScale(10),
  },
  FriendsInfoSearchView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(5),
    gap: moderateScale(10),
  },
  FriendsInfoSearchViewIcon: {
    height: moderateScale(22),
    width: moderateScale(22),
  },
  FriendsInfoSearchInput: {
    fontSize: Height * 0.017,
    padding: 0,
    width: '90%',
    color: '#49505B',
    fontFamily: 'PlusJakartaSans',
  },
  MainContentOne: {
    width: Width,
  },
  MainContentCards: {
    padding: moderateScale(16),
    gap: moderateScale(21),
  },
  LoadingContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFriendsInfoGIF: {
    width: Width,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  }
});