import shiftReducer, { clearShift, setShift, checkInShift, fetchCurrentShift } from './shiftSlice';
import { ShiftState } from '@/type';
import { shiftService } from '@/services/logicServices/shiftService';

// Mock shiftService
jest.mock('@/services/logicServices/shiftService', () => ({
  shiftService: {
    checkIn: jest.fn(),
    getCurrentShift: jest.fn(),
  },
}));

describe('shiftSlice', () => {
    const initialState: ShiftState = {
        currentShift: null,
        currentShiftId: null,
        loading: false,
        error: null,
    };

    const mockShift = { id: 1, staffId: 's1', startTime: '2024' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('reducers', () => {
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

        it('should handle fetchCurrentShift.fulfilled', () => {
            const result = shiftReducer(initialState, fetchCurrentShift.fulfilled(mockShift as any, ''));
            expect(result.currentShift).toEqual(mockShift);
            expect(result.currentShiftId).toBe(1);
        });
        
        it('should handle fetchCurrentShift.rejected', () => {
            const stateWithShift: ShiftState = { ...initialState, currentShift: mockShift as any, currentShiftId: 1 };
            const result = shiftReducer(stateWithShift, fetchCurrentShift.rejected(null, ''));
            expect(result.currentShift).toBeNull();
            expect(result.currentShiftId).toBeNull();
        });

        it('should handle checkInShift.rejected', () => {
            const result = shiftReducer(initialState, checkInShift.rejected(null, '', {}, 'Checkin fail'));
            expect(result.loading).toBe(false);
            expect(result.error).toBe('Checkin fail');
        });
    });

    describe('thunks', () => {
        const dispatch = jest.fn();
        const getState = jest.fn();

        it('checkInShift calls service and returns data on success', async () => {
            (shiftService.checkIn as jest.Mock).mockResolvedValue({ data: mockShift });

            const payload = { staffId: 's1' };
            const result = await (checkInShift(payload) as any)(dispatch, getState, undefined);
            
            expect(shiftService.checkIn).toHaveBeenCalledWith(payload);
            expect(result.payload).toEqual(mockShift);
        });

        it('checkInShift handles service error', async () => {
            (shiftService.checkIn as jest.Mock).mockRejectedValue(new Error('CheckIn Error'));

            const result = await (checkInShift({}) as any)(dispatch, getState, undefined);
            
            expect(result.payload).toBe('CheckIn Error');
        });

        it('fetchCurrentShift calls service and returns unwraped data on success', async () => {
            (shiftService.getCurrentShift as jest.Mock).mockResolvedValue({ data: mockShift });

            const result = await (fetchCurrentShift() as any)(dispatch, getState, undefined);
            
            expect(shiftService.getCurrentShift).toHaveBeenCalled();
            expect(result.payload).toEqual(mockShift);
        });

        it('fetchCurrentShift handles service error', async () => {
            (shiftService.getCurrentShift as jest.Mock).mockRejectedValue(new Error('Fetch Error'));

            const result = await (fetchCurrentShift() as any)(dispatch, getState, undefined);
            
            expect(result.payload).toBe('Fetch Error');
        });
    });
});
