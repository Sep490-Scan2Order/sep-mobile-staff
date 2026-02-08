import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AuthNavigator from './navigation/AuthNavigator';

export default function MainApp() {
 
  return (
    <SafeAreaProvider>
   <NavigationContainer>
  <AuthNavigator />
  <Toast />
</NavigationContainer>
    </SafeAreaProvider>
  );
}