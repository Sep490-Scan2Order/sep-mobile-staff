import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { persistor, store } from './src/store';
import MainApp from './src/MainApp';
import './global.css';
import { PersistGate } from 'redux-persist/lib/integration/react';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
