import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { encryptData, decryptData } from '../../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'



import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const FriendsInfoMateCard = ({ username, name, profileImage, userId, ownCustomUUID, setLevel }) => {

  const navigation = useNavigation();
  const [requested, setRequested] = useState(false);
  const [isFollowing, setIsFollowing] = useState(null);


  const addChatmate = async () => {
    try {
      setRequested(true);
      const senderUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/${userId}/ChatmateRequest`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderUUID: senderUUID })
      })
      const data = await response.json();
      if (response.status === 200) {
        console.log('request success');
      } else {
        console.log('request failed');
        setRequested(false);
      }
    } catch (error) {
      setRequested(false);
      throw new Error(error);
    }
  }


  const CheckFollowing = async (Id) => {
    try {
      const userUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/checkFollowing`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userUUID: userUUID, otherUserUUID: Id })
      })
      const data = await response.json();
      if (response.status === 200) {
        setIsFollowing(data.isFollowing);
        setLevel(prev => prev + 1);

      }
    } catch (error) {
      throw new Error(error);
    }
  }

  const AddMessageContact = async () => {
    try {
      navigation.dispatch(CommonActions.navigate({ name: 'Chats', }));

      const userUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/AddChatContact`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userUUID: userUUID, otherUserUUID: userId })
      })
    } catch (error) {
      throw new Error(error);
    }
  }

  const onMatePress = () => {
    if (requested) {
      return;
    } else if (isFollowing) {
      AddMessageContact();
    } else {
      addChatmate();
    }
  }

  useEffect(() => {
    if (userId) {
      CheckFollowing(userId);
    }
  }, []);



  return (
    <>
      {isFollowing !== null &&
        <Pressable onPress={() => {
          if (ownCustomUUID === userId) {
            navigation.navigate('AccountStack', { screen: 'Account' })
          } else {
            navigation.navigate('SearchStack', { screen: 'Account', params: { CustomUUID: userId } })
          }
        }} style={styles.FriendsInfoMateCard}>
          <View style={styles.FriendsInfoMateCardLeft}>
            {profileImage && <Image source={{ uri: profileImage }} style={styles.FriendsInfoMateCardImage} />}
            <View style={styles.NameContainer}>
              <Text style={styles.FriendsInfoMateCardText}>{name && name}</Text>
              <Text style={styles.FriendsInfoMateCardText2}>@{username && username}</Text>
            </View>
          </View>
          <View style={styles.FriendsInfoMateCardRight}>
            {(ownCustomUUID !== userId) &&
              <Pressable onPress={() => { onMatePress() }} style={[styles.AddMateButton, (requested || isFollowing) && {
                backgroundColor: '#fff',
                borderWidth: moderateScale(2),
                borderColor: '#f5efe8',
              }]}>

                {requested && <Text style={[styles.AddMateButtonText, { color: '#A1824A' }]}>Requested</Text>}
                {isFollowing && <Text style={[styles.AddMateButtonText, { color: '#A1824A' }]}>Message</Text>}
                {(!requested && !isFollowing) && <Text style={styles.AddMateButtonText}>Add Chatmate</Text>}
              </Pressable>}
          </View>
        </Pressable>}
    </>
  )
}

export default FriendsInfoMateCard

const styles = StyleSheet.create({
  FriendsInfoMateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  FriendsInfoMateCardImage: {
    height: moderateScale(55),
    width: moderateScale(55),
    borderRadius: moderateScale(100),
  },
  FriendsInfoMateCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
  },
  NameContainer: {},
  FriendsInfoMateCardText: {
    fontSize: Height * 0.019,
    fontWeight: '700',
    color: '#1C170D',
    fontFamily: 'PlusJakartaSans',
  },
  FriendsInfoMateCardText2: {
    fontSize: Height * 0.017,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  AddMateButton: {
    backgroundColor: '#f5efe8',
    width: moderateScale(130),
    height: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(30),
  },
  AddMateButtonText: {
    fontSize: Height * 0.018,
    fontWeight: '700',
    color: '#1b160b',
    fontFamily: 'PlusJakartaSans',
  },
});