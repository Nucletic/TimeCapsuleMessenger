import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import SignUp from './SignUp';
import Login from './Login';
import EditProfileOnRegister from './EditProfileOnRegister';
import EmailVerification from './EmailVerification';
import ForgotPassword from './ForgotPassword';


const Registration = ({ setLoggedIn }) => {

  const [currentPage, setCurrentPage] = useState('LOGIN');
  const [userEmail, setUserEmail] = useState();

  return (
    <>
      {currentPage === "SIGNUP" ? <SignUp setLoggedIn={setLoggedIn} setUserEmail={setUserEmail} setCurrentPage={setCurrentPage} />
        : currentPage === "LOGIN" ? <Login setLoggedIn={setLoggedIn} setCurrentPage={setCurrentPage} />
          : currentPage === "EDITPROFILE" ? <EditProfileOnRegister setLoggedIn={setLoggedIn} />
            : currentPage === "EMAILVERIFICATION" ? <EmailVerification userEmail={userEmail} setCurrentPage={setCurrentPage} />
              : currentPage === "FORGOTPASSWORD" && <ForgotPassword setCurrentPage={setCurrentPage} />}
    </>
  )
}

export default Registration;

const styles = StyleSheet.create({});