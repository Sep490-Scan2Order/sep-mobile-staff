import React from 'react';
import { render } from '@testing-library/react-native';
import BottomTabs from './BottomTabs';
import { useSelector } from 'react-redux';

// 1. Mock Navigation
jest.mock('@react-navigation/bottom-tabs', () => {
    const { Text } = require('react-native');
    return {
        createBottomTabNavigator: jest.fn().mockReturnValue({
            Navigator: ({ children, screenOptions }: any) => {
                if (typeof screenOptions === 'function') {
                    ['KDS', 'Foods', 'Orders', 'Menu', 'CheckIn', 'CashReport', 'Unknown'].forEach(name => {
                        const opts = screenOptions({ route: { name } });
                        if (opts.tabBarIcon) {
                            opts.tabBarIcon({ color: 'red', size: 20 });
                        }
                    });
                }
                return <>{children}</>;
            },
            Screen: ({ name }: any) => <Text>{name}</Text>,
        }),
    };
});

// 2. Mock Screens
jest.mock('@/screen/private/KDSScreen', () => () => null);
jest.mock('@/screen/private/FoodManagementScreen', () => () => null);
jest.mock('@/screen/private/OrderStatusScreen', () => () => null);
jest.mock('@/screen/private/MenuManagementScreen', () => () => null);
jest.mock('@/screen/private/CheckInScreen', () => () => null);
jest.mock('@/screen/private/CashReportScreen', () => () => null);

// 3. Mock Icons
jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');
    return {
        ClipboardList: (props: any) => <View {...props} />,
        Utensils: (props: any) => <View {...props} />,
        ShoppingCart: (props: any) => <View {...props} />,
        Menu: (props: any) => <View {...props} />,
        QrCode: (props: any) => <View {...props} />,
        FileText: (props: any) => <View {...props} />,
    };
});

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));

describe('BottomTabs Coverage Passed', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all tabs for Cashier role', () => {
        (useSelector as unknown as jest.Mock).mockReturnValue({ role: 'Cashier' });
        const { getByText } = render(<BottomTabs />);
        expect(getByText('KDS')).toBeTruthy();
        expect(getByText('CheckIn')).toBeTruthy();
        expect(getByText('CashReport')).toBeTruthy();
    });

    it('renders specific tabs for Staff role', () => {
        (useSelector as unknown as jest.Mock).mockReturnValue({ role: 'Staff' });
        const { getByText, queryByText } = render(<BottomTabs />);
        expect(getByText('CheckIn')).toBeTruthy();
        expect(queryByText('CashReport')).toBeNull();
    });
});
