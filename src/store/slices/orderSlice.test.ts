import orderReducer, { 
    addOrder, 
    updateOrderStatusLocal, 
    clearUnreadByStatus, 
    forceRefresh,
    fetchActiveOrders,
    fetchPendingCashOrders,
    confirmCashOrder,
    updateOrderStatus,
    confirmPickupTime
} from './orderSlice';
import { OrderState, Order } from '@/type';

describe('orderSlice', () => {
    const initialState: OrderState = {
        orders: [],
        loading: false,
        error: null,
        refreshCount: 0,
        unread: { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
    };

    const mockOrder: Order = {
        id: 'o1',
        orderCode: 1,
        createdAt: new Date().toISOString(),
        status: 0,
        amount: 100,
        phone: '',
        items: []
    };

    it('should handle addOrder', () => {
        const result = orderReducer(initialState, addOrder(mockOrder));
        expect(result.orders).toHaveLength(1);
        expect(result.orders[0].id).toBe('o1');
        expect(result.unread.all).toBe(1);
        expect(result.unread[0]).toBe(1);

        // Should not add duplicate
        const result2 = orderReducer(result, addOrder(mockOrder));
        expect(result2.orders).toHaveLength(1);
    });

    it('should handle updateOrderStatusLocal and increase unread', () => {
        const stateWithOrder: OrderState = {
            ...initialState,
            orders: [mockOrder],
            unread: { ...initialState.unread, all: 1, 0: 1 }
        };

        const result = orderReducer(stateWithOrder, updateOrderStatusLocal({ id: 'o1', status: 1 }));
        
        expect(result.orders[0].status).toBe(1);
        // Status changed, should increment unread for new status
        expect(result.unread.all).toBe(2);
        expect(result.unread[1]).toBe(1);
    });

    it('should handle clearUnreadByStatus', () => {
        const stateWithUnread: OrderState = {
            ...initialState,
            unread: { all: 5, 0: 2, 1: 3, 2: 0, 3: 0, 4: 0 }
        };

        // Clear specific status
        const result = orderReducer(stateWithUnread, clearUnreadByStatus(1));
        expect(result.unread[1]).toBe(0);
        expect(result.unread[0]).toBe(2);

        // Clear all
        const result2 = orderReducer(stateWithUnread, clearUnreadByStatus(-1));
        expect(result2.unread.all).toBe(0);
        expect(result2.unread[0]).toBe(0);
    });

    it('should handle forceRefresh', () => {
        const result = orderReducer(initialState, forceRefresh());
        expect(result.refreshCount).toBe(1);
    });

    // Thunks
    it('should handle fetchActiveOrders.fulfilled', () => {
        const result = orderReducer(initialState, fetchActiveOrders.fulfilled([mockOrder], '', 1));
        expect(result.loading).toBe(false);
        expect(result.orders).toEqual([mockOrder]);
        expect(result.unread.all).toBe(1);
    });

    it('should handle fetchPendingCashOrders.fulfilled', () => {
        const result = orderReducer(initialState, fetchPendingCashOrders.fulfilled([mockOrder], ''));
        expect(result.orders).toEqual([mockOrder]);
    });

    it('should handle confirmCashOrder.fulfilled', () => {
        const stateWithOrder: OrderState = { ...initialState, orders: [mockOrder] };
        const result = orderReducer(stateWithOrder, confirmCashOrder.fulfilled('o1', '', 'o1'));
        expect(result.orders).toHaveLength(0);
    });

    it('should handle updateOrderStatus.fulfilled', () => {
        const stateWithOrder: OrderState = { ...initialState, orders: [mockOrder] };
        const result = orderReducer(stateWithOrder, updateOrderStatus.fulfilled({ orderId: 'o1', newStatus: 2 }, '', { orderId: 'o1', newStatus: 2 }));
        expect(result.orders[0].status).toBe(2);
    });

    it('should handle confirmPickupTime.fulfilled', () => {
        const stateWithOrder: OrderState = { ...initialState, orders: [mockOrder] };
        const result = orderReducer(stateWithOrder, confirmPickupTime.fulfilled({ orderId: 'o1', confirmedPickupAt: '2024' }, '', { orderId: 'o1', confirmedPickupAt: '2024' }));
        expect(result.orders[0].confirmedPickupAt).toBe('2024');
    });
});
