import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomePage from './WelcomeScreen';
describe('WelcomePage', () => {
  it('renders correctly', () => {
    const { UNSAFE_getByType } = render(<WelcomePage />);
    const { Image } = require('react-native');
    const image = UNSAFE_getByType(Image);
    expect(image).toBeTruthy();
    expect(image.props.source).toEqual({
      uri: 'https://res.cloudinary.com/dw08iedyd/image/upload/v1770542915/image-removebg-preview_1_hmto3f.png',
    });
  });
});
