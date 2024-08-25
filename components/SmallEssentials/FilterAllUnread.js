import { StyleSheet, Text, View, Pressable, Animated, Easing } from 'react-native'
import React, { useRef, useState } from 'react'
import { moderateScale } from 'react-native-size-matters'
import { Height, Width } from '../../utils'



const FilterAllUnread = ({ firstFuncText, secondFuncText, onAllPress, onUnreadPress }) => {

  
  
  const [currentFilter, setCurrentFilte] = useState('All');
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const moveIndicator = (toValue) => {
    Animated.timing(indicatorPosition, {
      toValue,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const handlePressAll = () => {
    if (onAllPress) {
      onAllPress();
    }
    setCurrentFilte('All');
    moveIndicator(0);
  };

  const handlePressUnread = () => {
    if (onUnreadPress) {
      onUnreadPress();
    }
    setCurrentFilte('Unread');
    moveIndicator(1);
  };

  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Width / 2 - moderateScale(16) - moderateScale(3)],
  });


  return (
    <View style={styles.ChatsFilterButtonContainer}>
      <Pressable onPress={handlePressAll} style={styles.ChatsFilterButton}>
        <Text style={[styles.ChatsFilterButtonText, currentFilter === "All" && { fontWeight: '700', color: '#1b160b' }]}>
          {firstFuncText && firstFuncText}
        </Text>
      </Pressable>
      <Pressable onPress={handlePressUnread} style={styles.ChatsFilterButton}>
        <Text style={[styles.ChatsFilterButtonText, currentFilter === "Unread" && { fontWeight: '700', color: '#1b160b' }]}>
          {secondFuncText && secondFuncText}
        </Text>
      </Pressable>
      <Animated.View style={[styles.filterIndicator, { transform: [{ translateX: indicatorTranslateX }] }]} />
    </View>
  )
}

export default FilterAllUnread

const styles = StyleSheet.create({
  ChatsFilterButtonContainer: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(14),
    height: moderateScale(40),
    backgroundColor: '#f5efe8',
    borderRadius: moderateScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(3),
  },
  ChatsFilterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(34),
    borderRadius: moderateScale(50),

  },
  ChatsFilterButtonText: {
    fontSize: Height * 0.018,
    color: '#a3814a',
    fontFamily: 'PlusJakartaSans',
  },
  filterIndicator: {
    backgroundColor: '#fff',
    height: moderateScale(34),
    width: '49.8%',
    marginLeft: moderateScale(3),
    borderRadius: moderateScale(50),
    position: 'absolute',
    zIndex: -2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3
  },
});