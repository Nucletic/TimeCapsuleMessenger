import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils'
import { useNavigation } from '@react-navigation/native'

const AddTale = () => {

  const navigation = useNavigation();

  const getTale = () => {
    // return true;
  }


  return (
    <Pressable onPress={() => { navigation.navigate('AddTale') }} style={styles.TaleCard}>
      <View style={[styles.TaleCardBorder, { backgroundColor: getTale() ? '#F7706E' : '#fff' }]}>
        <Image source={require('../../assets/Icons/EditProfileIcon.png')} style={styles.TaleCardImage} />
        <View style={styles.AddTaleIconView}>
          <Image source={require('../../assets/Icons/AddTale.png')} style={styles.AddTaleIcon} />
        </View>
      </View>
      <Text style={styles.TaleCardText}>Add Tale</Text>
    </Pressable>
  )
}

export default AddTale;

const styles = StyleSheet.create({
  TaleCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  TaleCardImage: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(50),
    borderWidth: 1.6,
    borderColor: '#fff',
  },
  TaleCardBorder: {
    backgroundColor: '#F7706E',
    borderRadius: moderateScale(50),
    width: moderateScale(54),
    height: moderateScale(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  TaleCardText: {
    color: '#9095A0',
    fontWeight: '600',
    fontSize: Height * 0.015,
    margin: moderateScale(2),
  },
  AddTaleIconView: {
    position: 'absolute',
    width: moderateScale(16),
    height: moderateScale(16),
    backgroundColor: '#fff',
    borderRadius: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    top: '68%',
    left: '68%',
    borderWidth: moderateScale(0.6),
    borderColor: '#c3c3c3',
  },
  AddTaleIcon: {
    position: 'absolute',
    width: moderateScale(14),
    height: moderateScale(14),
  },

});