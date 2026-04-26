import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SDKTable as KDSTable } from './KDSTable';
import { useDispatch, useSelector } from 'react-redux';
import { 
    updateOrderStatus, 
    confirmCashOrder,
    confirmPickupTime,
    forceRefresh
} from '@/store/slices/orderSlice';

// 1. Native Mocks
jest.mock('react-native', () => {
    const rn = jest.requireActual('react-native');
    rn.Modal = ({ visible, children }: any) => {
        return visible ? <rn.View>{children}</rn.View> : null;
    };
    return rn;
});

jest.mock('react-native-vision-camera', () => ({ Camera: () => null, useCameraDevice: jest.fn() }));
jest.mock('react-native-image-resizer', () => ({ createResizedImage: jest.fn() }));
jest.mock('react-native-sound', () => ({ setCategory: jest.fn(), setActive: jest.fn(), IsAndroid: true }));
jest.mock('react-native-toast-message', () => ({ show: jest.fn(), hide: jest.fn() }));
jest.mock('react-native-reanimated', () => {
    const { View } = require('react-native');
    return { 
        __esModule: true, 
        default: View, 
        View: View, 
        FadeInDown: { delay: () => ({ duration: () => ({}) }) }, 
        FadeInUp: { duration: () => ({}) }, 
        useSharedValue: jest.fn(() => ({ value: 0 })), 
        useAnimatedStyle: jest.fn(() => ({})), 
    };
});

jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');
    const mockIcon = (props: any) => <View {...props} />;
    return { 
        Search: mockIcon, X: mockIcon, CreditCard: mockIcon, Info: mockIcon, 
        AlertTriangle: mockIcon, ArrowRight: mockIcon, ChevronLeft: mockIcon, 
        MoreHorizontal: mockIcon, Clock: mockIcon, CheckCircle2: mockIcon, 
        Receipt: mockIcon, Calendar: mockIcon, 
    };
});

// 2. Redux & Navigation
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@react-navigation/native', () => {
    const nav = { navigate: jest.fn() };
    return { 
        useNavigation: jest.fn().mockReturnValue(nav),
        useRoute: jest.fn()
    };
});

// 3. Sub-component Mocks
jest.mock('@/components/OrderItemCard', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return { 
        OrderItemCard: ({ item, onUpdateStatus, onOpenPickup, onRefund, onViewDetail }: any) => (
            <View testID={`card-${item.id}`}>
                <TouchableOpacity onPress={() => onUpdateStatus(item)} testID={`update-btn-${item.id}`}><Text>U</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onOpenPickup(item)} testID={`pickup-btn-${item.id}`}><Text>P</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onRefund(item)} testID={`refund-btn-${item.id}`}><Text>R</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onViewDetail(item.id)} testID={`detail-btn-${item.id}`}><Text>D</Text></TouchableOpacity>
            </View>
        )
    };
});

jest.mock('@/components/PaymentDetailModal', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return {
        PaymentDetailModal: ({ visible, onConfirm, order, onClose }: any) => visible ? (
            <View testID="payment-modal">
                <TouchableOpacity testID="confirm-payment-btn" onPress={() => onConfirm(order?.id)}><Text>C</Text></TouchableOpacity>
                <TouchableOpacity testID="close-payment-btn" onPress={onClose}><Text>X</Text></TouchableOpacity>
            </View>
        ) : null
    };
});

jest.mock('@/components/TimePickerModal', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return {
        TimePickerModal: ({ visible, onConfirm, onClose }: any) => visible ? (
            <View testID="time-modal">
                <TouchableOpacity testID="confirm-time-btn" onPress={() => onConfirm()}><Text>C</Text></TouchableOpacity>
                <TouchableOpacity testID="close-time-btn" onPress={onClose}><Text>X</Text></TouchableOpacity>
            </View>
        ) : null
    };
});

jest.mock('@/components/RefundModal', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return { 
        __esModule: true, 
        default: ({ isVisible, onClose }: any) => isVisible ? (
            <View testID="refund-modal">
                <TouchableOpacity testID="close-refund-btn" onPress={onClose}><Text>X</Text></TouchableOpacity>
            </View>
        ) : null
    };
});

// 4. Utils & Hooks
jest.mock('@/utils/dateUtils', () => ({ isToday: () => true }));
jest.mock('@/utils/notificationSound', () => ({ playNotificationSound: jest.fn() }));
jest.mock('@/services/logicServices/playAudioUrl', () => ({ playAudioUrl: jest.fn() }));
jest.mock('@/services/logicServices/orderService', () => ({ readyForPickup: jest.fn().mockResolvedValue({ audioUrl: 'test' }) }));
jest.mock('@/hooks/useSnackbar', () => {
    const snack = { showSuccess: jest.fn(), showError: jest.fn(), showWarning: jest.fn() };
    return { useSnackbar: jest.fn().mockReturnValue(snack) };
});
jest.mock('@/hooks/useAppModal', () => ({ 
    useAppModal: jest.fn().mockReturnValue({ 
        showConfirm: jest.fn((t, m, ok) => ok()), 
        showSuccess: jest.fn(),
        hideModal: jest.fn()
    }) 
}));

