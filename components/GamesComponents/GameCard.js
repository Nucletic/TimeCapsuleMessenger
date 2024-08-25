import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height } from '../../utils'


const GameCard = ({ GameName, GameType, GameIcon, lGameLink }) => {
  return (
    <Pressable style={styles.GameCardContainer}>
      {GameIcon && <Image source={GameIcon} resizeMode='cover' style={styles.GameIcon} />}
      <View style={styles.GameCardInfo}>
        <View style={styles.MainGameInfo}>
          <Text style={styles.GameName}>{GameName && GameName}</Text>
          <Text style={styles.GameType}>{GameType && GameType}</Text>
        </View>
        <Image source={require('../../assets/Icons/animeIcons/PlayGameIcon.png')} style={styles.GamePlayIcon} />
      </View>
    </Pressable>
  )
}

export default GameCard

const styles = StyleSheet.create({
  GameCardContainer: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
  },
  GameIcon: {
    width: '100%',
    height: moderateScale(160),
    borderRadius: moderateScale(12),
  },
  GameCardInfo: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  GamePlayIcon: {
    height: moderateScale(32),
    width: moderateScale(32),
  },
  GameName: {
    fontSize: Height * 0.02,
    color: '#1C170D',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans',
  },
  GameType: {
    fontSize: Height * 0.017,
    color: '#A1824A',
    fontFamily: 'PlusJakartaSans',
  }
});