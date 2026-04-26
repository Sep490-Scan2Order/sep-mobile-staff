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
import { OrderState } from '@/type';
jest.mock('@/services/logicServices/orderService', () => ({
    orderService: {
        getActiveOrders: jest.fn(),
        getPendingCashOrders: jest.fn(),
        updateOrderStatus: jest.fn(),
        confirmCashOrder: jest.fn(),
        confirmPickupTime: jest.fn(),
    }
}));
describe('orderSlice', () => {
    const initialState: OrderState = {
        orders: [],
        loading: false,
        error: null,
        refreshCount: 0,
        unread: { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
    };
    const mockOrder: any = {
        id: 'o1',
        phone: '',
        orderCode: 1,
        createdAt: new Date().toISOString(),
        amount: 0,
        finalAmount: 0,
        totalAmount: undefined,
        promotionDiscount: undefined,
        promotionName: undefined,
        status: 0,
        type: undefined,
        typeOrder: undefined,
        isPreOrder: undefined,
        requestedPickupAt: undefined,
        confirmedPickupAt: undefined,
        originalOrderCode: undefined,
        paymentProofUrl: undefined,
        note: undefined,
        items: []
    };
    it('should handle addOrder', () => {
        const result = orderReducer(initialState, addOrder(mockOrder));
        expect(result.orders).toHaveLength(1);
        expect(result.orders[0].id).toBe('o1');
        expect(result.unread.all).toBe(1);
        expect(result.unread[0]).toBe(1);
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
        expect(result.unread.all).toBe(2);
        expect(result.unread[1]).toBe(1);
    });
    it('should handle clearUnreadByStatus', () => {
        const stateWithUnread: OrderState = {
            ...initialState,
            unread: { all: 5, 0: 2, 1: 3, 2: 0, 3: 0, 4: 0 }
        };
        const result = orderReducer(stateWithUnread, clearUnreadByStatus(1));
        expect(result.unread[1]).toBe(0);
        expect(result.unread[0]).toBe(2);
        const result2 = orderReducer(stateWithUnread, clearUnreadByStatus(-1));
        expect(result2.unread.all).toBe(0);
        expect(result2.unread[0]).toBe(0);
    });
    it('should handle forceRefresh', () => {
        const result = orderReducer(initialState, forceRefresh());
        expect(result.refreshCount).toBe(1);
    });
    it('increaseUnread: should NOT increment when order is not from today', () => {
        const oldOrder: any = { ...mockOrder, createdAt: '2020-01-01T00:00:00.000Z' };
        const result = orderReducer(initialState, addOrder(oldOrder));
        expect(result.orders).toHaveLength(1);
        expect(result.unread.all).toBe(0);
    });
    it('increaseUnread: should NOT increment for unknown status (outside 0-4)', () => {
        const orderUnknownStatus: any = { ...mockOrder, id: 'o99', status: 99 };
        const result = orderReducer(initialState, addOrder(orderUnknownStatus));
        expect(result.unread.all).toBe(1);
        expect((result.unread as any)[99]).toBeUndefined();
    });
    it('updateOrderStatusLocal: should NOT increase unread when status has NOT changed', () => {
        const stateWithOrder: OrderState = {
            ...initialState,
            orders: [mockOrder],
            unread: { ...initialState.unread, all: 1, 0: 1 }
        };
        const result = orderReducer(stateWithOrder, updateOrderStatusLocal({ id: 'o1', status: 0 }));
        expect(result.orders[0].status).toBe(0);
        expect(result.unread.all).toBe(1);
    });
    it('clearUnreadByStatus: should handle unknown status gracefully (no-op)', () => {
        const stateWithUnread: OrderState = {
            ...initialState,
            unread: { all: 5, 0: 2, 1: 3, 2: 0, 3: 0, 4: 0 }
        };
        const result = orderReducer(stateWithUnread, clearUnreadByStatus(99));
        expect(result.unread.all).toBe(5);
    });
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
        expect(result.orders).toHaveLength(1);
        expect(result.orders[0].status).toBe(1);
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
    it('should handle updateOrderStatus.fulfilled - non-matching id unchanged', () => {
        const order2: any = { ...mockOrder, id: 'o2', status: 1 };
        const stateWithOrders: OrderState = { ...initialState, orders: [mockOrder, order2] };
        const result = orderReducer(stateWithOrders, updateOrderStatus.fulfilled(
            { orderId: 'o1', newStatus: 3 }, '', { orderId: 'o1', newStatus: 3 }
        ));
        expect(result.orders[0].status).toBe(3);
        expect(result.orders[1].status).toBe(1);
    });
    it('should handle confirmPickupTime.fulfilled - non-matching id unchanged', () => {
        const order2: any = { ...mockOrder, id: 'o2' };
        const stateWithOrders: OrderState = { ...initialState, orders: [mockOrder, order2] };
        const result = orderReducer(stateWithOrders, confirmPickupTime.fulfilled(
            { orderId: 'o1', confirmedPickupAt: '2025' }, '', { orderId: 'o1', confirmedPickupAt: '2025' }
        ));
        expect(result.orders[0].confirmedPickupAt).toBe('2025');
        expect(result.orders[1].confirmedPickupAt).toBeUndefined();
    });
    it('should handle fetchActiveOrders.pending and rejected', () => {
        const pendingResult = orderReducer(initialState, fetchActiveOrders.pending('', 1));
        expect(pendingResult.loading).toBe(true);
        const rejectedResult = orderReducer(initialState, fetchActiveOrders.rejected(new Error('fail'), '', 1, 'error msg'));
        expect(rejectedResult.loading).toBe(false);
        expect(rejectedResult.error).toBe('error msg');
    });
    it('should return unchanged order if updateOrderStatusLocal id does not match', () => {
        const order2 = { ...mockOrder, id: 'o2' };
        const stateWithOrders: OrderState = { ...initialState, orders: [mockOrder, order2] };
        const result = orderReducer(stateWithOrders, updateOrderStatusLocal({ id: 'o1', status: 1 }));
        expect(result.orders[1].id).toBe('o2');
        expect(result.orders[1].status).toBe(0);
    });
    describe('Thunk functions execution', () => {
        const dispatch = jest.fn();
        const getState = jest.fn();
        const mockOrderService = require('@/services/logicServices/orderService').orderService;
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('executes fetchActiveOrders successfully', async () => {
            mockOrderService.getActiveOrders.mockResolvedValue([mockOrder]);
            const thunk = fetchActiveOrders(1);
            const result = await thunk(dispatch, getState, undefined);
            expect(mockOrderService.getActiveOrders).toHaveBeenCalledWith(1);
            expect(result.payload).toEqual([mockOrder]);
        });
        it('executes fetchActiveOrders with error', async () => {
            mockOrderService.getActiveOrders.mockRejectedValue(new Error('Fetch Error'));
            const thunk = fetchActiveOrders(1);
            const result = await thunk(dispatch, getState, undefined);
            expect(result.payload).toBe('Fetch Error');
        });
        it('executes fetchPendingCashOrders successfully', async () => {
            const rawMockData = [{
                id: 'o1', phone: '123', orderCode: 1, createdAt: '2024',
                amount: 100, status: 0, type: 1, tableName: 'T1',
                items: [{ dishId: 1, dishName: 'Dish', price: 10, quantity: 1, originalPrice: 10, discountAmount: 0, promotionName: null, subTotal: 10 }]
            }];
            mockOrderService.getPendingCashOrders.mockResolvedValue(rawMockData);
            const thunk = fetchPendingCashOrders();
            const result = await thunk(dispatch, getState, undefined);
            expect(mockOrderService.getPendingCashOrders).toHaveBeenCalled();
            expect((result.payload as any[])[0].id).toBe('o1');
        });
        it('executes fetchPendingCashOrders with error', async () => {
            mockOrderService.getPendingCashOrders.mockRejectedValue(new Error('Cash Error'));
            const thunk = fetchPendingCashOrders();
            const result = await thunk(dispatch, getState, undefined);
            expect(result.payload).toBe('Cash Error');
        });
        it('executes updateOrderStatus successfully', async () => {
            mockOrderService.updateOrderStatus.mockResolvedValue(undefined);
            const thunk = updateOrderStatus({ orderId: 'o1', newStatus: 2 });
            const result = await thunk(dispatch, getState, undefined);
            expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith('o1', 2);
            expect(result.payload).toEqual({ orderId: 'o1', newStatus: 2 });
        });
        it('executes updateOrderStatus with error', async () => {
            mockOrderService.updateOrderStatus.mockRejectedValue(new Error('Update Error'));
            const thunk = updateOrderStatus({ orderId: 'o1', newStatus: 2 });
            const result = await thunk(dispatch, getState, undefined);
            expect(result.payload).toBe('Update Error');
        });
        it('executes confirmCashOrder successfully', async () => {
            mockOrderService.confirmCashOrder.mockResolvedValue(undefined);
            const thunk = confirmCashOrder('o1');
            const result = await thunk(dispatch, getState, undefined);
            expect(mockOrderService.confirmCashOrder).toHaveBeenCalledWith('o1');
            expect(result.payload).toBe('o1');
        });
        it('executes confirmCashOrder with error', async () => {
            mockOrderService.confirmCashOrder.mockRejectedValue(new Error('Confirm Error'));
            const thunk = confirmCashOrder('o1');
            const result = await thunk(dispatch, getState, undefined);
            expect(result.payload).toBe('Confirm Error');
        });
        it('executes confirmPickupTime successfully', async () => {
            mockOrderService.confirmPickupTime.mockResolvedValue(undefined);
            const thunk = confirmPickupTime({ orderId: 'o1', confirmedPickupAt: 'time' });
            const result = await thunk(dispatch, getState, undefined);
            expect(mockOrderService.confirmPickupTime).toHaveBeenCalledWith('o1', 'time');
            expect(result.payload).toEqual({ orderId: 'o1', confirmedPickupAt: 'time' });
        });
        it('executes confirmPickupTime with error', async () => {
            mockOrderService.confirmPickupTime.mockRejectedValue(new Error('Pickup Error'));
            const thunk = confirmPickupTime({ orderId: 'o1', confirmedPickupAt: 'time' });
            const result = await thunk(dispatch, getState, undefined);
            expect(result.payload).toBe('Pickup Error');
        });
    });
});