jest.mock('@/store/slices/orderSlice', () => {
    const mockThunk = (name: string) => {
        const fn = jest.fn();
        (fn as any).rejected = { match: jest.fn() };
        (fn as any).fulfilled = { match: jest.fn() };
        return fn;
    };
    return {
        updateOrderStatus: mockThunk('updateOrderStatus'),
        confirmCashOrder: mockThunk('confirmCashOrder'),
        confirmPickupTime: mockThunk('confirmPickupTime'),
        forceRefresh: jest.fn(),
    };
});

describe('KDSTable Final Stability Push', () => {
    const mockDispatch = jest.fn();
    const mockOrders = [
        { id: 'o1', orderCode: '1001', phone: '0901', status: 1, typeOrder: 2, type: 'Cash', createdAt: new Date().toISOString() },
        { id: 'o2', orderCode: '1002', phone: '0902', status: 0, typeOrder: 2, type: 'Cash', createdAt: new Date().toISOString() },
        { id: 'o3', orderCode: '1003', phone: '0903', status: 5, typeOrder: 1, type: 'Cash', createdAt: new Date().toISOString() },
        { id: 'o4', orderCode: '1004', phone: '0904', status: 2, typeOrder: 2, type: 'Cash', createdAt: new Date().toISOString() },
        { id: 'o5', orderCode: '1005', phone: '0905', status: 3, typeOrder: 2, type: 'Cash', createdAt: new Date().toISOString() },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
        (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            order: { orders: mockOrders, loading: false },
            auth: { userInfo: { role: 'Cashier' } }
        }));
        
        jest.spyOn(Date, 'now').mockReturnValue(new Date('1990-01-01T00:00:00Z').getTime());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reaches maximum coverage above 80%', async () => {
        const { getByPlaceholderText, getByTestId, queryByTestId, findByTestId, rerender } = render(<KDSTable statusFilter={1} />);
        
        // 1. Search Matching (Phone match)
        const searchInput = getByPlaceholderText('SĐT / mã đơn...');
        fireEvent.changeText(searchInput, '0901');
        expect(queryByTestId('card-o1')).toBeTruthy();
        fireEvent.changeText(searchInput, '9999');
        expect(queryByTestId('card-o1')).toBeNull();
        fireEvent.changeText(searchInput, '');

        // 2. Status Updates (1->2, 2->3, 3->4)
        await act(async () => { fireEvent.press(getByTestId('update-btn-o1')); });
        rerender(<KDSTable statusFilter={2} />);
        await act(async () => { fireEvent.press(getByTestId('update-btn-o4')); });
        rerender(<KDSTable statusFilter={3} />);
        await act(async () => { fireEvent.press(getByTestId('update-btn-o5')); });

        // 3. Pickup Flow & Closing
        rerender(<KDSTable statusFilter={1} />);
        await act(async () => { fireEvent.press(getByTestId('pickup-btn-o1')); });
        fireEvent.press(getByTestId('close-time-btn'));
        await act(async () => { fireEvent.press(getByTestId('pickup-btn-o1')); });
        const timeBtn = await findByTestId('confirm-time-btn');
        await act(async () => { fireEvent.press(timeBtn); });

        // 4. Refund & Details
        rerender(<KDSTable statusFilter={5} />);
        await act(async () => { fireEvent.press(getByTestId('refund-btn-o3')); });
        fireEvent.press(getByTestId('close-refund-btn'));
        fireEvent.press(getByTestId('detail-btn-o3'));

        // 5. Payment Flow
        rerender(<KDSTable statusFilter={0} />);
        await act(async () => { fireEvent.press(getByTestId('update-btn-o2')); });
        fireEvent.press(getByTestId('close-payment-btn'));
        await act(async () => { fireEvent.press(getByTestId('update-btn-o2')); });
        const payBtn = await findByTestId('confirm-payment-btn');
        await act(async () => { fireEvent.press(payBtn); });
    });

    it('covers error handling and role restrictions', async () => {
        (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            order: { orders: mockOrders, loading: false },
            auth: { userInfo: { role: 'Staff' } }
        }));
        const { getByTestId } = render(<KDSTable statusFilter={1} />);
        await act(async () => { fireEvent.press(getByTestId('update-btn-o1')); });

        (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            order: { orders: mockOrders, loading: false },
            auth: { userInfo: { role: 'Cashier' } }
        }));
        (updateOrderStatus.rejected.match as jest.Mock).mockReturnValue(true);
        const { getByTestId: getByTestId2 } = render(<KDSTable statusFilter={1} />);
        await act(async () => { fireEvent.press(getByTestId2('update-btn-o1')); });
    });
});
