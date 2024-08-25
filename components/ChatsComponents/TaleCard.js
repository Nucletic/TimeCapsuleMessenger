import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height } from '../../utils';
import { useNavigation } from '@react-navigation/native';



const TaleCard = ({ data, CustomUUID }) => {

  const navigation = useNavigation();

  

  const getTale = () => {
    return true;
  }

  const truncateUsername = (username, maxLength) => {
    if (username.length > maxLength) {
      return username.substring(0, maxLength - 3) + '...'; // Subtract 3 for the ellipsis
    } else {
      return username;
    }
  }

  const handleTalePress = () => {
    if (CustomUUID) {
      navigation.navigate('OwnTale', { data: data });
    } else {
      navigation.navigate('Tale', { data: data });
    }
  }


  return (
    <Pressable onPress={handleTalePress} style={styles.TaleCard}>
      <View style={[styles.TaleCardBorder, { backgroundColor: getTale() ? '#F7706E' : '#fff' }]}>
        <Image source={{ uri: data.profileImage }} style={styles.TaleCardImage} />
      </View>
      <Text style={styles.TaleCardText}>{truncateUsername(data.username, 10)}</Text>
    </Pressable>
  )
}

export default TaleCard;

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
    color: '#1b160b',
    fontWeight: '600',
    fontSize: Height * 0.016,
    margin: moderateScale(2),
    fontFamily: 'PlusJakartaSans',
  }
});