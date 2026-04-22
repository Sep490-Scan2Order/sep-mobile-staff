import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { persistor, store } from '@/store';
import MainApp from '@/MainApp';
import './global.css';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { navigationRef } from '@/utils/navigationUtils';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationRef}>
          <MainApp />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
