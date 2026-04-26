import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimePickerModal } from './TimePickerModal';
import { FlatList } from 'react-native';
jest.mock('lucide-react-native', () => ({
    Clock: () => null,
}));
describe('TimePickerModal Component', () => {
    const mockProps = {
        visible: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        confirming: false,
        selectedHour: 10,
        selectedMinute: 30,
        setSelectedHour: jest.fn(),
        setSelectedMinute: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it('renders correct title and buttons when visible', () => {
        const { getByText } = render(<TimePickerModal {...mockProps} />);
        expect(getByText('Chọn giờ nhận hàng')).toBeTruthy();
        expect(getByText('Hủy')).toBeTruthy();
        expect(getByText('Xác nhận')).toBeTruthy();
    });
    it('calls onConfirm when confirm button is pressed', () => {
        const { getByText } = render(<TimePickerModal {...mockProps} />);
        fireEvent.press(getByText('Xác nhận'));
        expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
    });
    it('calls onClose when cancel button is pressed', () => {
        const { getByText } = render(<TimePickerModal {...mockProps} />);
        fireEvent.press(getByText('Hủy'));
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
    it('shows ActivityIndicator when confirming', () => {
        const { queryByText } = render(
            <TimePickerModal {...mockProps} confirming={true} />
        );
        expect(queryByText('Xác nhận')).toBeNull();
    });
    it('displays selected hour and minute correctly', () => {
        const { getByText } = render(<TimePickerModal {...mockProps} />);
        expect(getByText('10')).toBeTruthy();
        expect(getByText('30')).toBeTruthy();
    });
    it('calls setSelectedHour when an hour item is scrolled', () => {
        const { UNSAFE_getAllByType } = render(<TimePickerModal {...mockProps} />);
        const lists = UNSAFE_getAllByType(FlatList);
        fireEvent(lists[0], 'onMomentumScrollEnd', {
            nativeEvent: { contentOffset: { y: 48 * 3 } },
        });
        expect(mockProps.setSelectedHour).toHaveBeenCalledWith(3);
    });
    it('calls setSelectedMinute when a minute item is scrolled', () => {
        const { UNSAFE_getAllByType } = render(<TimePickerModal {...mockProps} />);
        const lists = UNSAFE_getAllByType(FlatList);
        fireEvent(lists[1], 'onMomentumScrollEnd', {
            nativeEvent: { contentOffset: { y: 48 * 9 } },
        });
        expect(mockProps.setSelectedMinute).toHaveBeenCalledWith(45);
    });
    it('handles scroll events for hours', () => {
        const { UNSAFE_getAllByType } = render(
            <TimePickerModal {...mockProps} />
        );
        const lists = UNSAFE_getAllByType(FlatList);
        fireEvent(lists[0], 'onMomentumScrollEnd', {
            nativeEvent: { contentOffset: { y: 48 * 2 } },
        });
        expect(mockProps.setSelectedHour).toHaveBeenCalledWith(2);
    });
    it('handles scroll events for minutes', () => {
        const { UNSAFE_getAllByType } = render(
            <TimePickerModal {...mockProps} />
        );
        const lists = UNSAFE_getAllByType(FlatList);
        fireEvent(lists[1], 'onMomentumScrollEnd', {
            nativeEvent: { contentOffset: { y: 48 * 2 } },
        });
        expect(mockProps.setSelectedMinute).toHaveBeenCalledWith(10);
    });
});
