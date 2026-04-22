import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RootNavigator from '@/navigation/RootNavigator';
import WelcomeScreen from './screen/public/WelcomeScreen';

export default function MainApp() {
  const dispatch = useDispatch();
  const [isWelcomeFinished, setIsWelcomeFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcomeFinished(true);
    }, 5000);

    const logoutSubscription = DeviceEventEmitter.addListener('AUTH_LOGOUT', () => {
      dispatch(logout());
    });

    return () => {
      clearTimeout(timer);
      logoutSubscription.remove();
    };
  }, [dispatch]);
  return (
    <SafeAreaProvider>
      {!isWelcomeFinished ? <WelcomeScreen /> : <RootNavigator />}
      <Toast />
    </SafeAreaProvider>
  );
}
