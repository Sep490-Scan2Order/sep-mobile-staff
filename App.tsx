import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import MainApp from './src/MainApp';
import './global.css';
export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}
