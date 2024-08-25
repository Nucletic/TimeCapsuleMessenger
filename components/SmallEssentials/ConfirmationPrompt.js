import { Pressable, StyleSheet, Text, View, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'



const ConfirmationPrompt = ({ showConfirmationPrompt, TitleText, OneText, TwoText, onPressOne, onPressTwo }) => {


  



  const OpacityAnimation = useRef(new Animated.Value(0)).current;
  const ContentAnimation = useRef(new Animated.Value(0)).current;
  const ContentOpacityAnimation = useRef(new Animated.Value(0)).current;

  const showPrompt = () => {
    Animated.timing(ContentOpacityAnimation, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start();
    Animated.timing(ContentAnimation, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start();
    Animated.timing(OpacityAnimation, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }
  const hidePrompt = () => {
    Animated.timing(ContentOpacityAnimation, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start();
    Animated.timing(ContentAnimation, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start();
    Animated.timing(OpacityAnimation, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }

  const opacityAnimationInterpolate = OpacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })
  const ContentOpacityAnimationInterpolate = ContentOpacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })
  const contentAnimationInterpolate = ContentAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  })

  useEffect(() => {
    if (showConfirmationPrompt) {
      showPrompt();
    } else hidePrompt();
  }, [showConfirmationPrompt])



  return (
    <View style={[styles.ConfirmationPrompt, { pointerEvents: showConfirmationPrompt ? 'auto' : 'none' }]}>
      <Animated.View style={[styles.PromptShadow, { opacity: opacityAnimationInterpolate, pointerEvents: showConfirmationPrompt ? 'auto' : 'none' }]}>
        <Animated.View style={[styles.confirmationPromptContent, { opacity: ContentOpacityAnimationInterpolate, transform: [{ scale: contentAnimationInterpolate }] }]}>
          <View style={styles.Title}>
            <Text style={styles.TitleText}>{TitleText && TitleText}</Text>
          </View>
          <View style={styles.PromptButtons}>
            <Pressable onPress={onPressOne} style={styles.PromptMainButton}>
              <Text style={styles.GoodButtonText}>{OneText && OneText}</Text>
            </Pressable>
            <View style={styles.ButtonDivider} />
            <Pressable onPress={onPressTwo} style={styles.PromptMainButton}>
              <Text style={styles.BadButtonText}>{TwoText && TwoText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </View >
  )
}

export default ConfirmationPrompt

const styles = StyleSheet.create({
  ConfirmationPrompt: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  PromptShadow: {
    height: '100%',
    width: '100%',
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationPromptContent: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '65%',
    height: moderateScale(130),
    justifyContent: 'space-between',
    borderRadius: moderateScale(15),
  },
  Title: {
    height: '65%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TitleText: {
    fontSize: Height * 0.020,
    fontWeight: '700',
    color: "#1C170D",
    fontFamily: 'PlusJakartaSans',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    paddingHorizontal: moderateScale(10),
  },
  PromptButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '35%',
    borderTopColor: '#F0F0F1',
    borderTopWidth: moderateScale(1),
  },
  ButtonDivider: {
    width: moderateScale(1),
    height: '100%',
    backgroundColor: '#F0F0F1',
  },
  PromptMainButton: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  GoodButtonText: {
    fontSize: Height * 0.02,
    color: "#1C170D",
    fontFamily: 'PlusJakartaSans',
  },
  BadButtonText: {
    fontSize: Height * 0.02,
    color: "#A1824A",
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans',
  }
});