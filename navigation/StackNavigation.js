import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from '../screens/SignUp';
import Login from '../screens/Login';
import Chats from '../screens/Chats';
import Account from '../screens/Account';
import ChatSearch from '../screens/ChatSearch';
import Tale from '../screens/Tale';
import AddTale from '../screens/AddTale';
import Chatbox from '../screens/Chatbox';
import Search from '../screens/Search';
import SearchAccount from '../screens/SearchAccount';
import RecentSearches from '../screens/RecentSearches';
import SettingsPrivacy from '../screens/SettingsPrivacy';
import EditProfile from '../screens/EditProfile';
import AccountPrivacy from '../screens/AccountPrivacy';
import BlockedAccounts from '../screens/BlockedAccounts';
import FriendsInfo from '../screens/FriendsInfo';
import ChatInfo from '../screens/ChatInfo';
import Notification from '../screens/Notification';
import EditProfileOnRegister from '../screens/EditProfileOnRegister';
import OwnTale from '../screens/OwnTale';
import ImageShow from '../screens/ImageShow';
import Subscribe from '../screens/Subscribe';

const Stack = createNativeStackNavigator();

export const RegistrationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'SignUp'}>
      <Stack.Screen name='SignUp' component={SignUp} />
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='EditProfileOnRegister' component={EditProfileOnRegister} />
    </Stack.Navigator>
  )
}

export const AccountStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Account'}>
      <Stack.Screen name='Account' component={Account} />
      <Stack.Screen name='SettingsPrivacy' component={SettingsPrivacy} />
      <Stack.Screen name='EditProfile' component={EditProfile} />
      <Stack.Screen name='AccountPrivacy' component={AccountPrivacy} />
      <Stack.Screen name='BlockedAccounts' component={BlockedAccounts} />
      <Stack.Screen name='FriendsInfo' options={{ animation: 'fade_from_bottom' }} component={FriendsInfo} />
      <Stack.Screen name='Subscribe' component={Subscribe} />
    </Stack.Navigator>
  )
}

export const SearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Search'}>
      <Stack.Screen name='Search' component={Search} />
      <Stack.Screen name='SearchAccount' component={SearchAccount} />
      <Stack.Screen name='RecentSearches' component={RecentSearches} />
      <Stack.Screen name='Account' component={Account} />
      <Stack.Screen name='FriendsInfo' options={{ animation: 'fade_from_bottom' }} component={FriendsInfo} />
    </Stack.Navigator>
  )
}


export const ChatsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Chats'}>
      <Stack.Screen name='Chats' component={Chats} />
      <Stack.Screen name='ChatSearch' options={{ animation: 'none' }} component={ChatSearch} />
      <Stack.Screen name='Tale' options={{ animation: 'fade_from_bottom' }} component={Tale} />
      <Stack.Screen name='OwnTale' options={{ animation: 'fade_from_bottom' }} component={OwnTale} />
      <Stack.Screen name='AddTale' component={AddTale} />
      <Stack.Screen name='ChatBox' component={Chatbox} />
      <Stack.Screen name='ChatInfo' component={ChatInfo} />
      <Stack.Screen name='ImageShow' options={{ animation: 'fade_from_bottom' }} component={ImageShow} />
    </Stack.Navigator>
  )
}
export const NotificationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Chats'}>
      <Stack.Screen name='Notification' component={Notification} />
    </Stack.Navigator>
  )
}