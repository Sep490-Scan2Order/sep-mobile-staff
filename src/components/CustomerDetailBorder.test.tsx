import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomerDetailBorder } from './CustomerDetailBorder';

// Mock lucide icons
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
    
    // Check formatted date - vi-VN format of '2026-04-03T08:00:00Z'
    // 08:00Z is 15:00 in ICT (UTC+7)
    // We can use a regex to be safe about slight locale differences
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
    // @ts-ignore
    const { getByText, getAllByText } = render(<CustomerDetailBorder order={emptyOrder} />);
    // phone and orderCode show '---'
    expect(getAllByText('---')).toHaveLength(2);
    // date shows 'Invalid Date' because of how Date works in JS
    expect(getByText(/Ngày tạo: Invalid Date/i)).toBeTruthy();
  });
});
