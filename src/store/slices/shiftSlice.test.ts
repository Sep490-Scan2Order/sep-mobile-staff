import shiftReducer, { clearShift, setShift, checkInShift, fetchCurrentShift } from './shiftSlice';
import { ShiftState } from '@/type';

describe('shiftSlice', () => {
    const initialState: ShiftState = {
        currentShift: null,
        currentShiftId: null,
        loading: false,
        error: null,
    };

    const mockShift = { id: 1, staffId: 's1', startTime: '2024' };

    it('should handle clearShift', () => {
        const stateWithShift: ShiftState = { 
            ...initialState, 
            currentShift: mockShift as any, 
            currentShiftId: 1 
        };
        const result = shiftReducer(stateWithShift, clearShift());
        expect(result.currentShift).toBeNull();
        expect(result.currentShiftId).toBeNull();
    });

    it('should handle setShift', () => {
        const result = shiftReducer(initialState, setShift(mockShift));
        expect(result.currentShift).toEqual(mockShift);
        expect(result.currentShiftId).toBe(1);

        const result2 = shiftReducer(result, setShift(null));
        expect(result2.currentShift).toBeNull();
    });

    it('should handle checkInShift.pending', () => {
        const result = shiftReducer(initialState, checkInShift.pending('', {}));
        expect(result.loading).toBe(true);
    });

    it('should handle checkInShift.fulfilled', () => {
        const result = shiftReducer(initialState, checkInShift.fulfilled(mockShift as any, '', {}));
        expect(result.loading).toBe(false);
        expect(result.currentShift).toEqual(mockShift);
        expect(result.currentShiftId).toBe(1);
    });

    it('should handle checkInShift.rejected', () => {
        const result = shiftReducer(initialState, checkInShift.rejected(new Error('Checkin fail'), '', {}, 'Checkin fail'));
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Checkin fail');
    });

    it('should handle fetchCurrentShift.fulfilled', () => {
        const result = shiftReducer(initialState, fetchCurrentShift.fulfilled(mockShift as any, ''));
        expect(result.currentShift).toEqual(mockShift);
        expect(result.currentShiftId).toBe(1);
    });

    it('should handle fetchCurrentShift.pending', () => {
        const result = shiftReducer(initialState, fetchCurrentShift.pending('', undefined));
        expect(result.loading).toBe(false);
    });
});
