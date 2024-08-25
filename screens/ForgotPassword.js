import { StyleSheet, Text, View, Keyboard, Pressable, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import { Height, Width } from '../utils';
import { moderateScale } from 'react-native-size-matters';
import Input from '../components/RegistrationComponents/Input';
import { FIREBASE_AUTH } from '../firebaseConfig';
import SubmitButton from '../components/RegistrationComponents/SubmitButton';
import { encryptData } from '../EncryptData'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const ForgotPassword = ({ setCurrentPage }) => {

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);


  const sendPasswordResetLink = async () => {
    // if (email.length === 0) {
    //   return
    // }
    try {
      setLoading(true);
      const encryptedEmail = encryptData('kuntalpriyanshu608@gmail.com', SECRET_KEY);
      // const response = await fetch('http://10.0.2.2:5000/users/forgotPassword', {
      const response = await fetch('http://192.168.29.62:5000/users/forgotPassword', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: encryptedEmail })
      });
      const data = await response.json();
      if (response.status === 200) {
        setLoading(false)
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  }



  return (
    <Pressable onPress={Keyboard.dismiss}>
      <ImageBackground source={require('../assets/Images/RegistrationBackground.jpg')} style={styles.background}>
        <View style={styles.backgroundCover} />
        <View style={styles.MainContainer}>
          <Text style={styles.FirstEmailText}>Reset your Password</Text>
          <Text style={styles.SecondEmailText}>We will send a mail to your email with a link to reset your account password.
            if you don't see it, try checking your spam folder</Text>
          <Input data={email} inputName={'email'} setData={setEmail} placeholder={'Email'} />
          <SubmitButton loading={loading} onPress={sendPasswordResetLink} title={'NEXT'} underOnPress={() => { setCurrentPage('LOGIN') }}
            titleTwo={'Got the email?'} ButtonText={'Login'} />
        </View>
      </ImageBackground>
    </Pressable>
  )
}

export default ForgotPassword

const styles = StyleSheet.create({
  background: {
    height: Height,
    width: Width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCover: {
    height: Height,
    width: Width,
    backgroundColor: '#000',
    opacity: 0.4,
  },
  FirstEmailText: {
    fontSize: Height * 0.022,
    fontWeight: '600',
    color: '#49505B',
    textAlign: 'center',
    lineHeight: Height * 0.030,
  },
  SecondEmailText: {
    fontSize: Height * 0.016,
    color: '#2F3237',
    textAlign: 'center',
    lineHeight: Height * 0.022,
    marginVertical: moderateScale(10),
  },
  MainContainer: {
    position: 'absolute',
    width: 0.85 * Width,
    borderRadius: moderateScale(6),
    backgroundColor: '#fff',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ResendEmailButton: {
    backgroundColor: '#fff',
    borderWidth: moderateScale(2),
    borderColor: '#F7706E',
    marginTop: moderateScale(12),
    width: moderateScale(140),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
  },
  ResendEmailButtonText: {
    color: '#F7706E',
    fontSize: Height * 0.018,
    fontWeight: '600',
  },
  ThirdEmailText: {
    color: '#9095A0',
    fontSize: Height * 0.014,
    marginTop: moderateScale(12),
  },
  CheckStatusButton: {
    backgroundColor: '#F7706E',
    marginTop: moderateScale(12),
    width: moderateScale(140),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  CheckStatusButtonText: {
    color: '#fff',
    fontSize: Height * 0.018,
    fontWeight: '600',
  },
  EmailVerificationButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  SendEmailButton: {
    width: '100%',
    backgroundColor: '#F7706E',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    marginTop: moderateScale(12),
    borderRadius: moderateScale(8),
  },
  SendEmailText: {
    color: '#fff',
    fontSize: Height * 0.02,
    fontWeight: '600',
  },
});