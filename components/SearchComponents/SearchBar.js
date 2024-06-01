import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Height, Width } from '../../utils'
import { moderateScale } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'

const SearchBar = () => {

  const navigation = useNavigation();

  return (
    <Pressable onPress={() => { navigation.navigate('SearchAccount') }} style={styles.SearchContainer}>
      <Image source={require('../../assets/Icons/Search.png')} style={styles.SearchIcon} />
      <Text style={styles.SearchText}>Search</Text>
    </Pressable>
  )
}

export default SearchBar;

const styles = StyleSheet.create({
  SearchContainer: {
    height: moderateScale(32),
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(6),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    marginHorizontal: moderateScale(16),
    gap: moderateScale(10),
  },
  SearchIcon: {
    height: moderateScale(18),
    width: moderateScale(18),
  },
  SearchText: {
    fontSize: Height * 0.018,
    width: '90%',
    color: '#c3c3c3',
  },
});