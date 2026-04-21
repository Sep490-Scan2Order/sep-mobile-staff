jest.setTimeout(15000);
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SDKTable } from './KDSTable';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { orderService } from '@/services/logicServices/orderService';
import { playAudioUrl } from '@/services/logicServices/playAudioUrl';
import { updateOrderStatus, confirmPickupTime } from '@/store/slices/orderSlice';
import { playNotificationSound } from '@/utils/notificationSound';
jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));
jest.mock('@/components/AppSnackbar', () => {
    const { View, Text } = require('react-native');
    return {
        AppSnackbar: ({ message, visible }: any) => {
            if (!visible) return null;
            return <View><Text>{message}</Text></View>;
        }
    };
});
jest.mock('@/store', () => ({}));
jest.mock('@/store/slices/orderSlice', () => {
    const createMockThunk = (name: string) => {
        const fn = jest.fn((args: any) => ({ type: `${name}/fulfilled`, payload: args })) as any;
        fn.rejected = { match: jest.fn((action: any) => action?.type === `${name}/rejected`) };
        fn.fulfilled = { match: jest.fn((action: any) => action?.type === `${name}/fulfilled`) };
        fn.pending = { match: jest.fn((action: any) => action?.type === `${name}/pending`) };
        fn.typePrefix = name;
        return fn;
    };
    return {
        updateOrderStatus: createMockThunk('order/updateOrderStatus'),
        confirmPickupTime: createMockThunk('order/confirmPickupTime'),
    };
});
jest.mock('@/services/logicServices/orderService', () => ({
    orderService: { readyForPickup: jest.fn() },
}));
jest.mock('@/services/logicServices/playAudioUrl', () => ({
    playAudioUrl: jest.fn(),
}));
jest.mock('@/utils/notificationSound', () => ({
    playNotificationSound: jest.fn(),
}));
jest.mock('@/utils/dateUtils', () => ({
    isToday: jest.fn(() => true),
}));
jest.mock('@/components/RefundModal', () => {
    const { View, Text } = require('react-native');
    return {
        RefundModal: (props: any) => {
            if (!props.isVisible) return null;
            return (
                <View testID="mock-refund-modal">
                    <Text onPress={props.onClose}>CloseRefund</Text>
                </View>
            );
        },
    };
});
jest.mock('@/components/TimePickerModal', () => {
    const { View, Text } = require('react-native');
    return {
        TimePickerModal: (props: any) => {
            if (!props.visible) return null;
            return (
                <View testID="mock-time-picker">
                    <Text onPress={props.onConfirm}>ConfirmPickup</Text>
                    <Text onPress={props.onClose}>ClosePickup</Text>
                </View>
            );
        },
    };
});
const mockOrderItemCard = jest.fn();
jest.mock('./OrderItemCard', () => {
    const { Text, View } = require('react-native');
    return {
        OrderItemCard: (props: any) => {
            mockOrderItemCard(props);
            return (
                <View testID={`order-card-${props.item.id}`}>
                    <Text onPress={() => props.onUpdateStatus(props.item)}>UpdateStatus</Text>
                    <Text onPress={() => props.onRefund(props.item)}>Refund</Text>
                    <Text onPress={() => props.onOpenPickup(props.item)}>OpenPickup</Text>
                    <Text onPress={() => props.onViewDetail(props.item.id)}>ViewDetail</Text>
                </View>
            );
        },
    };
});
const createMockOrders = () => [
    {
        id: '1', orderCode: 101, phone: '0901', status: 1,
        createdAt: '2026-03-31T10:00:00Z', isPreOrder: false,
        items: [{ id: 'i1', name: 'Phở', quantity: 1, price: 50000 }],
    },
    {
        id: '2', orderCode: 102, phone: '0902', status: 2,
        createdAt: '2026-03-31T10:01:00Z', isPreOrder: true,
        items: [{ id: 'i2', name: 'Bún', quantity: 1, price: 30000 }],
    },
    {
        id: '3', orderCode: 103, phone: '0903', status: 3,
        createdAt: '2026-03-31T10:02:00Z', isPreOrder: false,
        items: [{ id: 'i3', name: 'Cơm', quantity: 1, price: 40000 }],
    },
    {
        id: '4', orderCode: 104, phone: '0904', status: 99,
        createdAt: '2026-03-31T10:03:00Z', isPreOrder: true,
        items: [{ id: 'i4', name: 'Mì', quantity: 1, price: 60000 }],
    },
];
describe('SDKTable Component Coverage', () => {
    const mockDispatch = jest.fn((action: any) => Promise.resolve(action));
    const mockNavigate = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (useSelector as unknown as jest.Mock).mockImplementation((fn: any) =>
            fn({ order: { orders: createMockOrders() } })
        );
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        (useNavigation as unknown as jest.Mock).mockReturnValue({ navigate: mockNavigate });
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-03-31T10:00:00Z'));
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it('navigates search and clears (line 279-281)', () => {
        const { getByPlaceholderText, getByTestId } = render(<SDKTable statusFilter={-1} />);
        fireEvent.changeText(getByPlaceholderText('Tìm món ăn / SĐT / mã đơn...'), '101');
        fireEvent.press(getByTestId('icon-X'));
    });
    it('covers basic filters and search interactions', () => {
        const { getByText, getByPlaceholderText, getByTestId } = render(<SDKTable statusFilter={-1} />);
        fireEvent.press(getByText('Pre-order')); 
        fireEvent.press(getByText('Tại quán'));   
        fireEvent.press(getByText('Tất cả'));      
        const input = getByPlaceholderText('Tìm món ăn / SĐT / mã đơn...');
        fireEvent.changeText(input, '0901');
        fireEvent.changeText(input, 'Phở');
        fireEvent.press(getByTestId('icon-X'));
    });
    describe('handleUpdateStatus (Lines 125-180)', () => {
        it('covers status 2 -> 3 logical branch (line 130-145)', async () => {
            (orderService.readyForPickup as jest.Mock).mockResolvedValueOnce({ audioUrl: 'test-audio', success: true });
            render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.status === 2)[0];
            await act(async () => {
                await props.onUpdateStatus(props.item);
            });
            expect(playAudioUrl).toHaveBeenCalledWith('test-audio');
            expect(playNotificationSound).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'order/updateOrderStatus/fulfilled' }));
        });
        it('covers status 3 -> 4 navigation (line 148-157)', async () => {
            render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.status === 3)[0];
            await act(async () => {
                await props.onUpdateStatus(props.item);
            });
            expect(mockNavigate).toHaveBeenCalledWith('ScanDeliveryScreen', expect.any(Object));
        });
        it('covers status 1 -> 2 notification (line 173-175)', async () => {
            render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.status === 1)[0];
            await act(async () => {
                await props.onUpdateStatus(props.item);
            });
            expect(playNotificationSound).toHaveBeenCalled();
        });
        it('covers default switch status (line 85-86)', async () => {
            render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.status === 99)[0];
            await act(async () => {
                await props.onUpdateStatus(props.item);
            });
            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ newStatus: 99 }) }));
        });
        it('covers updateOrderStatus.rejected (lines 166-171)', async () => {
            const { getByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls[0][0];
            mockDispatch.mockResolvedValueOnce({ type: 'order/updateOrderStatus/rejected', payload: 'Mock Err' });
            await act(async () => {
                await props.onUpdateStatus(props.item);
                jest.advanceTimersByTime(100);
            });
            expect(getByText('Mock Err')).toBeTruthy();
        });
        it('covers handleUpdateStatus catch block (lines 176-179)', async () => {
            (orderService.readyForPickup as jest.Mock).mockRejectedValueOnce(new Error('Internal'));
            const { getByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.status === 2)[0];
            await act(async () => {
                await props.onUpdateStatus(props.item);
                jest.advanceTimersByTime(100);
            });
            expect(getByText('Có lỗi xảy ra khi cập nhật trạng thái')).toBeTruthy();
        });
    });
    describe('handleConfirmPickup (Lines 185-222)', () => {
        it('covers past time validation (line 191-194)', async () => {
            const { getByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.isPreOrder)[0];
            await act(async () => { await props.onOpenPickup(props.item); });
            jest.setSystemTime(new Date('2026-03-31T10:05:00Z')); 
            await act(async () => { fireEvent.press(getByText('ConfirmPickup')); });
            act(() => { jest.advanceTimersByTime(100); });
            expect(getByText('Không thể chọn thời gian trong quá khứ')).toBeTruthy();
        });
        it('covers confirmPickupTime rejected (lines 211-214)', async () => {
            const { getByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.isPreOrder)[0];
            await act(async () => { await props.onOpenPickup(props.item); });
            jest.setSystemTime(new Date('2026-03-31T08:00:00Z')); 
            mockDispatch.mockResolvedValueOnce({ type: 'order/confirmPickupTime/rejected', payload: 'API Fail' });
            await act(async () => { fireEvent.press(getByText('ConfirmPickup')); });
            act(() => { jest.advanceTimersByTime(100); });
            expect(getByText('API Fail')).toBeTruthy();
        });
        it('covers confirmPickupTime success (lines 215-221)', async () => {
            const { getByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.isPreOrder)[0];
            await act(async () => { await props.onOpenPickup(props.item); });
            jest.setSystemTime(new Date('2026-03-31T08:00:00Z'));
            mockDispatch.mockResolvedValueOnce({ type: 'order/confirmPickupTime/fulfilled' });
            await act(async () => { fireEvent.press(getByText('ConfirmPickup')); });
            act(() => { jest.advanceTimersByTime(100); });
            expect(getByText('Đã xác nhận giờ nhận hàng thành công')).toBeTruthy();
        });
    });
    describe('Timers and scrolls (Lines 71, 75, 254-257)', () => {
        it('advances timers for scrolls', async () => {
            render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.isPreOrder)[0];
            await act(async () => {
                await props.onOpenPickup(props.item);
            });
            act(() => {
                jest.advanceTimersByTime(200);
            });
        });
    });
    describe('Modals lifecycle (Lines 359-362, 370-375)', () => {
        it('covers RefundModal onClose', async () => {
            const { getByText, queryByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls[0][0];
            await act(async () => { await props.onRefund(props.item); });
            expect(getByText('CloseRefund')).toBeTruthy();
            fireEvent.press(getByText('CloseRefund'));
            await waitFor(() => expect(queryByText('CloseRefund')).toBeNull());
        });
        it('covers TimePickerModal onClose', async () => {
            const { getByText, queryByText } = render(<SDKTable statusFilter={-1} />);
            const props = mockOrderItemCard.mock.calls.find(c => c[0].item.isPreOrder)[0];
            await act(async () => { await props.onOpenPickup(props.item); });
            fireEvent.press(getByText('ClosePickup'));
            await waitFor(() => expect(queryByText('ClosePickup')).toBeNull());
        });
    });
    it('covers navigation detail (line 234)', () => {
        render(<SDKTable statusFilter={-1} />);
        mockOrderItemCard.mock.calls[0][0].onViewDetail('1');
        expect(mockNavigate).toHaveBeenCalledWith('DetailOrderScreen', { orderId: '1' });
    });
});
