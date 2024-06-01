import { StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height } from '../../utils';

const BioInput = ({ Bio, setBio }) => {
  const [text, setText] = useState(Bio ? Bio : '');

  useEffect(() => {
    setBio(text);
  }, [text])

  return (
    <View style={styles.InputContainer}>
      <Text style={styles.InputTitle}>Bio</Text>
      <TextInput style={styles.MainInput} multiline={true} textAlignVertical={'top'} maxLength={100} numberOfLines={3} onChangeText={(val) => setText(val)} value={text} />
      <Text style={styles.InputLengthText}>{text.length}/100</Text>
    </View>
  )
}

export default BioInput;

const styles = StyleSheet.create({
  InputContainer: {
    marginTop: moderateScale(40),
    width: '100%',
  },
  InputTitle: {
    color: '#C3C3C3',
    fontSize: Height * 0.016,
  },
  MainInput: {
    borderWidth: moderateScale(1.6),
    borderRadius: moderateScale(5),
    borderColor: '#C3C3C3',
    padding: moderateScale(8),
    color: '#49505B',
    fontWeight: '500',
  },
  InputLengthText: {
    color: '#C3C3C3',
    fontSize: Height * 0.014,
    textAlign: 'right',
  },
});