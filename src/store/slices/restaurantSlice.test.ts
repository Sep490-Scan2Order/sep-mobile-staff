import restaurantReducer, { 
    updateReceivingOrdersLocal, 
    fetchRestaurantById, 
    toggleReceivingOrders 
} from './restaurantSlice';
import { RestaurantState } from '@/type';

describe('restaurantSlice', () => {
    const initialState: RestaurantState = {
        restaurant: null,
        loading: false,
        error: null,
    };

    const mockRestaurant = { id: 1, name: 'Resto', isReceivingOrders: true };

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
        const result = restaurantReducer(initialState, fetchRestaurantById.rejected(new Error('NotFound'), '', 1, 'NotFound'));
        expect(result.loading).toBe(false);
        expect(result.error).toBe('NotFound');
    });

    it('should handle updateReceivingOrdersLocal', () => {
        const stateWithRestaurant: RestaurantState = { ...initialState, restaurant: { ...mockRestaurant } as any };
        const result = restaurantReducer(stateWithRestaurant, updateReceivingOrdersLocal(false));
        expect(result.restaurant?.isReceivingOrders).toBe(false);
    });

    it('should handle toggleReceivingOrders.pending', () => {
        const result = restaurantReducer(initialState, toggleReceivingOrders.pending('', { restaurantId: 1, isReceiving: true }));
        expect(result.loading).toBe(true);
    });

    it('should handle toggleReceivingOrders.fulfilled', () => {
        const stateWithRestaurant: RestaurantState = { ...initialState, restaurant: { ...mockRestaurant } as any };
        const result = restaurantReducer(stateWithRestaurant, toggleReceivingOrders.fulfilled({ isReceiving: false }, '', { restaurantId: 1, isReceiving: false }));
        expect(result.loading).toBe(false);
        expect(result.restaurant?.isReceivingOrders).toBe(false);
    });

    it('should handle toggleReceivingOrders.rejected', () => {
        const result = restaurantReducer(initialState, toggleReceivingOrders.rejected(new Error('Update failed'), '', { restaurantId: 1, isReceiving: false }, 'Update failed'));
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Update failed');
    });
});
