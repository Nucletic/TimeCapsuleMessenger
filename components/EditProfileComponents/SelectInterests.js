import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Height } from '../../utils'
import { moderateScale } from 'react-native-size-matters'

const SelectInterests = ({ Interests, setInterests }) => {

  const [selected, setSelected] = useState(Interests ? Interests : []);

  const interests = [
    "Technology", "Art", "Music", "Books", "Travel", "Food", "Fitness", "Movies", "Photography", "Fashion", "Sports", "Gaming",
    "Cooking", "Nature", "Science", "History", "Writing", "DIY", "Pets", "Health", "Finance", "Education", "Politics", "Astrology",
    "Spirituality", "Crafts", "Languages", "Cars", "Outdoor Activities", "Social Media", "Entertainment"];

  const handleSelect = (item) => {
    if (selected.indexOf(item) !== -1) {
      const newArray = selected.filter(arrItem => arrItem !== item);
      setSelected(newArray);
      return;
    } else if (selected.length === 5) {
      return;
    }
    setSelected([...selected, item]);

  }

  useEffect(() => {
    setInterests(selected);
  }, [selected])


  return (
    <View style={styles.InputContainer}>
      <View style={styles.TitleContainer}>
        <Text style={styles.InputTitle}>INTERESTS</Text>
        <Text style={styles.InputTitle}>{selected.length}/5</Text>
      </View>
      <View style={styles.InterestsContainer}>
        {interests.map((item, index) => {
          return (
            <Pressable onPress={() => { handleSelect(item) }} key={index} style={[styles.Interest, { borderColor: (selected.indexOf(item) !== -1) ? '#49505B' : '#E9E9E9' }]}>
              <Text style={styles.InterestText}>{item}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default SelectInterests;

const styles = StyleSheet.create({
  InputContainer: {
    marginTop: moderateScale(40),
    width: '100%',
    backgroundColor: '#FBFBFB',
    borderWidth: moderateScale(1),
    borderColor: '#E9E9E9',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
  },
  TitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  InputTitle: {
    color: '#9095A0',
    fontSize: Height * 0.016,
    fontWeight: '500',
  },
  MainInput: {
    borderWidth: moderateScale(1.6),
    borderRadius: moderateScale(5),
    borderColor: '#C3C3C3',
    padding: moderateScale(8),
  },
  InterestsContainer: {
    marginTop: moderateScale(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: moderateScale(8),
  },
  Interest: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(4),
    backgroundColor: '#F3F4F6',
    borderWidth: moderateScale(1.6),
    borderColor: '#E9E9E9',
    borderRadius: moderateScale(25),
  },
  InterestText: {
    fontSize: Height * 0.020,
    color: '#49505B',
    fontWeight: '500',
  }
});