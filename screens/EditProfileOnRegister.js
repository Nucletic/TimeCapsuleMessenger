import { Pressable, StyleSheet, Text, View, Image, Keyboard, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import BioInput from '../components/EditProfileComponents/BioInput'
import SelectInterests from '../components/EditProfileComponents/SelectInterests'
import * as ImagePicker from 'expo-image-picker'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import { encryptData } from '../EncryptData';
import { FIREBASE_AUTH } from '../firebaseConfig';

import Constants from 'expo-constants';
import SavingProfileLoader from '../components/SmallEssentials/SavingProfileLoader'
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const EditProfileOnRegister = ({ setLoggedIn }) => {

  const [interests, setInterests] = useState([]);
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    }
  }
  const pickBannerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });
      if (!result.canceled) {
        setBannerImage(result.assets[0].uri);
      }
    }
  }

  const updateProfile = async () => {
    if (interests.length === 5 && bio.trim().length > 0) {
      try {
        setLoading(true)
        const formData = new FormData();

        const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
        const encryptedIdToken = encryptData(idToken, SECRET_KEY);

        formData.append('bio', bio.trim());
        formData.append('Interests', JSON.stringify(interests));


        if (profileImage) {
          formData.append('images', { uri: profileImage, name: `profileImage.jpeg`, type: 'image/jpeg' });
        }

        if (bannerImage) {
          formData.append('images', { uri: bannerImage, name: `bannerImage.jpeg`, type: 'image/jpeg' });
        }




        const response = await fetch('https://server-production-3bdc.up.railway.app/users/update', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Authorization': 'Bearer ' + encryptedIdToken,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        })
        const data = await response.json();
        if (response.status === 200) {
          setLoggedIn(true);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false)
        throw new Error(error)
      }
    }
    return false;
  }

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.MainContainer}>
      <View style={styles.TitleContainer}>
        <Text style={styles.TitleText}>Edit Profile</Text>
      </View>
      <ScrollView contentContainerStyle={{
        alignItems: 'center',
      }} style={styles.MainContent}>
        <View style={styles.changeImageView}>
          <View style={styles.changeBannerView}>
            {bannerImage ?
              <Image source={{ uri: bannerImage }} style={styles.BannerImage} />
              : <Image source={require('../assets/Images/RegistrationBackground.jpg')} style={styles.BannerImage} />}
            <Pressable onPress={pickBannerImage} style={styles.BannerImageChangeButton}>
              <Image source={require('../assets/Icons/ChangePicture.png')} style={styles.BannerImageChangeButtonIcon} />
            </Pressable>
          </View>
          <Pressable onPress={pickProfileImage} style={styles.ProfileImageContainer}>
            {profileImage ?
              <Image source={{ uri: profileImage }} style={styles.ProfileImage} />
              : <Image source={require('../assets/Images/User.png')} style={styles.dummyProfileImage} />}

            <Image source={require('../assets/Icons/ChangePicture.png')} style={styles.ProfileImageChangeIcon} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: moderateScale(16), width: '100%', marginBottom: moderateScale(50), }}>
          <BioInput setBio={setBio} />
          <SelectInterests setInterests={setInterests} />
        </View>
      </ScrollView>
      <Pressable onPress={() => { updateProfile() }} style={[styles.MainSubmitButton, { backgroundColor: (interests.length === 5 && bio.trim().length > 0) ? '#F7706E' : '#F3F4F6' }]}>
        {!loading ?
          <Text style={[styles.SubmitButtonText, { color: (interests.length === 5 && bio.trim().length > 0) ? '#fff' : '#c3c3c3' }]}>SAVE</Text>
          : <LoaderAnimation size={30} />}
      </Pressable>
      {loading && <SavingProfileLoader />}
    </Pressable>
  )
}

export default EditProfileOnRegister;

const styles = StyleSheet.create({
  MainContainer: {
    paddingTop: moderateScale(30),
    backgroundColor: '#fff',
    height: Height,
  },
  TitleContainer: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  TitleText: {
    fontSize: Height * 0.026,
    color: '#49505B',
    fontWeight: '900',
  },
  SkipButtonText: {
    fontSize: Height * 0.018,
    color: '#F7706E',
    fontWeight: '600',
  },
  MainContent: {
    width: '100%',
  },
  ProfilePictureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(120),
    width: moderateScale(120),
  },
  ProfilePicture: {
    height: '100%',
    width: '100%',
    borderRadius: moderateScale(100),
  },
  ProfilePictureChangeIcon: {
    position: 'absolute',
    height: moderateScale(32),
    width: moderateScale(32),
    top: '73%',
    left: '66%',
  },
  MainSubmitButton: {
    height: moderateScale(45),
    width: '96%',
    marginLeft: '2%',
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(40),
    top: '-4%',
  },
  SubmitButtonText: {
    fontSize: Height * 0.026,
    color: '#fff',
    fontWeight: '900',
  },
  changeImageView: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(40),
    alignItems: 'center',
  },
  BannerImage: {
    height: moderateScale(160),
    width: Width,
  },
  BannerImageChangeButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    position: 'absolute',
    top: '75%',
    left: '98%',
  },
  BannerImageChangeButtonIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderWidth: moderateScale(0.6),
  },
  ProfileImageContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: '60%',
  },
  ProfileImage: {
    height: moderateScale(120),
    width: moderateScale(120),
    borderRadius: moderateScale(120),
    borderWidth: moderateScale(2),
    borderColor: '#fff',
  },
  dummyProfileImage: {
    height: moderateScale(124),
    width: moderateScale(124),
    backgroundColor: '#fff',
    borderRadius: moderateScale(100),
  },
  ProfileImageChangeIcon: {
    position: 'absolute',
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(100),
    top: '70%',
    left: '68%',
  },
});