import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils/constants'
import { AddMessageContact } from '../../services/messageService'

const AccountChatmateButton = ({ handleChatmateClick, userBlocked, requested, chatmate, UserCustomUUID, navigation, CommonActions }) => {
  return (
    (userBlocked ?

      (<Pressable style={styles.RequestedButton}>
        <Text style={styles.RequestedButtonText}>Unblock</Text>
      </Pressable>)

      : (<View style={styles.AddMateOptionsContainer}>
        {(!requested && !chatmate) && <Pressable onPress={() => { handleChatmateClick() }} style={styles.AddChatMateButton}>
          <Image source={require('../../assets/Icons/AddChatMate.png')} style={styles.AddChatMateButtonImage} />
          <Text style={styles.AddChatMateButtonText}>Add Chatmate</Text>
        </Pressable>}

        {requested &&
          <Pressable style={styles.RequestedButton}>
            <Text style={styles.RequestedButtonText}>Requested</Text>
          </Pressable>}

        {chatmate &&
          <Pressable onPress={() => { AddMessageContact(UserCustomUUID, navigation, CommonActions) }} style={styles.RequestedButton}>
            <Text style={styles.RequestedButtonText}>Message</Text>
          </Pressable>}
      </View>))
  )
}

export default AccountChatmateButton

const styles = StyleSheet.create({
  AddMateOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    marginTop: moderateScale(8),
  },
  AddChatMateButton: {
    height: moderateScale(42),
    paddingHorizontal: moderateScale(24),
    backgroundColor: '#A1824A',
    borderRadius: moderateScale(100),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
  },
  AddChatMateButtonImage: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  AddChatMateButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'PlusJakartaSans',
  },
  RequestedButton: {
    height: moderateScale(42),
    paddingHorizontal: moderateScale(24),
    backgroundColor: '#fff',
    borderRadius: moderateScale(100),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(12),
    borderWidth: moderateScale(2),
    borderColor: '#A1824A',
  },
  RequestedButtonText: {
    fontSize: Height * 0.020,
    fontWeight: '600',
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  },
});