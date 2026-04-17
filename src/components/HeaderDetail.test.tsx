import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeaderDetail } from './HeaderDetail';
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  CheckCircle: () => null,
}));
describe('HeaderDetail', () => {
  const mockOnBack = jest.fn();
  it('renders correctly with title', () => {
    const { getByText } = render(<HeaderDetail title="Chi tiết đơn hàng" />);
    expect(getByText('Chi tiết đơn hàng')).toBeTruthy();
  });
  it('calls onBack when back button is pressed', () => {
    const { UNSAFE_getByType } = render(<HeaderDetail onBack={mockOnBack} />);
    const { TouchableOpacity } = require('react-native');
    const backButton = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
  it('renders success state correctly', () => {
    const { getByText, queryByText } = render(
      <HeaderDetail title="Thanh toán thành công" isSuccess={true} />
    );
    expect(getByText('Thanh toán thành công')).toBeTruthy();
  });
});
