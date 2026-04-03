import React from 'react';
import { render } from '@testing-library/react-native';
import { ReportHistoryScreen } from './ReportHistoryScreen';

// Mock components
jest.mock('@/components/HeaderDetail', () => ({
  HeaderDetail: () => null,
}));
jest.mock('@/components/StatCard', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return {
        StatCard: ({ label }: any) => <View><Text>{label}</Text></View>,
    };
});
jest.mock('@/components/HistoryCard', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        HistoryCard: () => <View />,
    };
});

describe('ReportHistoryScreen', () => {
    it('renders correctly', () => {
        const { getByText } = render(<ReportHistoryScreen />);
        // Check for labels from StatCards
        expect(getByText(/T[ổ|o]/i)).toBeTruthy();
        expect(getByText(/Kh[ớ|o]/i)).toBeTruthy();
    });
});
