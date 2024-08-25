import Constants from 'expo-constants';
import { Dimensions } from "react-native";

export const API_TIMEOUT = 5000; // 5 seconds timeout for API calls
export const MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const DEFAULT_LANGUAGE = 'en';
export const SECRET_KEY = Constants.expoConfig.extra.SECRET_KEY;
export const Height = Dimensions.get('screen').height;
export const Width = Dimensions.get('screen').width;
