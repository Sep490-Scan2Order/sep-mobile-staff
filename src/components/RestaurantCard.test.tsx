import React from 'react';
import { render } from '@testing-library/react-native';
import { RestaurantCard } from './RestaurantCard';

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  MapPin: () => null,
  Clock: () => null,
}));

describe('RestaurantCard', () => {
  const mockProps = {
    name: 'Test Restaurant',
    address: '123 Test St',
    openTime: '08:00 - 22:00',
    image: 'https://example.com/image.jpg',
  };

  it('renders correctly with props', () => {
    const { getByText, UNSAFE_getByType } = render(<RestaurantCard {...mockProps} />);
    const { Image } = require('react-native');

    expect(getByText('Test Restaurant')).toBeTruthy();
    expect(getByText('123 Test St')).toBeTruthy();
    expect(getByText('08:00 - 22:00')).toBeTruthy();

    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: mockProps.image });
  });
});
