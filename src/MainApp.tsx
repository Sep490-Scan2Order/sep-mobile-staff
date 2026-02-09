import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import WelcomeScreen from './screen/public/WelcomeScreen';
import AuthNavigator from './navigation/AuthNavigator';

export default function MainApp() {
  const [isWelcomeFinished, setIsWelcomeFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcomeFinished(true);
    }, 5000); // 5 giây

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!isWelcomeFinished ? <WelcomeScreen /> : <AuthNavigator />}
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
