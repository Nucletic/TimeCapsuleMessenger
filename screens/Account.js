import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useCallback } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { CommonActions, useFocusEffect } from '@react-navigation/native'

import SettingBottomSheet from '../components/AccountComponents/SettingBottomSheet'
import BlockAccountConfirmation from '../components/AccountComponents/BlockAccountConfirmation'
import ProfileLoaderAnimation from '../components/SmallEssentials/ProfileLoaderAnimation'
import ContaineredLoaderAnimation from '../components/SmallEssentials/ContaineredLoaderAnimation'
import AccountNav from '../components/AccountComponents/AccountNav'
import AccountImage from '../components/AccountComponents/AccountImage'
import FollowingInfo from '../components/AccountComponents/FollowingInfo'
import AccountChatmateButton from '../components/AccountComponents/AccountChatmateButton'
import AccountInterests from '../components/AccountComponents/AccountInterests'
import AccountRecommendedUsers from '../components/AccountComponents/AccountRecommendedUsers'

import { Height } from '../utils/constants'
import { getOwnProfile, getUserProfile } from '../services/userService';
import { addChatmate, checkMutualFriends, CheckFollowing, checkBlockedUser } from '../services/relationshipService'

const Account = ({ navigation, route }) => {

  const [settingSheetOpen, setSettingSheetOpen] = useState(false);
  const [blockSheetOpen, setBlockSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [CurrentUserData, setCurrentUserData] = useState(null);
  const [chatmate, setChatmate] = useState(null);
  const [requested, setRequested] = useState(null);
  const [mutualFriends, setMutualFriends] = useState(null);
  const [userBlocked, setUserBlocked] = useState(null);

  const { CustomUUID: UserCustomUUID } = route.params || {};

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        if (UserCustomUUID) {
          const newUserData = await getUserProfile(UserCustomUUID);
          setCurrentUserData(newUserData);

          const following = await CheckFollowing(UserCustomUUID);
          setChatmate(following);

          const friends = await checkMutualFriends(UserCustomUUID);
          setMutualFriends(friends);

          const blocked = await checkBlockedUser(UserCustomUUID);
          setUserBlocked(blocked);
        } else {
          const newUserData = await getOwnProfile();
          setCurrentUserData(newUserData);
        }
        setLoading(false);
      };
      fetchData();
    }, [UserCustomUUID])
  );

  const handleChatmateClick = async () => {
    const request = await addChatmate(UserCustomUUID, CurrentUserData.ExpoPushToken, CurrentUserData.profileImage, CurrentUserData.username);
    setRequested(request)
  }


  return (
    <View style={styles.Container}>
      {(loading && !CurrentUserData) ?
        (<ContaineredLoaderAnimation />) : <>
          <AccountNav UserCustomUUID={UserCustomUUID} username={CurrentUserData?.username} setSettingSheetOpen={setSettingSheetOpen} />

          <ScrollView style={styles.MainAccountContent}>
            {((chatmate === null) && UserCustomUUID) && <ProfileLoaderAnimation />}
            <>
              <AccountImage CurrentUserData={CurrentUserData} />

              <View style={styles.ProfileDetails}>
                <Text style={styles.ProfileDetailsName}>{CurrentUserData?.username}</Text>
                {!userBlocked && <Text style={styles.ProfileDetailsBio}>{CurrentUserData?.bio}</Text>}
                
                {!userBlocked && <FollowingInfo UserCustomUUID={UserCustomUUID} CurrentUserData={CurrentUserData} mutualFriends={mutualFriends} />}
                {(UserCustomUUID) && <AccountChatmateButton handleChatmateClick={handleChatmateClick} userBlocked={userBlocked} requested={requested} chatmate={chatmate}
                  UserCustomUUID={UserCustomUUID} navigation={navigation} CommonActions={CommonActions} />}

              </View>

              {CurrentUserData?.interests && <AccountInterests userBlocked={userBlocked} interests={CurrentUserData.interests} />}
              <AccountRecommendedUsers />
            </>
          </ScrollView>

          <SettingBottomSheet settingSheetOpen={settingSheetOpen} setSettingSheetOpen={setSettingSheetOpen} setBlockSheetOpen={setBlockSheetOpen} CustomUUID={UserCustomUUID} />
          
          <BlockAccountConfirmation blockSheetOpen={blockSheetOpen} setBlockSheetOpen={setBlockSheetOpen} CustomUUID={UserCustomUUID}
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
  ProfileDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(10),
    gap: moderateScale(6),
  },
  ProfileDetailsName: {
    fontSize: Height * 0.026,
    color: '#1C170D',
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
  },
  ProfileDetailsBio: {
    fontSize: Height * 0.016,
    textAlign: 'center',
    width: '85%',
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
});