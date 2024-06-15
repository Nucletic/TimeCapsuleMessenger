import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { moderateScale } from 'react-native-size-matters';
import { Height, Width } from '../../utils';

const PasswordInput = ({ underText, underTextColor, inputBorderColor, data, inputName, setData, placeholder }) => {
  const [feild, setFeild] = useState(null);
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (feild) {
      let newData = data;
      newData[inputName] = feild.trim();
      setData(newData);
    }
  }, [feild])


  return (
    <View style={[styles.InputContainer, inputBorderColor && { borderColor: inputBorderColor }]}>
      <TextInput style={styles.TextInput} secureTextEntry={hidden} placeholderTextColor={'#9095A0'} value={feild} onChangeText={(text) => { setFeild(text) }} placeholder={placeholder} />
      <Pressable onPress={() => { setHidden(!hidden) }}>
        <Image source={hidden ? require('../../assets/Icons/PasswordHidden.png') : require('../../assets/Icons/PasswordShown.png')} style={styles.PasswordInputEye} />
      </Pressable>
      <Text style={[styles.inputUnderText, underTextColor && { color: underTextColor }]}>{underText}</Text>
    </View>
  )
}

export default PasswordInput;

const styles = StyleSheet.create({
  InputContainer: {
    backgroundColor: '#fff',
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(12),
    borderColor: '#E0E0E0',
    height: moderateScale(45),
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  TextInput: {
    fontSize: Height * 0.020,
    color: '#49505B',
    height: '100%',
    width: '88%',
    paddingHorizontal: moderateScale(14),
  },
  PasswordInputEye: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  inputUnderText: {
    fontSize: Height * 0.014,
    position: 'absolute',
    top: '103%',
  }
});