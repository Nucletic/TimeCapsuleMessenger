import { ImageBackground, Keyboard, KeyboardAvoidingView, StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Height, Width } from '../utils';
import { moderateScale } from 'react-native-size-matters';
import Input from '../components/RegistrationComponents/Input';
import PasswordInput from '../components/RegistrationComponents/PasswordInput';
import SubmitButton from '../components/RegistrationComponents/SubmitButton';
import GoogleRegistrationButton from '../components/RegistrationComponents/GoogleRegistrationButton';
import { encryptData, decryptData } from '../EncryptData';
import { signInWithCustomToken } from 'firebase/auth';
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';



import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const SignUp = ({ setCurrentPage, setUserEmail }) => {
  const [data, setData] = useState({ name: '', username: '', email: '', password: '', confirmpassword: '' });
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '36721383235-i01rm4kh6vigsm80rk74mo8q511hb936.apps.googleusercontent.com',
  });

  const [correct, setCorrect] = useState({
    nameText: null, nameColor: null, nameBorderColor: null,
    userNameText: null, userNameColor: null, userNameBorderColor: null,
    emailOrPhoneText: null, emailOrPhoneColor: null, emailOrPhoneBorderColor: null,
    passwordText: null, passwordColor: null, passwordBorderColor: null,
    confirmPasswordText: null, confirmPasswordColor: null, confirmPasswordBorderColor: null,
  });

  const validateData = () => {
    function containsAlphabets(str) {
      return /[a-zA-Z]/.test(str);
    }

    if (!data.name || data.name.length === 0) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        nameText: 'name feild cannot be empty',
        nameColor: '#FF0000',
        nameBorderColor: '#FF0000',
      }));
    } else if (data.name && data.name.length > 0) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        nameText: null,
        nameColor: null,
        nameBorderColor: null,
      }));
    }

    const isValidUsername = /^[a-zA-Z0-9._]+$/.test(data.username);

    if (!data.username || data.username.length === 0) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        userNameText: 'username cannot be empty',
        userNameColor: '#FF0000',
        userNameBorderColor: '#FF0000',
      }));
    } else if (!isValidUsername) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        userNameText: 'Invalid Username allowed charcters - a-z, A-Z, 0-9, _, .',
        userNameColor: '#FF0000',
        userNameBorderColor: '#FF0000',
      }));

    } else if (data.username && data.username.length > 0) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        userNameText: null,
        userNameColor: null,
        userNameBorderColor: null,
      }));
    }

    if (!data.email || data.email.length === 0) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        emailOrPhoneText: 'email or phone cannot be empty',
        emailOrPhoneColor: '#FF0000',
        emailOrPhoneBorderColor: '#FF0000',
      }));
    } else if (data.email && data.email.includes('@') && data.email.includes('.') && containsAlphabets(data.email)) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        emailOrPhoneText: null,
        emailOrPhoneColor: null,
        emailOrPhoneBorderColor: null,
      }));
    } else if (data.email && parseInt(data.email)) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        emailOrPhoneText: null,
        emailOrPhoneColor: null,
        emailOrPhoneBorderColor: null,
      }));
    } else {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        emailOrPhoneText: 'enter a valid email or phone number',
        emailOrPhoneColor: '#FF0000',
        emailOrPhoneBorderColor: '#FF0000',
      }));
    }
    if ((!data.password || data.password.length === 0)) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        passwordText: 'password cannot be empty',
        passwordColor: '#FF0000',
        passwordBorderColor: '#FF0000',
      }));
    } else if ((data.password && data.password.length < 8)) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        passwordText: 'password should be of atleast 8 charcters',
        passwordColor: '#FF0000',
        passwordBorderColor: '#FF0000',
      }));
    } else if ((data.password && !containsAlphabets(data.password))) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        passwordText: 'password should contain atleast 1 alphabet',
        passwordColor: '#FF0000',
        passwordBorderColor: '#FF0000',
      }));
    } else {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        passwordText: null,
        passwordColor: null,
        passwordBorderColor: null,
      }));
    }
    if (data.password !== data.confirmpassword) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        confirmPasswordText: 'confirm password does not match',
        confirmPasswordColor: '#FF0000',
        confirmPasswordBorderColor: '#FF0000',
      }));
    } else {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        confirmPasswordText: null,
        confirmPasswordColor: null,
        confirmPasswordBorderColor: null,
      }));
    }
    if (!correct.nameText && !correct.userNameText && !correct.emailOrPhoneText &&
      !correct.passwordText && !correct.confirmPasswordText) {
      CreateAccount();
    }
  };

  const CreateAccount = async () => {
    setLoading(true);
    const { name, username, email, password } = data;
    try {
      const encryptedEmail = encryptData(email, SECRET_KEY);
      const encryptedPassword = encryptData(password, SECRET_KEY);

      const response = await fetch('https://server-production-3bdc.up.railway.app/users/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name, username: username,
          email: encryptedEmail, password: encryptedPassword
        })
      });
      const data = await response.json();
      console.log(data.message);
      if (response.status === 200) {
        if (data.message === 'duplicateUsername') {
          setCorrect(prevCorrect => ({
            ...prevCorrect,
            userNameText: 'username is already taken',
            userNameColor: '#FF0000',
            userNameBorderColor: '#FF0000',
          }));

        } else if (data.message === 'userCreated') {

          await AsyncStorage.setItem('CustomUUID', JSON.stringify(data.CustomUUID))
          const decryptedCustomToken = decryptData(data.CustomToken, SECRET_KEY);
          await signInWithCustomToken(FIREBASE_AUTH, decryptedCustomToken);

          FIREBASE_AUTH.onAuthStateChanged((user) => {
            if (user) {
              setUserEmail(email);
              setCurrentPage('EMAILVERIFICATION');
            }
          })


        }
      } else if (data.message === 'The email address is already in use by another account.') {
        setCorrect(prevCorrect => ({
          ...prevCorrect,
          emailOrPhoneText: 'email already exists.',
          emailOrPhoneColor: '#FF0000',
          emailOrPhoneBorderColor: '#FF0000',
        }));
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };


  useEffect(() => {
    if (response?.type == 'success') {
      const { id_token } = response.params;
      const credentials = GoogleAuthProvider.credential(id_token);
      signInWithCredential(FIREBASE_AUTH, credentials);
    }
  }, [response])



  return (
    <Pressable onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={-240}>
        <ImageBackground source={require('../assets/Images/RegistrationBackground.jpg')} style={styles.Registration}>
          <View style={styles.RegistrationCover} />
          <View style={styles.RegistrationMainContainer}>
            <Text style={styles.RegistrationTitle}>Create Account</Text>
            <View style={styles.RegistrationInputs}>
              <Input underText={correct.nameText} underTextColor={correct.nameColor} inputBorderColor={correct.nameBorderColor}
                data={data} inputName={'name'} setData={setData} placeholder={'Name'} />
              <Input underText={correct.userNameText} underTextColor={correct.userNameColor} inputBorderColor={correct.userNameBorderColor}
                data={data} inputName={'username'} setData={setData} placeholder={'Username'} />
              <Input underText={correct.emailOrPhoneText} underTextColor={correct.emailOrPhoneColor} inputBorderColor={correct.emailOrPhoneBorderColor}
                data={data} inputName={'email'} setData={setData} placeholder={'Email'} />
              <PasswordInput underText={correct.passwordText} underTextColor={correct.passwordColor} inputBorderColor={correct.passwordBorderColor}
                data={data} inputName={'password'} setData={setData} placeholder={'Password'} />
              <PasswordInput underText={correct.confirmPasswordText} underTextColor={correct.confirmPasswordColor} inputBorderColor={correct.confirmPasswordBorderColor}
                data={data} inputName={'confirmpassword'} setData={setData} placeholder={'Confirm Password'} />
            </View>
            <SubmitButton loading={loading} onPress={() => { validateData() }} underOnPress={() => { setCurrentPage('LOGIN') }} title={'Create Account'}
              titleTwo={'Already have an account?'} ButtonText={'Log In'} />
            {/* <View style={styles.OrView}>
              <View style={styles.OrViewLeft} />
              <Text style={styles.OrViewText}>OR</Text>
              <View style={styles.OrViewRight} />
            </View>
            <GoogleRegistrationButton onPress={() => { promptAsync({ showInRecents: true }); }} title={'Sign up with Google'} /> */}
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </Pressable>
  )
}

export default SignUp;

const styles = StyleSheet.create({
  Registration: {
    height: Height,
    width: Width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  RegistrationCover: {
    height: Height,
    width: Width,
    backgroundColor: '#000',
    opacity: 0.4,
  },
  RegistrationMainContainer: {
    position: 'absolute',
    width: 0.85 * Width,
    borderRadius: moderateScale(6),
    backgroundColor: '#fff',
    padding: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  RegistrationTitle: {
    fontSize: Height * 0.030,
    fontWeight: '900',
    color: '#49505B',
  },
  RegistrationInputs: {
    width: '100%',
    marginTop: moderateScale(25),
    gap: moderateScale(16),
  },
  OrView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(15),
  },
  OrViewLeft: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: moderateScale(80),
  },
  OrViewRight: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: moderateScale(80),
  },
  OrViewText: {
    marginHorizontal: moderateScale(10),
    color: '#49505B',
    fontSize: Height * 0.017,
  }
});