import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CheckInScreen from './CheckInScreen';
import { useDispatch, useSelector } from 'react-redux';
import { shiftService } from '@/services/logicServices/shiftService';

// 1. Native Mocks
jest.mock('react-native', () => {
    const rn = jest.requireActual('react-native');
    rn.Modal = ({ visible, children }: any) => visible ? children : null;
    return rn;
});

jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');
    const mockIcon = (name: string) => (props: any) => <View testID={`icon-${name}`} {...props} />;
    return { 
        User: mockIcon('User'), Lock: mockIcon('Lock'), Unlock: mockIcon('Unlock'), 
        Info: mockIcon('Info'), ArrowLeft: mockIcon('ArrowLeft'), 
        Calendar: mockIcon('Calendar'), Clock: mockIcon('Clock')
    };
});

// 2. Redux & Navigation
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ 
    useNavigation: jest.fn().mockReturnValue({ navigate: jest.fn() }),
    useRoute: jest.fn()
}));

// 3. Service Mocks
jest.mock('@/services/logicServices/shiftService', () => ({
    shiftService: {
        checkIn: jest.fn(),
        checkOut: jest.fn(),
        getPreview: jest.fn(),
        blockShift: jest.fn(),
    }
}));

// 4. Utils & Hooks
jest.mock('@/hooks/useSnackbar', () => ({ 
    useSnackbar: jest.fn().mockReturnValue({ 
        showSuccess: jest.fn(), 
        showError: jest.fn() 
    }) 
}));

jest.mock('@/hooks/useAppModal', () => ({ 
    useAppModal: jest.fn().mockReturnValue({ 
        showConfirm: jest.fn((t, m, ok) => ok()), 
        showSuccess: jest.fn((t, m, ok) => ok && ok()),
        hideModal: jest.fn()
    }) 
}));

describe('CheckInScreen Maximum Coverage Push', () => {
    const mockDispatch = jest.fn();
    const mockUserInfo = { role: 'Cashier', id: 'u1', name: 'Test User' };

    beforeEach(() => {
        jest.clearAllMocks();
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('covers cashier checkout and error paths', async () => {
        (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            auth: { userInfo: mockUserInfo, restaurantId: 1 },
            shift: { 
                currentShift: { id: 123, startTime: new Date().toISOString() }, 
                currentShiftId: 123, 
                loading: false, 
                staffShifts: [{ id: 1, staffName: 'Staff 1', startDate: new Date().toISOString(), isBlocked: false }] 
            }
        }));

        const { getByText, getByTestId } = render(<CheckInScreen />);
        
        // 1. Toggle Block
        (shiftService.blockShift as jest.Mock).mockResolvedValue({ success: true });
        await act(async () => { fireEvent.press(getByTestId('icon-Lock').parent); });

        // 2. Cashier Checkout Success
        (shiftService.getPreview as jest.Mock).mockResolvedValue({ totalCashOrder: 100, expectedCashAmount: 100 });
        (shiftService.checkOut as jest.Mock).mockResolvedValue({ success: true });
        await act(async () => { fireEvent.press(getByText('KẾT THÚC CA (CHECK-OUT)')); });

        // 3. Preview Error path
        (shiftService.getPreview as jest.Mock).mockRejectedValue(new Error('Preview fail'));
        await act(async () => { fireEvent.press(getByText('KẾT THÚC CA (CHECK-OUT)')); });
    });

    it('covers staff checkout and check-in branches', async () => {
        // Staff Checkout
        (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            auth: { userInfo: { ...mockUserInfo, role: 'Staff' }, restaurantId: 1 },
            shift: { 
                currentShift: { id: 456, startTime: new Date().toISOString() }, 
                currentShiftId: 456, 
                loading: false, staffShifts: [] 
            }
        }));
        const { getByText: getByTextStaff } = render(<CheckInScreen />);
        (shiftService.checkOut as jest.Mock).mockResolvedValue({ success: true });
        await act(async () => { fireEvent.press(getByTextStaff('KẾT THÚC CA (CHECK-OUT)')); });

        // Check-in Error
        (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            auth: { userInfo: mockUserInfo, restaurantId: 1 },
            shift: { currentShift: null, currentShiftId: null, loading: false, staffShifts: [] }
        }));
        const { getByText: getByTextCI } = render(<CheckInScreen />);
        (shiftService.checkIn as jest.Mock).mockRejectedValue(new Error('CI fail'));
        await act(async () => { fireEvent.press(getByTextCI('BẮT ĐẦU CA (CHECK-IN)')); });
    });
});
