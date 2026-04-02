import dishReducer, { fetchDishesByRestaurant, toggleSoldOutThunk } from './dishSlice';
import { DishState, Dish } from '@/type';

describe('dishSlice', () => {
    const initialState: DishState = {
        dishes: [],
        loading: false,
        error: null,
    };

    const mockDishes: Dish[] = [
        { id: 1, dishName: 'Dish 1', isSoldOut: false } as any,
        { id: 2, dishName: 'Dish 2', isSoldOut: true } as any,
    ];

    it('should handle fetchDishesByRestaurant.pending', () => {
        const result = dishReducer(initialState, fetchDishesByRestaurant.pending('', 1));
        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
    });

    it('should handle fetchDishesByRestaurant.fulfilled', () => {
        const result = dishReducer(initialState, fetchDishesByRestaurant.fulfilled(mockDishes, '', 1));
        expect(result.loading).toBe(false);
        expect(result.dishes).toEqual(mockDishes);
    });

    it('should handle fetchDishesByRestaurant.rejected', () => {
        const result = dishReducer(initialState, fetchDishesByRestaurant.rejected(null, '', 1, 'Error message'));
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Error message');
    });

    it('should handle toggleSoldOutThunk.fulfilled', () => {
        const stateWithDishes: DishState = { ...initialState, dishes: [...mockDishes] };
        
        // Toggle dish 1 to sold out
        const result = dishReducer(stateWithDishes, toggleSoldOutThunk.fulfilled({ id: 1, isSoldOut: true }, '', { restaurantId: 1, id: 1, isSoldOut: true, quantity: 0 }));
        expect(result.dishes[0].isSoldOut).toBe(true);

        // Toggle dish 2 to available
        const result2 = dishReducer(stateWithDishes, toggleSoldOutThunk.fulfilled({ id: 2, isSoldOut: false }, '', { restaurantId: 1, id: 2, isSoldOut: false, quantity: 0 }));
        expect(result2.dishes[1].isSoldOut).toBe(false);
    });

    it('should handle toggleSoldOutThunk.rejected', () => {
        const result = dishReducer(initialState, toggleSoldOutThunk.rejected(new Error('Toggle failed'), '', { restaurantId: 1, id: 1, isSoldOut: true, quantity: 0 }, 'Toggle failed'));
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Toggle failed');
    });

    it('should handle toggleSoldOutThunk.pending', () => {
        const result = dishReducer(initialState, toggleSoldOutThunk.pending('', { restaurantId: 1, id: 1, isSoldOut: true, quantity: 0 }));
        expect(result.loading).toBe(true);
    });
});
