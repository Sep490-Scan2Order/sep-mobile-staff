import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { Border } from './Border';

describe('Border', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <Border>
                <Text>Test Child</Text>
            </Border>
        );
        expect(getByText('Test Child')).toBeTruthy();
    });

    it('applies custom className', () => {
        const { UNSAFE_getByType } = render(
            <Border className="custom-class">
                <View />
            </Border>
        );
        const view = UNSAFE_getByType(View);
        // Checking for class in props as native-testing-library handles className by prop
        expect(view.props.className).toContain('custom-class');
    });
});
