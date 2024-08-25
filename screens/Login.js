import { ImageBackground, Keyboard, KeyboardAvoidingView, StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Height, Width } from '../utils';
import { moderateScale } from 'react-native-size-matters';
import Input from '../components/RegistrationComponents/Input';
import PasswordInput from '../components/RegistrationComponents/PasswordInput';
import SubmitButton from '../components/RegistrationComponents/SubmitButton';
import { FIREBASE_AUTH } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';


import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;



const Login = ({ setCurrentPage, setLoggedIn }) => {

  const [data, setData] = useState({ email: null, phone: null, password: null });
  const [loading, setLoading] = useState(false);
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
    if (!data.email || data.email.length === 0) {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        emailOrPhoneText: 'email cannot be empty',
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
    } else {
      setCorrect(prevCorrect => ({
        ...prevCorrect,
        passwordText: null,
        passwordColor: null,
        passwordBorderColor: null,
      }));
    }

    if (!correct.nameText && !correct.userNameText &&
      !correct.emailOrPhoneText && !correct.passwordText &&
      !correct.confirmPasswordText) {
      LoginAccount();
    }
  };

  const LoginAccount = async () => {
    setLoading(true);
    const { email, password } = data;
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const customUUID = idTokenResult.claims.CustomUUID;
      await AsyncStorage.setItem('CustomUUID', customUUID);
      FIREBASE_AUTH.onAuthStateChanged(async (user) => {
        if (user) {
          setLoggedIn(true);
        }
      });
      setLoading(false);
    } catch (error) {
      if (error.message === 'Firebase: Error (auth/invalid-credential).') {
        setCorrect(prevCorrect => ({
          ...prevCorrect,
          passwordText: 'invalid Credentials',
          passwordColor: '#FF0000',
          passwordBorderColor: '#FF0000',
        }));
        setCorrect(prevCorrect => ({
          ...prevCorrect,
          emailOrPhoneText: 'invalid Credentials',
          emailOrPhoneColor: '#FF0000',
          emailOrPhoneBorderColor: '#FF0000',
        }));
      }
      setLoading(false);
      console.log('in login', error);
    }
  };

  return (
    <Pressable onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={-240}>
        <ImageBackground source={require('../assets/Images/RegistrationBackground.jpg')} style={styles.Registration}>
          <View style={styles.RegistrationCover} />
          <View style={styles.RegistrationMainContainer}>
            <Text style={styles.RegistrationTitle}>Log In</Text>
            <View style={styles.RegistrationInputs}>
              <Input underText={correct.emailOrPhoneText} underTextColor={correct.emailOrPhoneColor} inputBorderColor={correct.emailOrPhoneBorderColor}
                data={data} inputName={'email'} setData={setData} placeholder={'Email'} />
              <PasswordInput underText={correct.passwordText} underTextColor={correct.passwordColor} inputBorderColor={correct.passwordBorderColor}
                data={data} inputName={'password'} setData={setData} placeholder={'Password'} />
              {!correct.passwordText &&
                <Pressable onPress={() => { setCurrentPage('FORGOTPASSWORD') }} style={styles.forgotPasswordButton}>
                  <Text style={styles.forgotPasswordButtonText}>
                    Forgot password?
                  </Text>
                </Pressable>}
            </View>
            <SubmitButton loading={loading} onPress={() => { validateData() }} underOnPress={() => { setCurrentPage('SIGNUP') }} title={'Log in'}
              titleTwo={'Don\'t have an account?'} ButtonText={'Sign Up'} />
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </Pressable>
  )
}

export default Login;

const styles = StyleSheet.create({
  Registration: {
    height: Height - moderateScale(110),
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
  },
  forgotPasswordButton: {
    position: 'absolute',
    top: '89%',
    width: '100%',
    left: '62%',
  },
  forgotPasswordButtonText: {
    fontSize: Height * 0.016,
    color: '#9095A0',
  }
});