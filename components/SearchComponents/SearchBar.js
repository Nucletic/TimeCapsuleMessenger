import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { useFonts } from 'expo-font'

const SearchBar = ({ title, onPress }) => {

  


  const navigation = useNavigation();

  return (
    <Pressable onPress={onPress} style={styles.SearchContainer}>
      <Image source={require('../../assets/Icons/animeIcons/SearchIcon.png')} style={styles.SearchIcon} />
      {title && <Text style={styles.SearchText}>{title}</Text>}
    </Pressable>
  )
}

export default SearchBar;

const styles = StyleSheet.create({
  SearchContainer: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(8),
    height: moderateScale(40),
    backgroundColor: '#f5efe8',
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    gap: moderateScale(10),
  },
  SearchIcon: {
    height: moderateScale(22),
    width: moderateScale(22),
  },
  SearchText: {
    fontSize: Height * 0.02,
    width: '90%',
    color: '#a3814a',
    fontFamily: 'PlusJakartaSans',
  },
});