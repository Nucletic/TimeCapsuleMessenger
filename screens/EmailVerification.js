import { StyleSheet, Text, View, Pressable, Keyboard, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Height, Width } from '../utils'
import { moderateScale } from 'react-native-size-matters'
import LoaderAnimation from '../components/SmallEssentials/LoaderAnimation'
import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData } from '../EncryptData'

import Constants from 'expo-constants';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;

const EmailVerification = ({ userEmail, setCurrentPage }) => {

  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let intervalId;

    if (isActive && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    }

    if (seconds === 0) {
      clearInterval(intervalId);
      setIsActive(false);
    }

    return () => clearInterval(intervalId);
  }, [isActive, seconds]);

  const resendEmail = async () => {
    try {
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      // const response = await fetch('http://10.0.2.2:5000/users/resendVerificationEmail', {
      const response = await fetch('http://192.168.29.8:5000/users/resendVerificationEmail', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      if (response.status === 200) { }
    } catch (error) {
      throw new Error(error)
    }
  }

  const CheckStatus = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      await user.reload();
      if (user.emailVerified) {
        setCurrentPage('EDITPROFILE');
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };


  const handleResendClick = () => {
    if (!isActive) {
      setIsActive(true);
      setSeconds(60);
      resendEmail();
    }
  }


  return (
    <Pressable onPress={Keyboard.dismiss}>
      <ImageBackground source={require('../assets/Images/RegistrationBackground.jpg')} style={styles.background}>
        <View style={styles.backgroundCover} />
        <View style={styles.MainContainer}>
          <Text style={styles.FirstEmailText}>We've sent an email to {userEmail && userEmail}</Text>
          <Text style={styles.SecondEmailText}>Please check your email and complete email verification.
            if you don't see it, try checking your spam folder</Text>
          <LoaderAnimation size={40} color={'#49505B'} />
          <View style={styles.EmailVerificationButtonView}>
            <Pressable onPress={handleResendClick} style={[styles.ResendEmailButton, isActive && { borderColor: '#999' }]}>
              <Text style={[styles.ResendEmailButtonText, isActive && { color: '#999' }]}>{isActive ? (seconds < 10 ? `00:0${seconds}` : `00:${seconds}`) : 'Resend Email'}</Text>
            </Pressable>
            <Pressable onPress={CheckStatus} style={styles.CheckStatusButton}>
              <Text style={styles.CheckStatusButtonText}>Check Status</Text>
            </Pressable>
          </View>
          <Text style={styles.ThirdEmailText}>This usually takes less than a minute.</Text>
        </View>
      </ImageBackground>
    </Pressable>
  )
}

export default EmailVerification;

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
  MainTitle: {
    fontSize: Height * 0.030,
    fontWeight: '900',
    color: '#49505B',
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
    marginVertical: moderateScale(20),
  },
  ResendEmailButton: {
    backgroundColor: '#fff',
    borderWidth: moderateScale(2),
    borderColor: '#F7706E',
    marginTop: moderateScale(20),
    width: moderateScale(130),
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
    marginTop: moderateScale(20),
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
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
    gap: moderateScale(12),
  },
});