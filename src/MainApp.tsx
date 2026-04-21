import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RootNavigator from '@/navigation/RootNavigator';
import WelcomeScreen from './screen/public/WelcomeScreen';
export default function MainApp() {
  const [isWelcomeFinished, setIsWelcomeFinished] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcomeFinished(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <SafeAreaProvider>
      {!isWelcomeFinished ? <WelcomeScreen /> : <RootNavigator />}
      <Toast />
    </SafeAreaProvider>
  );
}
