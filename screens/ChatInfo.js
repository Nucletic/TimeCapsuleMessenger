import { StyleSheet, Text, View, Pressable, Image, ScrollView, FlatList } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const ChatInfo = ({ navigation, route }) => {

  const { chatId, username, profileImage } = route.params;
  const [CustomUUID, setCustomUUID] = useState(null);
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMuted, setUserMuted] = useState(false);

  AsyncStorage.getItem('CustomUUID').then((CustomUUID) => {
    setCustomUUID(CustomUUID);
  });

  const getSharedMedia = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/getChatSharedMedia/${chatId}`, {
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
        setMedia(data.media);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  const checkMutedUser = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/checkMutedUser/${CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]}`, {
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
        setUserMuted(data.muted);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  const muteUser = async () => {
    try {
      setUserMuted(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/Mute/${CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status !== 200) {
        setUserMuted(false);
      }

    } catch (error) {
      throw new Error(error);
    }
  }

  const unMuteUser = async () => {
    try {
      setUserMuted(false);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/unMuteUser/${CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status !== 200) {
        setUserMuted(true);
      }

    } catch (error) {
      throw new Error(error);
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      if (chatId && !media) {
        await getSharedMedia();
        await checkMutedUser();
      }
      setLoading(false);
    };
    fetchData();
  }, [chatId, media]);




  return (
    <View style={styles.Container}>
      {(loading) ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>) : <>
          <ScrollView style={styles.MainContent}>
            <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
              <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
            </Pressable>
            <View style={styles.ChatOptions}>
              <View style={styles.ProfileDetails}>
                <Image source={{ uri: profileImage }} style={styles.ProfileDetailsImage} />
                <Text style={styles.ProfileDetailsText}>{username && username}</Text>
              </View>
              <View style={styles.ChatOptionsContainer}>
                <Pressable onPress={() => {
                  navigation.navigate('SearchStack',
                    {
                      screen: 'Account',
                      params: {
                        CustomUUID: CustomUUID === chatId.split('_')[0] ? chatId.split('_')[1] : chatId.split('_')[0]
                      }
                    })
                }} style={styles.ChatOptionsButton}>
                  <Image source={require('../assets/Icons/ProfileIcon.png')} style={styles.ChatOptionsButtonImage} />
                  <Text style={styles.ChatOptionsButtonText}>Profile</Text>
                </Pressable>
                <Pressable onPress={() => { if (userMuted) unMuteUser(); else muteUser(); }} style={styles.ChatOptionsButton}>

                  {userMuted ? <Image source={require('../assets/Icons/UnMuteIcon.png')} style={styles.ChatOptionsButtonImage} />
                    : <Image source={require('../assets/Icons/MuteIcon.png')} style={styles.ChatOptionsButtonImage} />}

                  <Text style={styles.ChatOptionsButtonText}>Mute</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.sharedMediaContainer}>
              <View style={styles.sharedMediaTitle}>
                <Image source={require('../assets/Icons/SharedImagesICon.png')} style={styles.sharedMediaTitleImage} />
                <Text style={styles.sharedMediaTitleText}>Shared Media</Text>
              </View>
              <View style={styles.MediaView}>
                {media && media.map((image, i) => {
                  return (
                    <Pressable onPress={() => { navigation.navigate('ImageShow', { uri: image }) }} key={i} style={styles.MediaImageButton}>
                      <Image source={{ uri: image }} style={styles.MediaImage} />
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </ScrollView>
        </>}
    </View>
  )
}


export default ChatInfo

const styles = StyleSheet.create({
  Container: {
    height: '100%',
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
  },
  BackButton: {
    height: moderateScale(30),
    width: moderateScale(30),
    marginHorizontal: moderateScale(16),
  },
  BackButtonImage: {
    height: '100%',
    width: '100%'
  },
  ChatOptions: {
    marginTop: moderateScale(10),
  },
  ProfileDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
  },
  ProfileDetailsImage: {
    height: moderateScale(120),
    width: moderateScale(120),
    borderRadius: moderateScale(100),
  },
  ProfileDetailsText: {
    fontSize: Height * 0.026,
    color: '#2F3237',
    fontWeight: '900',
  },
  ChatOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(24),
    gap: moderateScale(40),
  },
  ChatOptionsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  ChatOptionsButtonImage: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  ChatOptionsButtonText: {
    fontSize: Height * 0.012,
    color: '#49505B',
    fontWeight: '500',
  },
  sharedMediaContainer: {
    marginTop: moderateScale(60),
  },
  sharedMediaTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    marginBottom: moderateScale(16),
  },
  sharedMediaTitleImage: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  sharedMediaTitleText: {
    fontSize: Height * 0.018,
    color: '#49505B',
    fontWeight: '600',
  },
  MediaView: {
    marginHorizontal: moderateScale(4),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(2),
    flex: 1,
  },
  MediaImageButton: {
    width: Width * 0.24,
    height: Width * 0.24,
  },
  MediaImage: {
    height: '100%',
    width: '100%',
    // height: moderateScale(100),
    // width: moderateScale(100),
  },
  LoadingContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});