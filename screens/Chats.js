import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from 'react-native'
import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Height } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import TaleCard from '../components/ChatsComponents/TaleCard'
import ChatCard from '../components/ChatsComponents/ChatCard'
import AddTale from '../components/ChatsComponents/AddTale'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import { encryptData, decryptData } from '../EncryptData'
import { useFocusEffect } from '@react-navigation/native'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import AppContext from '../ContextAPI/AppContext'

import FilterAllUnread from '../components/SmallEssentials/FilterAllUnread'


import Constants from 'expo-constants';
import FollowRecommendations from '../components/ChatsComponents/FollowRecommendations'
import FriendsInfoMateCard from '../components/AccountComponents/FriendsInfoMateCard'
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const Chats = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [tales, setTales] = useState(null);
  const [searchDisabled, setSearchDisabled] = useState(true);
  const [contactDetails, setContactDetails] = useState([]);
  const [CustomUUID, setCustomUUID] = useState(null);
  const [encryptedIdToken, setEncryptedIdToken] = useState(null);
  const [ownTale, setOwnTale] = useState(null);
  const [filteredContactDetails, setfilteredContactDetails] = useState([]);
  const [filteredContacts, setfilteredContacts] = useState([]);
  const [showFollowRecommendation, setShowFollowRecommendation] = useState(false);

  const getTokenCustomUUID = async () => {
    const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
    const encryptedIdToken = encryptData(idToken, SECRET_KEY);
    const CustomUUID = await AsyncStorage.getItem('CustomUUID');
    setCustomUUID(CustomUUID);
    setEncryptedIdToken(encryptedIdToken);
  }

  const getChatContacts = async (CustomUUID, encryptedIdToken) => {
    try {
      const response = await fetch(`http://192.168.29.62:5000/users/getChatContacts/${CustomUUID}`, {
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
        if (data.contacts.length === 0) {
          setShowFollowRecommendation(true);
        } else {
          listenChatChanges();
          setContacts(data.contacts);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  const getContactsDetails = async (CustomUUID, encryptedIdToken) => {
    try {
      let details = [];

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const contactCustomUUID = CustomUUID === contact.chatId.split('_')[0]
          ? contact.chatId.split('_')[1] : contact.chatId.split('_')[0];

        const response = await fetch(`http://192.168.29.62:5000/users/getContactDetails/${contactCustomUUID}`, {
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
          details.push(data.userDetails);
        }
      }
      setContactDetails(details);
    } catch (error) {
      throw new Error(error);
    }
  }

  const getContactTales = async (CustomUUID, encryptedIdToken) => {
    try {
      const response = await fetch(`http://192.168.29.62:5000/users/GetTales/:${1}/:${10}`, {
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
        setTales(data.tales);
        setOwnTale(data.myTales);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  const listenChatChanges = () => {
    if (contacts) {
      const unsubscribeFunctions = contacts.map((contact, index) => {
        const chatId = contact.chatId;
        const chatRef = doc(FIREBASE_DB, 'chats', chatId);
        return onSnapshot(chatRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            let updatedContacts = [...contacts];
            updatedContacts[index] = data;
            setContacts(updatedContacts);
          }
        });
      });

      return () => {
        unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      };
    }
  }

  useEffect(() => {
    if (contacts && contactDetails) {
      const unsubscribeFunctions = contacts.map((contact, index) => {
        const contactCustomUUID = CustomUUID === contact.chatId.split('_')[0]
          ? contact.chatId.split('_')[1]
          : contact.chatId.split('_')[0];

        const qry = query(collection(FIREBASE_DB, 'users'), where('userId', '==', contactCustomUUID));

        return onSnapshot(qry, (snapshot) => {
          snapshot.forEach(doc => {
            const data = doc.data();
            setContactDetails(prevDetails => {
              const updatedDetails = [...prevDetails];
              updatedDetails[index] = {
                ...updatedDetails[index],
                activityStatus: data.activityStatus,
                lastActive: data.lastActive
              };
              return updatedDetails;
            });
          });
        });
      });

      // Clean up the listeners when the component unmounts
      return () => {
        unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      };
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      if ((contacts.length > 0 && contactDetails.length > 0 && tales) || showFollowRecommendation) {
        setLoading(false);
      }
    }, [contacts, contactDetails, tales])
  );

  useFocusEffect(
    useCallback(() => {
      if (contacts.length > 0 && contactDetails.length === 0 && !showFollowRecommendation) {
        getContactsDetails(CustomUUID, encryptedIdToken);
        setSearchDisabled(false);
      }
    }, [contacts])
  );

  useFocusEffect(
    useCallback(() => {
      if (CustomUUID && encryptedIdToken && contacts.length === 0 && !showFollowRecommendation) {
        getChatContacts(CustomUUID, encryptedIdToken);
        if (!tales) {
          getContactTales(CustomUUID, encryptedIdToken);
        }
      }
    }, [CustomUUID, encryptedIdToken])
  );

  useFocusEffect(
    useCallback(() => {
      if (!CustomUUID || !encryptedIdToken) {
        getTokenCustomUUID();
      }
    }, [CustomUUID, encryptedIdToken])
  );


  useFocusEffect(
    useCallback(() => {
      if ((contactDetails.length > 0 && contacts.length > 0) && (filteredContactDetails.length === 0 || filteredContacts.length === 0)) {
        filterChats('All');
      }
    }, [contactDetails, contacts])
  );


  const filterChats = (filter) => {
    let filterContactDetails = [];
    let filterContacts = [];

    if (filter === 'All') {
      setfilteredContactDetails([...contactDetails])
      setfilteredContacts([...contacts])
    }

    if (filter === 'Unread') {
      for (let i = 0; i < contactDetails.length; i++) {
        if ((contacts[i].lastMessage.senderId !== CustomUUID) && (contacts[i].lastMessage.readStatus === 'unread')) {
          filterContacts.push(contacts[i]);
          filterContactDetails.push(contactDetails[i])
        }
      }
      setfilteredContactDetails([...filterContactDetails])
      setfilteredContacts([...filterContacts])
    }

  }


  return (
    <View style={styles.MainContainer}>
      <View style={styles.TitleContainer}>
        <Text style={styles.PageTitle}>Chats</Text>
      </View>
      <ScrollView style={styles.MainContentStyle} contentContainerStyle={styles.MainContent}>
        <View>
          <Pressable onPress={() => { navigation.navigate('ChatSearch', { contactDetails: contactDetails, contacts: contacts }) }} disabled={searchDisabled} style={styles.SearchContainer}>
            <Image source={require('../assets/Icons/animeIcons/SearchIcon.png')} style={styles.SearchIcon} />
            <Text style={styles.SearchText}>Search messages</Text>
          </Pressable>
        </View>
        <FilterAllUnread firstFuncText={'All'} secondFuncText={'Unread'} onAllPress={() => { filterChats('All') }} onUnreadPress={() => { filterChats('Unread') }} />
        {loading ?
          <View style={styles.LoadingContainer}>
            <LoaderAnimation size={40} color={'#49505B'} />
          </View> :

          <>
            {!showFollowRecommendation ?
              <>
                <View style={styles.TalesSection}>
                  <AddTale />
                  {(ownTale.tale.length > 0) && <TaleCard data={ownTale} CustomUUID={CustomUUID} />}
                  {tales && tales.map((tale, index) => {
                    return <TaleCard key={index} data={tale} />
                  })}
                </View>
                <View style={styles.ChatCardsSection}>
                  <ChatCard />
                  {(filteredContactDetails.length > 0) && filteredContactDetails?.map((contact, index) => {
                    return (
                      <ChatCard key={index} timestamp={filteredContacts[index].lastMessage.timestamp || filteredContacts[index].createdAt} username={contact.username}
                        profileImage={contact.profileImage} activityStatus={contact.activityStatus} ExpoPushToken={contact.ExpoPushToken} lastMessage={filteredContacts[index].lastMessage}
                        readStatus={(fil[index].lastMessage.senderId !== CustomUUID && filteredContacts[index].lastMessage.readStatus === 'unread') ? 'unread' : 'read'}
                        chatId={filteredContacts[index].chatId} blockedFromOtherSide={contact.blockedFromOtherSide} blockedFromOurSide={contact.blockedFromOurSide} lastActive={contact.lastActive} />
                    )
                  })}
                </View>
              </>
              :
              <FollowRecommendations />
            }
          </>
        }
      </ScrollView>
    </View>
  )
}

export default Chats;

const styles = StyleSheet.create({
  MainContainer: {
    backgroundColor: '#fff',
    height: '100%',
  },
  TitleContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
  },
  PageTitle: {
    fontSize: Height * 0.026,
    color: '#1b160b',
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
  },
  PencilIcon: {
    height: moderateScale(30),
    width: moderateScale(30),
  },
  MainContent: {},
  SearchContainer: {
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
  SearchIcon: {
    height: moderateScale(22),
    width: moderateScale(22),
  },
  SearchText: {
    fontSize: Height * 0.02,
    width: '90%',
    color: '#a3814a',
    fontFamily: 'PlusJakartaSans',
  },
  TalesSection: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    backgroundColor: '#f5efe8',
    marginTop: moderateScale(20),
    flexDirection: 'row',
    gap: moderateScale(18),
  },
  ChatCardsSection: {
    padding: moderateScale(16),
    gap: moderateScale(20),
  },
  LoadingContainer: {
    height: Height - moderateScale(240),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ChatsFilterButtonContainer: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(14),
    height: moderateScale(40),
    backgroundColor: '#f5efe8',
    borderRadius: moderateScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(3),
  },
  ChatsFilterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(34),
    borderRadius: moderateScale(50),

  },
  ChatsFilterButtonText: {
    fontSize: Height * 0.018,
    color: '#a3814a',
    fontFamily: 'PlusJakartaSans',
  },

});