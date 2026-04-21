import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DetailPaymentComponent } from './DetailPaymentComponent';
jest.mock('@/components/HeaderDetail', () => ({
  HeaderDetail: () => null,
}));
jest.mock('@/components/CustomerDetailBorder', () => ({
  CustomerDetailBorder: () => null,
}));
jest.mock('@/components/Border', () => {
    const React = require('react');
    const { View } = require('react-native');
    const Border = ({ children }: any) => <View>{children}</View>;
    return { Border };
});
describe('DetailPaymentComponent', () => {
  const mockOrder = {
    amount: 500000,
    phone: '123456',
    orderCode: 'ORD001',
    createdAt: '2024-01-01',
  } as any;
  const onConfirm = jest.fn();
  it('renders payment method correctly for "cash"', () => {
    const { getByText } = render(
      <DetailPaymentComponent 
        order={mockOrder} 
        paymentMethod="cash" 
        onConfirm={onConfirm} 
      />
    );
    expect(getByText('Tiền mặt')).toBeTruthy();
    expect(getByText('Nhập tiền khách đưa')).toBeTruthy();
  });
  it('renders payment method correctly for "transfer"', () => {
    const { getByText } = render(
      <DetailPaymentComponent 
        order={mockOrder} 
        paymentMethod="transfer" 
        onConfirm={onConfirm} 
      />
    );
    expect(getByText('Chuyển khoản')).toBeTruthy();
    expect(getByText('Tạo mã chuyển khoản')).toBeTruthy();
  });
  it('calculates total correctly with static voucher (125,000)', () => {
    const orderWithVoucher = {
      ...mockOrder,
      promotionDiscount: 125000,
      finalAmount: 375000,
    };
    const { getByText, getAllByText } = render(
      <DetailPaymentComponent 
        order={orderWithVoucher} 
        paymentMethod="cash" 
        onConfirm={onConfirm} 
      />
    );
    expect(getAllByText('500,000 VND')).toHaveLength(1); 
    expect(getByText('- 125,000 VND')).toBeTruthy();
    expect(getByText('375,000 VND')).toBeTruthy();
  });
  it('calls onConfirm when main button is pressed', () => {
    const { getByText } = render(
      <DetailPaymentComponent 
        order={mockOrder} 
        paymentMethod="cash" 
        onConfirm={onConfirm} 
      />
    );
    const button = getByText('Nhập tiền khách đưa');
    fireEvent.press(button);
    expect(onConfirm).toHaveBeenCalled();
  });
});
