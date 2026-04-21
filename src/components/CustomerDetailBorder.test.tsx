import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomerDetailBorder } from './CustomerDetailBorder';
jest.mock('lucide-react-native', () => ({
  Phone: () => null,
  Hash: () => null,
  Calendar: () => null,
  MapPin: () => null,
  CreditCard: () => null,
}));
describe('CustomerDetailBorder', () => {
  const mockOrder = {
    phone: '0987654321',
    orderCode: 'ORD-123456',
    createdAt: '2026-04-03T08:00:00Z',
    tableName: 'Bàn 5',
    type: 'Cash',
  };
  it('renders order details correctly', () => {
    const { getByText } = render(<CustomerDetailBorder order={mockOrder} />);
    expect(getByText('0987654321')).toBeTruthy();
    expect(getByText('ORD-123456')).toBeTruthy();
    expect(getByText(/0?3\/0?4\/2026/)).toBeTruthy();
    expect(getByText(/Thanh toán: Tiền mặt/)).toBeTruthy();
  });
  it('renders alternate payment type correctly', () => {
    const transferOrder = { ...mockOrder, type: 'Transfer' };
    const { getByText } = render(<CustomerDetailBorder order={transferOrder} />);
    expect(getByText(/Thanh toán: Chuyển khoản/)).toBeTruthy();
  });
  it('renders placeholders for missing data', () => {
    const emptyOrder = { phone: '', orderCode: '', createdAt: '', type: '' };
    const { getByText, getAllByText } = render(<CustomerDetailBorder order={emptyOrder} />);
    expect(getAllByText('---')).toHaveLength(2);
    expect(getByText(/Ngày tạo: Invalid Date/i)).toBeTruthy();
  });
});
