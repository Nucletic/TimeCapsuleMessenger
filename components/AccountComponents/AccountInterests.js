import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils/constants'

const AccountInterests = ({ userBlocked, interests }) => {
  return (
    <>
      {!userBlocked &&
        <View style={styles.ProfileInterestsContainer}>
          <Text style={styles.ProfileInterestsTitle}>INTERESTS</Text>
          <View style={styles.ProfileInterests}>
            {interests.map((item, index) => {
              return (
                <View key={index} style={styles.MainProfileInterest}>
                  <Text style={styles.MainProfileInterestText}>{item}</Text>
                </View>
              )
            })}
          </View>
        </View>}
    </>
  )
}

export default AccountInterests

const styles = StyleSheet.create({
  ProfileInterestsContainer: {
    marginTop: moderateScale(16),
    borderWidth: moderateScale(1),
    borderColor: '#E5DFD8',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginHorizontal: moderateScale(16),
  },
  ProfileInterestsTitle: {
    color: '#9095A0',
    fontSize: Height * 0.016,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans',
  },
  ProfileInterests: {
    marginTop: moderateScale(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: moderateScale(8),
  },
  MainProfileInterest: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(4),
    backgroundColor: '#f5efe8',
    borderWidth: moderateScale(1.6),
    borderColor: '#A1824A',
    borderRadius: moderateScale(25),
  },
  MainProfileInterestText: {
    fontSize: Height * 0.020,
    color: '#1C170D',
    fontFamily: 'PlusJakartaSans',
  },
});