import { StyleSheet, Text, View, Image, TextInput, Pressable, Keyboard } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../utils'
import ChatCard from '../components/ChatsComponents/ChatCard'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import AsyncStorage from '@react-native-async-storage/async-storage'



const ChatSearch = ({ navigation, route }) => {

  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredContactDetails, setFilteredContactDetails] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const contactDetails = route.params.contactDetails || [];
  const contacts = route.params.contacts || [];
  const [CustomUUID, setCustomUUID] = useState(null);

  AsyncStorage.getItem('CustomUUID').then((CustomUUID) => {
    setCustomUUID(CustomUUID);
  });



  useEffect(() => {
    // setLoading(true);
    if (searchQuery.length > 0) {
      const filteredContactDetails = contactDetails.filter(contact => {
        return contact.username.toLowerCase().includes(searchQuery.toLowerCase());
      });

      setFilteredContactDetails(filteredContactDetails);
      let indexesToRemove = [];
      filteredContactDetails.forEach(filteredContact => {
        const index = contactDetails.findIndex(contact => contact === filteredContact);
        if (index !== -1) {
          indexesToRemove.push(index);
        }
      });

      const dupContacts = [...contacts];

      const filteredContacts = dupContacts.filter((contact, index) => indexesToRemove.includes(index));

      setFilteredContacts(filteredContacts);
    } else {
      setFilteredContactDetails([]);
      setFilteredContacts([]);
    }
    // setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);




  return (
    <View style={styles.ChatSearch}>
      <View style={styles.ChatSearchNav}>
        <Pressable onPress={() => { navigation.goBack() }} style={styles.BackButton}>
          <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
        </Pressable>
        <View style={styles.SearchContainer}>
          <Image source={require('../assets/Icons/animeIcons/SearchIcon.png')} style={styles.SearchIcon} />
          <TextInput ref={inputRef} style={styles.SearchInput} value={searchQuery} onChangeText={(text) => { setSearchQuery(text) }} placeholder='Search messages' placeholderTextColor={'#a3814a'} />
        </View>
      </View>

      {loading ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>)
        : (
          <Pressable onPress={Keyboard.dismiss} style={styles.SearchResultContent}>
            {filteredContactDetails.map((contact, index) => {
              return (
                <ChatCard key={index} timestamp={filteredContacts[index].lastMessage.timestamp || filteredContacts[index].createdAt} profileImage={contact.profileImage}
                  activityStatus={contact.activityStatus} username={contact.username} lastMessage={filteredContacts[index].lastMessage}
                  readStatus={(filteredContacts[index].lastMessage.senderId !== CustomUUID && filteredContacts[index].lastMessage.readStatus === 'unread') ? 'unread' : 'read'}
                  chatId={filteredContacts[index].chatId} blockedFromOtherSide={contact.blockedFromOtherSide} blockedFromOurSide={contact.blockedFromOurSide}
                  lastActive={contact.lastActive} />
              )
            })}
          </Pressable>
        )}
    </View>
  )
}

export default ChatSearch;

const styles = StyleSheet.create({
  ChatSearch: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
    height: '100%',
  },
  ChatSearchNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  BackButton: {

  },
  BackButtonImage: {
    height: moderateScale(30),
    width: moderateScale(30)
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
    height: '100%',
  },
  LoadingContainer: {
    height: '96%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});