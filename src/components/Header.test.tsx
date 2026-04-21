import React from 'react';
import { render } from '@testing-library/react-native';
import { Header } from './Header';
describe('Header', () => {
  it('renders correctly', () => {
    const { getByRole, UNSAFE_getByType } = render(<Header />);
    const { Image } = require('react-native');
    const image = UNSAFE_getByType(Image);
    expect(image).toBeTruthy();
    expect(image.props.resizeMode).toBe('contain');
  });
});
