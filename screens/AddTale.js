import { StyleSheet, Text, View, Image, Pressable, TextInput, KeyboardAvoidingView, Keyboard, Animated as Anime, PanResponder, FlatList, ScrollView, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { moderateScale } from 'react-native-size-matters';
import { Height } from '../utils'
import { useFonts } from 'expo-font';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';
import {
  Grayscale, sepia, tint, ColorMatrix, concatColorMatrices, invert, contrast, saturate
} from 'react-native-color-matrix-image-filters'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, } from 'react-native-reanimated';

import { FIREBASE_AUTH } from '../firebaseConfig'
import { encryptData, decryptData } from '../EncryptData'
import AsyncStorage from '@react-native-async-storage/async-storage'


import Constants from 'expo-constants';
import SavingProfileLoader from '../components/SmallEssentials/SavingProfileLoader';
const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;


const AddTale = ({ navigation, route }) => {

  const filterAnimation = useRef(new Anime.Value(0)).current;
  const InputContainerHeightAnimation = useRef(new Anime.Value(0)).current;
  const InputContainerOpacityAnimation = useRef(new Anime.Value(0)).current;
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [currentShownImage, setCurrentShownImage] = useState(0);
  const [TextMode, setTextMode] = useState();
  const [loading, setLoading] = useState(false);


  const fonts = ['Amatic_SC', 'Cinzel', 'Comfortaa', 'Lobster', 'Oswald', 'Pacifico',
    'Playfair_Display', 'Quicksand', 'Raleway', 'Roboto',];

  const [fontsLoaded] = useFonts({
    'Amatic_SC': require("../assets/Fonts/Amatic_SC/AmaticSC-Regular.ttf",),
    'Cinzel': require("../assets/Fonts/Cinzel/static/Cinzel-Regular.ttf",),
    'Comfortaa': require("../assets/Fonts/Comfortaa/static/Comfortaa-Regular.ttf",),
    'Lobster': require("../assets/Fonts/Lobster/Lobster-Regular.ttf",),
    'Oswald': require("../assets/Fonts/Oswald/static/Oswald-Regular.ttf",),
    'Pacifico': require("../assets/Fonts/Pacifico/Pacifico-Regular.ttf",),
    'Playfair_Display': require("../assets/Fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf",),
    'Quicksand': require("../assets/Fonts/Quicksand/static/Quicksand-Regular.ttf",),
    'Raleway': require("../assets/Fonts/Raleway/static/Raleway-Regular.ttf",),
    'Roboto': require("../assets/Fonts/Roboto/Roboto-Regular.ttf"),
  });


  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages([...images, {
        image: result.assets[0].uri,
        filter: 'None'
      }]);
    }

    if (result.canceled && images.length === 0) {
      navigation.goBack();
    }

  }

  useEffect(() => {
    if (hasGalleryPermission && images.length === 0) {
      pickImage();
    }
  }, [hasGalleryPermission])


  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -50,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy < -20) {
        // Swipe up detected, trigger showFilterAnimation
        showFilterAnimation();
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -20) {
        // Swipe up detected, hideFilterAnimation if needed
        // hideFilterAnimation();
      }
    },
  });

  const showFilterAnimation = () => {
    Anime.parallel([
      Anime.timing(filterAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Anime.timing(InputContainerHeightAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Anime.timing(InputContainerOpacityAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const hideFilterAnimation = () => {
    Anime.parallel([
      Anime.timing(filterAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Anime.timing(InputContainerHeightAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
      Anime.timing(InputContainerOpacityAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const filterAnimationInterpolate = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [moderateScale(128), 0],
  });
  const InputContainerHeightAnimationInterpolate = InputContainerHeightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [moderateScale(119), 0],
  });
  const InputContainerOpacityAnimationInterpolate = InputContainerOpacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });


  const changeImageFilter = (filterName) => {
    const newImages = [...images];
    newImages[currentShownImage].filter = filterName;
    setImages(newImages);
  };


  // Text Mode

  const [Texts, setTexts] = useState([]);
  const inputRefs = useRef([]); // Create a ref for the text input
  const currentEditInputIndex = useRef(null);
  const [ColorSlider, setColorSlider] = useState(false);

  const handleTextModePress = () => {
    setTexts([...Texts, { text: '', id: Texts.length, background: 'transparent', alignment: 'center', color: `rgb(${red}, ${green}, ${blue})`, imageIndex: currentShownImage, position: { X: 0, Y: 0 } }]);
  };

  const handleOnChange = (text, index) => {
    const updatedTexts = [...Texts];
    updatedTexts[index].text = text;
    if (updatedTexts[index].text.length === 0) {
      updatedTexts.splice(index, 1);
    }
    setTexts(updatedTexts);
  };

  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };
  const blurInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].blur();
    }
  };

  const getCurrentEditIndex = (index) => {
    currentEditInputIndex.current = index;
  }

  const ChangeCurrentInputBackground = () => {
    const updatedTexts = [...Texts];
    if (updatedTexts[currentEditInputIndex.current].background === 'transparent') {
      updatedTexts[currentEditInputIndex.current].background = '#000';
    } else if (updatedTexts[currentEditInputIndex.current].background === '#000') {
      updatedTexts[currentEditInputIndex.current].background = '#fff';
    } else if (updatedTexts[currentEditInputIndex.current].background === '#fff') {
      updatedTexts[currentEditInputIndex.current].background = '#ffffffb3';
    } else if (updatedTexts[currentEditInputIndex.current].background === '#ffffffb3') {
      updatedTexts[currentEditInputIndex.current].background = 'transparent';
    }
    setTexts(updatedTexts);
  }

  const changeCurrentInputAlignment = () => {
    const updatedTexts = [...Texts];
    if (updatedTexts[currentEditInputIndex.current].alignment === 'center') {
      updatedTexts[currentEditInputIndex.current].alignment = 'left';
    } else if (updatedTexts[currentEditInputIndex.current].alignment === 'left') {
      updatedTexts[currentEditInputIndex.current].alignment = 'right';
    } else if (updatedTexts[currentEditInputIndex.current].alignment === 'right') {
      updatedTexts[currentEditInputIndex.current].alignment = 'center';
    }
    setTexts(updatedTexts);
  }

  useEffect(() => {
    if (TextMode && Texts.length > 0) {
      focusInput(Texts.length - 1);
    }
  }, [TextMode, Texts]);

  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);

  const onColorChange = (color, setter) => {

    setter(color);
  };

  const changeCurrentInputFont = (font) => {
    const updatedTexts = [...Texts];
    updatedTexts[currentEditInputIndex.current].font = font;
    setTexts(updatedTexts);
  }


  // To Change Text Size on Zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // To Move Text Around Freely

  const onLeft = useSharedValue(true);
  const position = useSharedValue(0);
  const END_POSITION = 100;
  const translateY = useSharedValue(0); // Add this line to track the y-axis translation

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (onLeft.value) {
        position.value = e.translationX;
      } else {
        position.value = END_POSITION + e.translationX;
      }
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (position.value > END_POSITION / 2) {
        position.value = withTiming(END_POSITION, { duration: 100 });
        onLeft.value = false;
      } else {
        position.value = withTiming(0, { duration: 100 });
        onLeft.value = true;
      }
    });


  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }, { translateY: translateY.value }],
  }));


  useEffect(() => {
    const updatedTexts = [...Texts];
    const currentTextIndex = currentEditInputIndex.current;
    if (updatedTexts[currentTextIndex]) {
      updatedTexts[currentTextIndex].position.X = position.value;
      updatedTexts[currentTextIndex].position.Y = translateY.value;
      setTexts(updatedTexts);
    }
  }, [position.value, translateY.value])

  useEffect(() => {
    position.value = 0;
    translateY.value = 0;
  }, [currentEditInputIndex.current])




  const PostTale = async () => {
    try {
      setLoading(true);
      const idToken = await FIREBASE_AUTH.currentUser.getIdToken();
      const encryptedIdToken = encryptData(idToken, SECRET_KEY);
      const formData = new FormData(); // Create FormData object

      // Append images to FormData object
      images.forEach((image, index) => {
        formData.append('image', { uri: image.image, name: `image${index}.jpg`, type: 'image/jpeg' });
        formData.append('filter', JSON.stringify({ name: image.filter, imageIndex: index }));
      });

      // Append other data to FormData object
      formData.append('caption', caption);
      formData.append('texts', JSON.stringify(Texts));

      // const response = await fetch(`http://10.0.2.2:5000/users/AddTale`, {
      const response = await fetch(`https://server-production-3bdc.up.railway.app/users/AddTale`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer ' + encryptedIdToken,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.status === 200) {
        setLoading(false);
        navigation.navigate('Chats');
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }






  return (
    <View style={styles.AddTale}  {...panResponder.panHandlers}>
      {loading && <SavingProfileLoader />}
      {images.length !== 0 &&
        <>
          {TextMode ?
            (<View style={styles.AddTaleTopContent}>
              <Pressable onPress={() => { Keyboard.dismiss(); blurInput(Texts.length - 1); setTextMode(false); }} style={styles.TextModeDoneButton}>
                <Text style={styles.TextModeDoneButtonText}>Done</Text>
              </Pressable>
              <View style={styles.TextModeTextSettings}>
                <Pressable onPress={() => { setColorSlider(!ColorSlider) }} style={styles.TextModeAlignButton}>
                  <Image source={require('../assets/Icons/ColorPickerIcon.png')} style={styles.TextModeAlignButtonImage} />
                </Pressable>


                <Pressable onPress={changeCurrentInputAlignment} style={styles.TextModeAlignButton}>
                  {currentEditInputIndex.current ? (
                    (Texts[currentEditInputIndex.current].alignment === 'center') ? (
                      <Image source={require('../assets/Icons/AlignTextCenter.png')} style={styles.TextModeAlignButtonImage} />
                    ) : (Texts[currentEditInputIndex.current].alignment === 'left') ? (
                      <Image source={require('../assets/Icons/AlignTextLeft.png')} style={styles.TextModeAlignButtonImage} />
                    ) : (Texts[currentEditInputIndex.current].alignment === 'right') && (
                      <Image source={require('../assets/Icons/AlignTextRight.png')} style={styles.TextModeAlignButtonImage} />
                    )
                  ) : <Image source={require('../assets/Icons/AlignTextCenter.png')} style={styles.TextModeAlignButtonImage} />}
                </Pressable>

                <Pressable onPress={ChangeCurrentInputBackground} style={styles.TextModeChangeBackgroundButton}>
                  {currentEditInputIndex.current ? (Texts[currentEditInputIndex.current].background === 'transperent' ?
                    <Image source={require('../assets/Icons/ChangeBackgroundWhite.png')} style={styles.TextModeChangeBackgroundButtonImage} />
                    : <Image source={require('../assets/Icons/ChangeBackgroundDark.png')} style={styles.TextModeChangeBackgroundButtonImage} />)
                    : <Image source={require('../assets/Icons/ChangeBackgroundWhite.png')} style={styles.TextModeChangeBackgroundButtonImage} />}
                </Pressable>


              </View>
            </View>)
            : (<View style={styles.AddTaleTopContent}>
              <Pressable onPress={() => { navigation.goBack(); Keyboard.dismiss() }} style={styles.removeTaleButton}>
                <Image source={require('../assets/Icons/CrossButton.png')} style={styles.removeTaleButtonImage} />
              </Pressable>
              <View style={styles.EditOptionsContaner}>
                {/* <Pressable onPress={() => { setTextMode(true); handleTextModePress(); }} style={styles.TextButton}>
                  <Image source={require('../assets/Icons/TextButton.png')} style={styles.TextButtonImage} />
                </Pressable> */}
                {/* <Pressable style={styles.DoodleButton}>
                  <Image source={require('../assets/Icons/DoodleButton.png')} style={styles.DoodleButtonImage} />
                </Pressable> */}
              </View>
            </View>)}


          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); hideFilterAnimation(); blurInput(Texts.length - 1); }}>
            {images[currentShownImage].filter === 'None' ? (
              <Image source={{ uri: images[currentShownImage].image }} style={styles.TaleImage} />
            ) : images[currentShownImage].filter === 'Grayscale' ? (
              <Grayscale>
                <Image source={{ uri: images[currentShownImage].image }} style={styles.TaleImage} />
              </Grayscale>
            ) : images[currentShownImage].filter === 'Combined' ? (
              <ColorMatrix matrix={concatColorMatrices(sepia(), tint(1.25))}>
                <Image source={{ uri: images[currentShownImage].image }} style={styles.TaleImage} />
              </ColorMatrix>
            ) : images[currentShownImage].filter === 'Matrix' ? (
              <ColorMatrix matrix={concatColorMatrices(saturate(-0.9), contrast(5.2), invert())}>
                <Image source={{ uri: images[currentShownImage].image }} style={styles.TaleImage} />
              </ColorMatrix>
            ) : null}
          </TouchableWithoutFeedback>



          {Texts.map((text, i) => {
            if (text.imageIndex === currentShownImage) {
              return (
                <GestureDetector key={i} gesture={pinchGesture}>
                  <GestureDetector gesture={panGesture}>
                    <Animated.View style={[{
                      transform: [{ scale: scale }], position: 'absolute', backgroundColor: text.background,
                      // transform: [{ scale: scale }, { translateX: position }, { translateY: translateY }], position: 'absolute', backgroundColor: text.background,
                      borderRadius: moderateScale(4), paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(12)
                    }, animatedStyle]}>
                      <TextInput value={text.text} onPressOut={() => { setTextMode(true) }} onChangeText={(newText) => handleOnChange(newText, i)} multiline={true}
                        style={{
                          fontSize: 40, color: text.background === '#fff' ? '#000' : text.background === '#ffffffb3' ? '#333' : text.background === '#000' ? '#fff' : `rgb(${red}, ${green}, ${blue})`,
                          textAlign: text.alignment, fontFamily: text.font ? text.font : undefined,
                        }} onFocus={() => { getCurrentEditIndex(i) }} ref={(ref) => { inputRefs.current[i] = ref; }} />
                    </Animated.View>
                  </GestureDetector>
                </GestureDetector>
              );
            }
          })}


          {ColorSlider &&
            <View style={{ position: 'absolute', top: '10%', width: '100%', backgroundColor: '#fff', paddingVertical: moderateScale(8), gap: moderateScale(12) }}>
              <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={red} onValueChange={(value) => onColorChange(value, setRed)}
                minimumTrackTintColor="#FF0000" thumbTintColor="#FF0000" />
              <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={green} onValueChange={(value) => onColorChange(value, setGreen)}
                minimumTrackTintColor="#00FF00" thumbTintColor="#00FF00" />
              <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={blue} onValueChange={(value) => onColorChange(value, setBlue)}
                minimumTrackTintColor="#0000FF" thumbTintColor="#0000FF" />
            </View>}

          {TextMode ?
            (<View style={styles.AddTaleBottomContent}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ChangeFontButtonList}>
                {fonts.map((font, i) => {
                  return (
                    <Pressable onPress={() => { changeCurrentInputFont(font); }} key={i} style={styles.FontChangeButton}>
                      <Text style={[styles.FontChangeButtonText, { fontFamily: font }]}>Aa</Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>) :
            (<Anime.View style={[styles.AddTaleBottomContent, { transform: [{ translateY: filterAnimationInterpolate }], }]}>
              <View style={styles.FilterTextImage}>
                <Image source={require('../assets/Icons/SwipeUp.png')} style={styles.FilterTextIcon} />
                <Text style={styles.FilterText}>Filters</Text>
              </View>
              <Anime.View style={[styles.AllImageInput, { height: InputContainerHeightAnimationInterpolate, opacity: InputContainerOpacityAnimationInterpolate }]}>
                <View style={styles.AllImages}>
                  {images.map((image, i) => {
                    return (
                      <Pressable onPress={() => { setCurrentShownImage(i) }} key={i} style={[styles.otherImageButton,
                      currentShownImage === i && { borderColor: '#F7706E', }]}>
                        <Image source={{ uri: image.image }} style={styles.otherImage} />
                      </Pressable>
                    )
                  })}
                </View>
                <View style={styles.CaptionInputContainer}>
                  <View style={styles.InputContainer}>
                    <Pressable onPress={() => { pickImage() }} style={styles.AddImageButton}>
                      <Image source={require('../assets/Icons/AddImage.png')} style={styles.AddImageButtonIcon} />
                    </Pressable>
                    <TextInput style={styles.CaptionInput} value={caption} onChangeText={setCaption} placeholder='Add a caption...' placeholderTextColor={'#A4A4A4'} />
                  </View>
                  <Pressable onPress={() => { PostTale() }} style={styles.PostButton}>
                    <Image source={require('../assets/Icons/Post.png')} style={styles.PostButtonImage} />
                  </Pressable>
                </View>
              </Anime.View>
              <View style={styles.FiltersContainer}>
                <Pressable onPress={() => { changeImageFilter('None') }} style={styles.FilterButton}>
                  <Image source={{ uri: images[currentShownImage].image }} style={[styles.FilterButtonImage,
                  images[currentShownImage].filter === 'None' && { borderWidth: 2, borderColor: '#F7706E' }]} />
                  <Text style={styles.FilterButtonText}>None</Text>
                </Pressable>
                <Pressable onPress={() => { changeImageFilter('Grayscale') }} style={styles.FilterButton}>
                  <Grayscale>
                    <Image source={{ uri: images[currentShownImage].image }} style={[styles.FilterButtonImage,
                    images[currentShownImage].filter === 'Grayscale' && { borderWidth: 2, borderColor: '#F7706E' }]} />
                  </Grayscale>
                  <Text style={styles.FilterButtonText}>Grayscale</Text>
                </Pressable>
                <Pressable onPress={() => { changeImageFilter('Combined') }} style={styles.FilterButton}>
                  <ColorMatrix matrix={concatColorMatrices(sepia(), tint(1.25))}>
                    <Image source={{ uri: images[currentShownImage].image }} style={[styles.FilterButtonImage,
                    images[currentShownImage].filter === 'Combined' && { borderWidth: 2, borderColor: '#F7706E' }]} />
                  </ColorMatrix>
                  <Text style={styles.FilterButtonText}>Combined</Text>
                </Pressable>
                <Pressable onPress={() => { changeImageFilter('Matrix') }} style={styles.FilterButton}>
                  <ColorMatrix matrix={concatColorMatrices(saturate(-0.9), contrast(5.2), invert())}>
                    <Image source={{ uri: images[currentShownImage].image }} style={[styles.FilterButtonImage,
                    images[currentShownImage].filter === 'Matrix' && { borderWidth: 2, borderColor: '#F7706E' }]} />
                  </ColorMatrix>
                  <Text style={styles.FilterButtonText}>Matrix</Text>
                </Pressable>
              </View>
            </Anime.View>)
          }
        </>
      }
    </View >
  )
}


export default AddTale;

const styles = StyleSheet.create({
  AddTale: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  TaleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  // AddTaleMainContent: {
  //   position: 'absolute',
  //   paddingHorizontal: moderateScale(16),
  //   paddingTop: moderateScale(30),
  //   paddingBottom: moderateScale(20),
  //   top: 0,
  //   left: 0,
  //   width: '100%',
  //   justifyContent: 'space-between',
  //   height: '100%',
  // },
  AddTaleTopContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(20),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  EditOptionsContaner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(28),
  },
  removeTaleButton: {
    width: moderateScale(32),
    height: moderateScale(32),
  },
  removeTaleButtonImage: {
    height: '100%',
    width: '100%',
  },
  TextButton: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  TextButtonImage: {
    height: '100%',
    width: '100%',
  },
  DoodleButton: {
    height: moderateScale(28),
    width: moderateScale(28),
  },
  DoodleButtonImage: {
    height: '100%',
    width: '100%',
  },
  TextModeDoneButton: {
    borderWidth: moderateScale(2),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(100),
    borderColor: '#fff',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(3),
  },
  TextModeDoneButtonText: {
    color: '#fff',
    fontSize: Height * 0.018,
    fontWeight: '600',
  },
  TextModeTextSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(16),
  },
  TextModeAlignButton: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  TextModeAlignButtonImage: {
    height: '100%',
    width: '100%',
  },
  TextModeChangeBackgroundButton: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  TextModeChangeBackgroundButtonImage: {
    height: '100%',
    width: '100%',
  },
  ///////////////////////////////////////
  AddTaleBottomContent: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(20),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(28),
  },
  FilterTextImage: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4),
  },
  FilterTextIcon: {
    height: moderateScale(20),
    width: moderateScale(20),
  },
  FilterText: {
    color: '#fff',
    fontSize: Height * 0.015,
  },
  AllImageInput: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(28),
  },
  AllImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4),
  },
  otherImageButton: {
    height: moderateScale(50),
    width: moderateScale(50),
    borderWidth: moderateScale(2),
  },
  otherImage: {
    height: '100%',
    width: '100%',
  },
  CaptionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  InputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(100),
    borderWidth: moderateScale(1.6),
    borderColor: '#A4A4A4',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    width: '85%',
    gap: moderateScale(20),
  },
  CaptionInput: {
    height: '100%',
    color: '#fff',
    width: '82%',
  },
  AddImageButton: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  AddImageButtonIcon: {
    height: '100%',
    width: '100%',
  },
  PostButton: {
    height: moderateScale(40),
    width: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7706E',
    borderRadius: moderateScale(100),
  },
  PostButtonImage: {
    marginRight: moderateScale(4),
    height: moderateScale(30),
    width: moderateScale(30),
  },
  FiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    backgroundColor: '#00000099',
  },
  FilterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  FilterButtonImage: {
    height: moderateScale(70),
    width: moderateScale(70),
  },
  FilterButtonText: {
    color: '#fff',
    fontSize: Height * 0.016,
  },
  ChangeFontButtonList: {
    gap: moderateScale(12),
  },
  FontChangeButton: {
    height: moderateScale(28),
    width: moderateScale(28),
    borderRadius: moderateScale(100),
    backgroundColor: '#fff',
    // backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  FontChangeButtonText: {
    fontSize: Height * 0.016,
    color: '#49505B',
  },
});

// this needs to be added to the expo app.json

// [
//   "expo-font",
//   {
//     "fonts": [
//       "./assets/Fonts/Amatic_SC/AmaticSC-Regular.ttf",
//       "./assets/Fonts/Cinzel/static/Cinzel-Regular.ttf",
//       "./assets/Fonts/Comfortaa/static/Comfortaa-Regular.ttf",
//       "./assets/Fonts/Lobster/Lobster-Regular.ttf",
//       "./assets/Fonts/Oswald/static/Oswald-Regular.ttf",
//       "./assets/Fonts/Pacifico/Pacifico-Regular.ttf",
//       "./assets/Fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf",
//       "./assets/Fonts/Quicksand/static/Quicksand-Regular.ttf",
//       "./assets/Fonts/Raleway/static/Raleway-Regular.ttf",
//       "./assets/Fonts/Roboto/Roboto-Regular.ttf"
//     ]
//   }
// ]