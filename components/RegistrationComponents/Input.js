import { StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState, useEffect } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height, Width } from '../../utils';

const Input = ({ underText, underTextColor, inputBorderColor, data, inputName, setData, placeholder }) => {
  const [feild, setFeild] = useState('');
  useEffect(() => {
    setData(prevData => ({
      ...prevData,
      [inputName]: feild.trim(),
    }));
  }, [feild, inputName, setData]);


  return (
    <View style={[styles.InputContainer, inputBorderColor && { borderColor: inputBorderColor }]}>
      <TextInput style={styles.TextInput} placeholderTextColor={'#9095A0'} value={feild} onChangeText={setFeild} placeholder={placeholder} />
      <Text style={[styles.inputUnderText, underTextColor && { color: underTextColor }]}>{underText && underText}</Text>
    </View>
  )
}

export default Input;

const styles = StyleSheet.create({
  InputContainer: {
    backgroundColor: '#fff',
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(12),
    borderColor: '#E0E0E0',
    height: moderateScale(45),
    width: '100%',
  },
  TextInput: {
    fontSize: Height * 0.020,
    color: '#49505B',
    height: '100%',
    width: '100%',
    paddingHorizontal: moderateScale(14),
  },
  inputUnderText: {
    fontSize: Height * 0.014,
    position: 'absolute',
    top: '103%',
  }
});