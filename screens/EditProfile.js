import { Pressable, Image, StyleSheet, Text, View, ScrollView, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import BioInput from '../components/EditProfileComponents/BioInput'
import SelectInterests from '../components/EditProfileComponents/SelectInterests'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import SavingProfileLoader from '../components/SmallEssentials/SavingProfileLoader'
import { encryptData, decryptData } from '../EncryptData'
import { FIREBASE_AUTH } from '../firebaseConfig'
import * as ImagePicker from 'expo-image-picker'
import ConfirmationPrompt from '../components/SmallEssentials/ConfirmationPrompt'



import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const EditProfile = ({ navigation }) => {

  


  const [bio, setBio] = useState('');
  const [Interests, setInterests] = useState('');
  const [username, setUsername] = useState('');
  const [Name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [oldUser, setOldUser] = useState(null);
  const [usernameText, setUsernameText] = useState(<Text style={styles.userNamePrecautionsText}>You can change your username twice every 14 days</Text>);

  const [loading, setLoading] = useState(true);
  const [saving, SetSaving] = useState(false);

  const getProfile = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const response = await fetch(`http://192.168.29.62:5000/users/profile`, {
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
        setUsernameText(<Text style={styles.userNamePrecautionsText}>You can change your username twice every 14 days</Text>)
        setOldUser(data.user);
        setUsername(data.user.username);
        setName(data.user.name);
        setBio(data.user.bio);
        setInterests(data.user.interests);
        setBannerImage(data.user.bannerImage);
        setProfileImage(data.user.profileImage);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }

  const saveProfile = async () => {
    try {
      SetSaving(true);
      const formData = new FormData();

      const isValidUsername = /^[a-zA-Z0-9._]+$/.test(username);
      if (!isValidUsername) {
        return setUsernameText(<Text style={[styles.userNamePrecautionsText, {
          color: '#F7706E',
        }]}>your user name cannot contain any special charcters and white spaces excepting - a-z, A-Z, 0-9, _, .</Text>)
      }

      if (oldUser.username !== username) {
        const lastUpdateDate = new Date(oldUser.lastUsernameUpdate._seconds * 1000);
        const currentDate = new Date();
        const differenceInMilliseconds = currentDate - lastUpdateDate;
        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
        if (differenceInDays >= 7) {
          formData.append('username', username.trim());
        } else {
          setUsernameText(<Text style={[styles.userNamePrecautionsText, {
            color: '#F7706E',
          }]}>You can change your username once every 14 days</Text>)
        }
      }

      if (oldUser.name !== Name) formData.append('name', Name.trim());

      if (oldUser.bannerImage) {
        formData.append('bannerImage', oldUser.bannerImage.trim());
      }

      if (oldUser.profileImage) {
        formData.append('profileImage', oldUser.profileImage.trim());
      }


      if (oldUser.bio !== bio) formData.append('bio', bio.trim());

      if (JSON.stringify(oldUser.interests) !== JSON.stringify(Interests)) {
        formData.append('Interests', JSON.stringify(Interests));
      }

      if (profileImage !== oldUser.profileImage) {
        formData.append('images', { uri: profileImage, name: `profileImage.jpeg`, type: 'image/jpeg' });
      }

      if (bannerImage !== oldUser.bannerImage) {
        formData.append('images', { uri: bannerImage, name: `bannerImage.jpeg`, type: 'image/jpeg' });
      }


      if (formData._parts.length > 0) {
        const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
        const encryptedIdToken = encryptData(idToken, SECRET_KEY);

        const response = await fetch(`http://192.168.29.62:5000/users/editProfile`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Authorization': 'Bearer ' + encryptedIdToken,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        })
        if (response.status === 200) {
          getProfile();
        }
      }
      SetSaving(false);
    } catch (error) {
      SetSaving(false);
      console.error(error);
    }
  }


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


  useEffect(() => {
    getProfile();
  }, [])

  const [changesMade, setChangesMade] = useState(false);

  const checkChangesMade = () => {
    if (oldUser.username !== username) setChangesMade(true);
    else if (oldUser.name !== Name) setChangesMade(true);
    else if (oldUser.bio !== bio) setChangesMade(true);
    else if (JSON.stringify(oldUser.interests) !== JSON.stringify(Interests)) {
      setChangesMade(true);
    } else if (profileImage !== oldUser.profileImage) {
      setChangesMade(true);
    } else if (bannerImage !== oldUser.bannerImage) {
      setChangesMade(true);
    } else {
      navigation.goBack();
    }
  }



  return (
    <View style={styles.Container}>
      <View style={styles.SettingsPrivacyNav}>
        <View style={styles.SettingsPrivacyNavLeft}>
          <Pressable onPress={() => { Keyboard.dismiss(); checkChangesMade() }} style={styles.BackButton}>
            <Image source={require('../assets/Icons/animeIcons/BackButton.png')} style={styles.BackButtonImage} />
          </Pressable>
          <Text style={styles.PageTitle}>Edit Profile</Text>
        </View>
        <Pressable onPress={saveProfile} style={styles.EditProfileSave}>
          <Text style={styles.EditProfileSaveText}>Save</Text>
        </Pressable>
      </View>
      {loading ?
        (<View style={styles.LoadingContainer}>
          <LoaderAnimation size={40} color={'#49505B'} />
        </View>) :
        <ScrollView contentContainerStyle={styles.MainContent}>
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
          <View style={styles.userNameInputView}>
            <Text style={styles.userNameInputTitle}>Username</Text>
            <TextInput placeholder='Your Username' value={username} onChangeText={setUsername} style={styles.userNameInput} />
            <View style={styles.userNamePrecautionsView}>
              {usernameText}
              <Text style={styles.userNamePrecautionsText}>0/25</Text>
            </View>
          </View>
          <View style={styles.userNameInputView}>
            <Text style={styles.userNameInputTitle}>Name</Text>
            <TextInput placeholder='Your Name' value={Name} onChangeText={setName} style={styles.userNameInput} />
            <View style={styles.userNamePrecautionsView}>
              <Text style={styles.userNamePrecautionsText}>0/25</Text>
            </View>
          </View>
          <View style={styles.BioInputView}>
            <BioInput Bio={bio} setBio={setBio} />
          </View>
          <View style={[styles.BioInputView, { marginBottom: moderateScale(32) }]}>
            <SelectInterests Interests={Interests} setInterests={setInterests} />
          </View>
        </ScrollView>}
      {saving && <SavingProfileLoader />}
      <ConfirmationPrompt showConfirmationPrompt={changesMade} TitleText={'You have unsaved changes, Save before you leave ?'}
        onPressOne={() => { navigation.goBack(); }} onPressTwo={() => { setChangesMade(false); saveProfile(); navigation.goBack(); }} OneText={'Cancel'} TwoText={'Save'} />
    </View>
  )
}


export default EditProfile

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  SettingsPrivacyNav: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  SettingsPrivacyNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
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
    color: '#1C170D',
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
  },
  EditProfileSaveText: {
    fontSize: Height * 0.020,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  MainContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
  },
  changeImageView: {
    marginBottom: moderateScale(60),
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
  BioInputView: {
    width: '100%',
    marginTop: -moderateScale(20),
  },
  userNameInputView: {
    marginTop: moderateScale(20),
    width: '100%',
  },
  userNameInputTitle: {
    color: '#A1824A',
    fontSize: Height * 0.016,
    fontFamily: 'PlusJakartaSans',
  },
  userNameInput: {
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#A1824A',
    padding: 0,
    paddingHorizontal: moderateScale(5),
  },
  userNamePrecautionsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userNamePrecautionsText: {
    fontSize: Height * 0.014,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
  LoadingContainer: {
    height: 0.82 * Height,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});