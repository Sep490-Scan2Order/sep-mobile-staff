import React from 'react';
import { render } from '@testing-library/react-native';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders correctly with given number and label', () => {
    const { getByText } = render(<StatCard number={10} label="Total Dishes" />);
    
    expect(getByText('10')).toBeTruthy();
    expect(getByText('Total Dishes')).toBeTruthy();
  });

  it('renders zero count correctly', () => {
    const { getByText } = render(<StatCard number={0} label="Zero Label" />);
    
    expect(getByText('0')).toBeTruthy();
    expect(getByText('Zero Label')).toBeTruthy();
  });
});
