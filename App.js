import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Index from './screens/Index';
import { AppProvider } from './ContextAPI/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

window.navigator.userAgent = "ReactNative";

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Index />
          <StatusBar hidden={false} barStyle={'dark-content'} translucent={true} backgroundColor={'rgba(0, 0, 0, 0)'} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AppProvider>
  );
}