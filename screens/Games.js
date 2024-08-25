import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SearchBar from '../components/SearchComponents/SearchBar'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../utils'
import { StatusBar } from 'expo-status-bar'
import GameCard from '../components/GamesComponents/GameCard'


const Games = ({ navigation }) => {
  return (
    <ImageBackground source={require('../assets/Images/animeGirl1.jpg')} resizeMode="cover" style={styles.ImageBackgroundContainer}>
      <StatusBar style="light" />
      <SearchBar title={'Search Games'} onPress={() => { console.log('nothing') }} />
      <ScrollView style={styles.GamesContainer} contentContainerStyle={styles.GamesContainerContent}>
        <GameCard GameName={'Candy Crush Saga'} GameType={'Match-Three Puzzle'} GameIcon={require('../assets/Images/GameIcon.png')} />
        <GameCard GameName={'Clash Of Clans'} GameType={'strategy'} GameIcon={require('../assets/Images/GameIcon2.png')} />
        <GameCard GameName={'Gardenscapes'} GameType={'Match-Three Puzzle'} GameIcon={require('../assets/Images/GameIcon3.png')} />
        <GameCard GameName={'Toon Blast'} GameType={'Adventure'} GameIcon={require('../assets/Images/GameIcon4.png')} />
      </ScrollView>
    </ImageBackground>
  )
}

export default Games

const styles = StyleSheet.create({
  ImageBackgroundContainer: {
    paddingTop: moderateScale(25),
    height: Height,
    flex: 1,
  },
  GamesContainer: {
    paddingHorizontal: moderateScale(16),
    height: moderateScale(200),
    marginTop: moderateScale(16),
  },
  GamesContainerContent: {
    gap: moderateScale(12),
    paddingBottom: moderateScale(16),
  }
});