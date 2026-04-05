import restaurantReducer, { 
    updateReceivingOrdersLocal, 
    fetchRestaurantById, 
    toggleReceivingOrders 
} from './restaurantSlice';
import { RestaurantState } from '@/type';
import { restaurantService } from '@/services/logicServices/restaurantService';

// Mock restaurantService
jest.mock('@/services/logicServices/restaurantService', () => ({
  restaurantService: {
    getRestaurantById: jest.fn(),
    updateReceivingOrders: jest.fn(),
  },
}));

describe('restaurantSlice', () => {
    const initialState: RestaurantState = {
        restaurant: null,
        loading: false,
        error: null,
    };

    const mockRestaurant = { id: 1, name: 'Resto', isReceivingOrders: true };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('reducers', () => {
        it('should handle updateReceivingOrdersLocal', () => {
            const stateWithRestaurant: RestaurantState = { ...initialState, restaurant: { ...mockRestaurant } as any };
            const result = restaurantReducer(stateWithRestaurant, updateReceivingOrdersLocal(false));
            expect(result.restaurant?.isReceivingOrders).toBe(false);
        });

        it('should handle fetchRestaurantById.pending', () => {
            const result = restaurantReducer(initialState, fetchRestaurantById.pending('', 1));
            expect(result.loading).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should handle fetchRestaurantById.fulfilled', () => {
            const result = restaurantReducer(initialState, fetchRestaurantById.fulfilled(mockRestaurant as any, '', 1));
            expect(result.loading).toBe(false);
            expect(result.restaurant).toEqual(mockRestaurant);
        });

        it('should handle fetchRestaurantById.rejected', () => {
            const result = restaurantReducer(initialState, fetchRestaurantById.rejected(null, '', 1, 'NotFound'));
            expect(result.loading).toBe(false);
            expect(result.error).toBe('NotFound');
        });

        it('should handle toggleReceivingOrders.pending', () => {
            const result = restaurantReducer(initialState, toggleReceivingOrders.pending('', { restaurantId: 1, isReceiving: true }));
            expect(result.loading).toBe(true);
        });

        it('should handle toggleReceivingOrders.fulfilled with restaurant state', () => {
            const stateWithRestaurant: RestaurantState = { ...initialState, restaurant: { ...mockRestaurant } as any };
            const result = restaurantReducer(stateWithRestaurant, toggleReceivingOrders.fulfilled({ isReceiving: false }, '', { restaurantId: 1, isReceiving: false }));
            expect(result.loading).toBe(false);
            expect(result.restaurant?.isReceivingOrders).toBe(false);
        });

        it('should handle toggleReceivingOrders.fulfilled without restaurant state', () => {
            const result = restaurantReducer(initialState, toggleReceivingOrders.fulfilled({ isReceiving: true }, '', { restaurantId: 1, isReceiving: true }));
            expect(result.loading).toBe(false);
            expect(result.restaurant).toBeNull();
        });

        it('should handle toggleReceivingOrders.rejected', () => {
            const result = restaurantReducer(initialState, toggleReceivingOrders.rejected(null, '', { restaurantId: 1, isReceiving: false }, 'Update failed'));
            expect(result.loading).toBe(false);
            expect(result.error).toBe('Update failed');
        });
    });

    describe('thunks', () => {
        const dispatch = jest.fn();
        const getState = jest.fn();

        it('fetchRestaurantById calls service and returns data on success', async () => {
            (restaurantService.getRestaurantById as jest.Mock).mockResolvedValue(mockRestaurant);

            const result = await fetchRestaurantById(1)(dispatch, getState, undefined);
            
            expect(restaurantService.getRestaurantById).toHaveBeenCalledWith(1);
            expect(result.payload).toEqual(mockRestaurant);
        });

        it('fetchRestaurantById handles service error', async () => {
            (restaurantService.getRestaurantById as jest.Mock).mockRejectedValue(new Error('Network Error'));

            const result = await fetchRestaurantById(1)(dispatch, getState, undefined);
            
            expect(result.payload).toBe('Network Error');
        });

        it('toggleReceivingOrders calls service and returns response on success', async () => {
            (restaurantService.updateReceivingOrders as jest.Mock).mockResolvedValue({ success: true });

            const args = { restaurantId: 1, isReceiving: false };
            const result = await toggleReceivingOrders(args)(dispatch, getState, undefined);
            
            expect(restaurantService.updateReceivingOrders).toHaveBeenCalledWith(1, false);
            expect(result.payload).toEqual({ isReceiving: false });
        });

        it('toggleReceivingOrders handles service error', async () => {
            (restaurantService.updateReceivingOrders as jest.Mock).mockRejectedValue(new Error('API Error'));

            const args = { restaurantId: 1, isReceiving: false };
            const result = await toggleReceivingOrders(args)(dispatch, getState, undefined);
            
            expect(result.payload).toBe('API Error');
        });
    });
});
