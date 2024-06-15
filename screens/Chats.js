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


import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


import { AppOpenAd, BannerAd, BannerAdSize, TestIds, AdEventType } from 'react-native-google-mobile-ads';


const adUnitId = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-4598459833894527/4947014150';
const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4598459833894527/8344668849';


const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
  keywords: ['fashion', 'clothing'],
});



const Chats = ({ navigation }) => {

  const { showAds } = useContext(AppContext);

  useEffect(() => {
    console.log(showAds);
  }, [showAds])


  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      // setLoaded(true);
    });
    const unsubscribeEarned = appOpenAd.addAdEventListener(
      AdEventType.CLOSED,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );
    appOpenAd.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, [loaded]);


  useEffect(() => {
    if (loaded && showAds) {
      appOpenAd.show();
      setLoaded(false);
    }
  }, [loaded, showAds])






  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState(null);
  const [tales, setTales] = useState(null);
  const [searchDisabled, setSearchDisabled] = useState(true);
  const [contactDetails, setContactDetails] = useState(null);
  const [CustomUUID, setCustomUUID] = useState(null);
  const [encryptedIdToken, setEncryptedIdToken] = useState(null);
  const [ownTale, setOwnTale] = useState(null);

  const getTokenCustomUUID = async () => {
    const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
    const encryptedIdToken = encryptData(idToken, SECRET_KEY);
    const CustomUUID = await AsyncStorage.getItem('CustomUUID');
    setCustomUUID(CustomUUID);
    setEncryptedIdToken(encryptedIdToken);
  }

  const getChatContacts = async (CustomUUID, encryptedIdToken) => {
    try {
      const response = await fetch(`http://192.168.29.8:5000/users/getChatContacts/${CustomUUID}`, {
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
        listenChatChanges();
        setContacts(data.contacts);
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

        const response = await fetch(`http://192.168.29.8:5000/users/getContactDetails/${contactCustomUUID}`, {
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
      const response = await fetch(`http://192.168.29.8:5000/users/GetTales/:${1}/:${10}`, {
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
      if (contacts && contactDetails && tales) {
        setLoading(false);
      }
    }, [contacts, contactDetails, tales])
  );

  useFocusEffect(
    useCallback(() => {
      if (contacts && !contactDetails) {
        getContactsDetails(CustomUUID, encryptedIdToken);
        setSearchDisabled(false);
      }
    }, [contacts])
  );

  useFocusEffect(
    useCallback(() => {
      if (CustomUUID && encryptedIdToken && !contacts) {
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

  return (
    <View style={styles.MainContainer}>
      <Text style={styles.PageTitle}>Chats</Text>
      <ScrollView style={styles.MainContentStyle} contentContainerStyle={styles.MainContent}>
        <View>
          <Pressable onPress={() => { navigation.navigate('ChatSearch', { contactDetails: contactDetails, contacts: contacts }) }} disabled={searchDisabled} style={styles.SearchContainer}>
            <Image source={require('../assets/Icons/Search.png')} style={styles.SearchIcon} />
            <Text style={styles.SearchText}>Search</Text>
          </Pressable>
        </View>
        {loading ?
          <View style={styles.LoadingContainer}>
            <LoaderAnimation size={40} color={'#49505B'} />
          </View> : <>
            <View style={styles.TalesSection}>
              <AddTale />
              {(ownTale.tale.length > 0) && <TaleCard data={ownTale} CustomUUID={CustomUUID} />}
              {tales && tales.map((tale, index) => {
                return <TaleCard key={index} data={tale} />
              })}
            </View>
            <View style={styles.ChatCardsSection}>
              {contactDetails && contactDetails.map((contact, index) => {
                return (
                  <ChatCard key={index} timestamp={contacts[index].lastMessage.timestamp || contacts[index].createdAt} username={contact.username}
                    profileImage={contact.profileImage} activityStatus={contact.activityStatus} ExpoPushToken={contact.ExpoPushToken} lastMessage={contacts[index].lastMessage}
                    readStatus={(contacts[index].lastMessage.senderId !== CustomUUID && contacts[index].lastMessage.readStatus === 'unread') ? 'unread' : 'read'}
                    chatId={contacts[index].chatId} blockedFromOtherSide={contact.blockedFromOtherSide} blockedFromOurSide={contact.blockedFromOurSide} lastActive={contact.lastActive} />
                )
              })}
            </View>
          </>}
      </ScrollView>
      {(!showAds || showAds === false) &&
        <View style={{ position: 'absolute', bottom: 0 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>}
    </View>
  )
}

export default Chats;

const styles = StyleSheet.create({
  MainContainer: {
    backgroundColor: '#fff',
    height: '100%',
  },
  PageTitle: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    fontSize: Height * 0.026,
    color: '#49505B',
    fontWeight: '900',
  },
  MainContent: {},
  SearchContainer: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(20),
    height: moderateScale(32),
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(6),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    gap: moderateScale(10),
  },
  SearchIcon: {
    height: moderateScale(18),
    width: moderateScale(18),
  },
  SearchText: {
    fontSize: Height * 0.018,
    width: '90%',
    color: '#c3c3c3',
  },
  TalesSection: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    backgroundColor: '#F8F9FA',
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
});