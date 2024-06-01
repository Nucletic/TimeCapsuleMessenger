import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import RecommendedSearchCard from '../components/SearchComponents/RecommendedSearchCard'
import SettingBottomSheet from '../components/AccountComponents/SettingBottomSheet'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions, useFocusEffect } from '@react-navigation/native'
import BlockAccountConfirmation from '../components/AccountComponents/BlockAccountConfirmation'



import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;




const Account = ({ navigation, route }) => {

  const [settingSheetOpen, setSettingSheetOpen] = useState(false);
  const [blockSheetOpen, setBlockSheetOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [CurrentUserData, setCurrentUserData] = useState(null);
  const [chatmate, setChatmate] = useState(null);
  const [requested, setRequested] = useState(null);
  const [mutualFriends, setMutualFriends] = useState(null);
  const [userBlocked, setUserBlocked] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(true);

  const { CustomUUID } = route.params || {};

  const getOwnProfile = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch(`http://10.0.2.2:5000/users/profile`, {
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status == 200) {
        let newUserData = {
          profileImage: data.user.profileImage,
          bannerImage: data.user.bannerImage,
          userId: data.user.userId,
          name: data.user.name,
          username: data.user.username,
          email: decryptData(data.user.email, SECRET_KEY),
          interests: data.user.interests,
          chatmateCount: data.user.chatmateCount,
          bio: data.user.bio,
        }
        setCurrentUserData(newUserData);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const getUserProfile = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch(`http://10.0.2.2:5000/users/${CustomUUID}/profile`, {
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/${CustomUUID}/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status == 200) {
        let newUserData = {
          profileImage: data.user.profileImage,
          bannerImage: data.user.bannerImage,
          userId: data.user.userId,
          name: data.user.name,
          username: data.user.username,
          email: decryptData(data.user.email, SECRET_KEY),
          interests: data.user.interests,
          chatmateCount: data.user.chatmateCount,
          bio: data.user.bio,
        }
        setCurrentUserData(newUserData);
        CheckFollowing();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const addChatmate = async () => {
    try {
      setRequested(true);
      const senderUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch(`http://10.0.2.2:5000/users/${CustomUUID}/ChatmateRequest`, {
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/${CustomUUID}/ChatmateRequest`, {
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
      throw new Error(error);
    }
  }

  const CheckFollowing = async () => {
    try {
      const userUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch(`http://10.0.2.2:5000/users/checkFollowing`, {
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/checkFollowing`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userUUID: userUUID, otherUserUUID: CustomUUID })
      })
      const data = await response.json();
      if (response.status === 200) {
        setChatmate(data.isFollowing);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  const AddMessageContact = async () => {
    try {
      navigation.dispatch(CommonActions.navigate({ name: 'Chats', }));
      setShowMessageModal(true);

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
        body: JSON.stringify({ userUUID: userUUID, otherUserUUID: CustomUUID })
      })

    } catch (error) {
      throw new Error(error);
    }
  }

  const checkMutualFriends = async () => {
    try {
      setLoading(true);
      const currentUserUUID = await AsyncStorage.getItem('CustomUUID');
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/checkMutualFriends/${CustomUUID}/${currentUserUUID}`, {
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
        setMutualFriends(data.friends);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const checkBlockedUser = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/checkBlockedUser/${CustomUUID}`, {
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
        setUserBlocked(data.blocked);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const getUserRecommendation = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/getUserRecommendations/${CustomUUID}`, {
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

  useFocusEffect(
    useCallback(() => {
      if (CustomUUID) {
        if (recommendedUsers.length === 0) {
          getUserRecommendation();
        }
        getUserProfile();
        checkMutualFriends();
        checkBlockedUser();
      } else getOwnProfile();
    }, [CustomUUID])
  );

  return (
    <View style={styles.Container}>
      {(loading && !CurrentUserData) ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>) : <>
          <View style={styles.AccountNav}>
            <View style={styles.AccountNavLeft}>
              {CustomUUID &&
                <Pressable onPress={() => { navigation.goBack(); }} style={styles.BackButton}>
                  <Image source={require('../assets/Icons/BackButton.png')} style={styles.BackButtonImage} />
                </Pressable>}
              <Text style={styles.PageTitle}>{CurrentUserData?.username}</Text>
            </View>
            <Pressable onPress={() => { setSettingSheetOpen(true) }} style={styles.SettingsButton}>
              <Image source={require('../assets/Icons/SettingsMenuButton.png')} style={styles.SettingsButtonImage} />
            </Pressable>
          </View>
          <ScrollView style={styles.MainAccountContent}>
            <View style={styles.ProfileImagesContainer}>
              {CurrentUserData &&
                <>
                  {CurrentUserData?.bannerImage ?
                    <Image source={{ uri: CurrentUserData.bannerImage }} style={styles.ProfileBannerImage} />
                    : <Image source={require('../assets/Images/RegistrationBackground.jpg')} style={styles.ProfileBannerImage} />}

                  {CurrentUserData?.profileImage ?
                    <Image source={{ uri: CurrentUserData.profileImage }} style={styles.ProfileImage} />
                    : <Image source={require('../assets/Images/User.png')} style={styles.ProfileImage} />}
                </>
              }
            </View>
            <View style={styles.ProfileDetails}>
              <Text style={styles.ProfileDetailsName}>{CurrentUserData?.username}</Text>
              {!userBlocked && <Text style={styles.ProfileDetailsBio}>{CurrentUserData?.bio}</Text>}

              {!userBlocked &&
                <View style={styles.ProfileFollowingInfo}>
                  {CustomUUID &&
                    <Pressable onPress={() => {
                      navigation.navigate('FriendsInfo', {
                        userId: CurrentUserData?.userId,
                        mutualFriends: mutualFriends,
                        username: CurrentUserData.username,
                        profileImage: CurrentUserData.profileImage
                      })
                    }} style={styles.FollowingCommonButton}>
                      <Image source={require('../assets/Icons/CommonMates.png')} style={styles.FollowingCommonButtonImage} />
                      <Text style={styles.FollowingButtonsText}>{mutualFriends ? mutualFriends.length : 0}</Text>
                    </Pressable>}
                  <Pressable onPress={() => {
                    navigation.navigate('FriendsInfo', {
                      userId: CurrentUserData?.userId,
                      mutualFriends: mutualFriends,
                      username: CurrentUserData.username,
                      profileImage: CurrentUserData.profileImage
                    })
                  }} style={styles.FollowingChatmatesButton}>
                    <Image source={require('../assets/Icons/Chatmates.png')} style={styles.FollowingChatmatesButtonImage} />
                    <Text style={styles.FollowingButtonsText}>{CurrentUserData?.chatmateCount || 0}</Text>
                  </Pressable>
                </View>}

              {CustomUUID &&
                (userBlocked ?
                  (<Pressable style={styles.RequestedButton}>
                    <Text style={styles.RequestedButtonText}>Unblock</Text>
                  </Pressable>)
                  : (<View style={styles.AddMateOptionsContainer}>
                    {(!requested && !chatmate) && <Pressable onPress={() => { addChatmate() }} style={styles.AddChatMateButton}>
                      <Image source={require('../assets/Icons/AddChatMate.png')} style={styles.AddChatMateButtonImage} />
                      <Text style={styles.AddChatMateButtonText}>Add Chatmate</Text>
                    </Pressable>}
                    {requested &&
                      <Pressable style={styles.RequestedButton}>
                        <Text style={styles.RequestedButtonText}>Requested</Text>
                      </Pressable>}
                    {chatmate &&
                      <>
                        <Pressable onPress={() => { AddMessageContact() }} style={styles.RequestedButton}>
                          <Text style={styles.RequestedButtonText}>Message</Text>
                        </Pressable>
                      </>}
                  </View>))
              }
            </View>
            {CurrentUserData?.interests &&
              <>
                {!userBlocked &&
                  <View style={styles.ProfileInterestsContainer}>
                    <Text style={styles.ProfileInterestsTitle}>INTERESTS</Text>
                    <View style={styles.ProfileInterests}>
                      {CurrentUserData?.interests.map((item, index) => {
                        return (
                          <View key={index} style={styles.MainProfileInterest}>
                            <Text style={styles.MainProfileInterestText}>{item}</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>}
              </>
            }
            {recommendedUsers.length > 0 &&
              <View style={styles.RecommendedUsersContainer}>
                <Text style={styles.RecommendedUsersTitle}>Recommended for you</Text>
                <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.RecommendedUsersContent}>
                  {recommendedUsers.map((user, i) => {
                    return (
                      <RecommendedSearchCard key={i} userId={user.userId} profileImage={user.profileImage} username={user.username} />
                    )
                  })}
                </ScrollView>
              </View>}
          </ScrollView>
          <SettingBottomSheet settingSheetOpen={settingSheetOpen} setSettingSheetOpen={setSettingSheetOpen} setBlockSheetOpen={setBlockSheetOpen} CustomUUID={CustomUUID} />

          <BlockAccountConfirmation blockSheetOpen={blockSheetOpen} setBlockSheetOpen={setBlockSheetOpen} CustomUUID={CustomUUID}
            username={CurrentUserData?.username} profileImage={CurrentUserData?.profileImage} />
        </>}
      
    </View>
  )
}


export default Account;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  AccountNav: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  AccountNavLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(10),
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
  SettingsButton: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  SettingsButtonImage: {
    height: '100%',
    width: '100%'
  },
  ProfileImagesContainer: {
    height: moderateScale(220),
    width: '100%',
    alignItems: 'center',
  },
  ProfileBannerImage: {
    height: moderateScale(160),
    width: '100%',
  },
  ProfileImage: {
    position: 'absolute',
    height: moderateScale(120),
    width: moderateScale(120),
    borderRadius: moderateScale(120),
    top: '45%',
    borderWidth: moderateScale(2),
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  ProfileDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(10),
    gap: moderateScale(10),
  },
  ProfileDetailsName: {
    fontSize: Height * 0.026,
    color: '#2F3237',
    fontWeight: '900',
  },
  ProfileDetailsBio: {
    fontSize: Height * 0.014,
    textAlign: 'center',
    width: '85%',
    color: '#49505B',
  },
  ProfileFollowingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(21),
  },
  FollowingCommonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  FollowingChatmatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  FollowingBestfriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  FollowingCommonButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  FollowingChatmatesButtonImage: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  FollowingBestfriendButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  FollowingButtonsText: {
    fontSize: Height * 0.018,
    color: '#9095A0',
  },
  AddMateOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    marginTop: moderateScale(8),
  },
  AddChatMateButton: {
    height: moderateScale(42),
    paddingHorizontal: moderateScale(24),
    backgroundColor: '#F7706E',
    borderRadius: moderateScale(100),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
  },
  AddChatMateButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  AddChatMateButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '600',
    color: '#fff',
  },
  RequestedButton: {
    height: moderateScale(42),
    paddingHorizontal: moderateScale(24),
    backgroundColor: '#fff',
    borderRadius: moderateScale(100),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
    borderWidth: moderateScale(2),
    borderColor: '#F7706E',
  },
  RequestedButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '600',
    color: '#F7706E',
  },
  VideoCallButton: {
    height: moderateScale(42),
    width: moderateScale(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(100),
    backgroundColor: '#F7706E',
  },
  VideoCallButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  CallButton: {
    height: moderateScale(42),
    width: moderateScale(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(100),
    backgroundColor: '#F7706E',
  },
  CallButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  ProfileInterestsContainer: {
    marginTop: moderateScale(16),
    backgroundColor: '#FBFBFB',
    borderWidth: moderateScale(1),
    borderColor: '#E9E9E9',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginHorizontal: moderateScale(16),
  },
  TitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ProfileInterestsTitle: {
    color: '#9095A0',
    fontSize: Height * 0.016,
    fontWeight: '500',
  },
  MainInput: {
    borderWidth: moderateScale(1.6),
    borderRadius: moderateScale(5),
    borderColor: '#C3C3C3',
    padding: moderateScale(8),
  },
  ProfileInterests: {
    marginTop: moderateScale(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: moderateScale(8),
  },
  MainProfileInterest: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(4),
    backgroundColor: '#F3F4F6',
    borderWidth: moderateScale(1.6),
    borderColor: '#E9E9E9',
    borderRadius: moderateScale(25),
  },
  MainProfileInterestText: {
    fontSize: Height * 0.020,
    color: '#49505B',
    fontWeight: '500',
  },
  RecommendedUsersContainer: {
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
    height: '100%',
  },
  RecommendedUsersContent: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: moderateScale(22),
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
  RecommendedUsersTitle: {
    fontSize: Height * 0.018,
    color: '#49505B',
    fontWeight: '900',
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(16),
    marginHorizontal: moderateScale(16),
  },
  LoadingContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});