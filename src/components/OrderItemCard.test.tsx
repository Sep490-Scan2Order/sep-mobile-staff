import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OrderItemCard } from './OrderItemCard';
import { Order } from '@/type';

describe('OrderItemCard Component', () => {
  const mockOrder: Order = {
    id: 'ord-123',
    orderCode: 101,
    status: 1, // Đã nhận
    phone: '0987654321',
    amount: 50000,
    isPreOrder: false,
    createdAt: new Date('2026-03-29T10:00:00Z').toISOString(),
    items: [{ name: 'Bún chả', quantity: 1, price: 50000 }],
    accountId: 'acc-1',
    paymentMethod: 'Cash',
    orderType: 'Dine-in'
  };

  const mockProps = {
    item: mockOrder,
    activeMenuId: null,
    setActiveMenuId: jest.fn(),
    onViewDetail: jest.fn(),
    onRefund: jest.fn(),
    onUpdateStatus: jest.fn(),
    onOpenPickup: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders order details correctly', () => {
    const { getByText } = render(<OrderItemCard {...mockProps} />);

    expect(getByText('ORD-101')).toBeTruthy();
    expect(getByText('0987654321')).toBeTruthy();
    expect(getByText('50,000 đ')).toBeTruthy();
  });

  it('shows action button "Nhận đơn" for status 1', () => {
    const { getByText } = render(<OrderItemCard {...mockProps} />);
    const actionButton = getByText('Nhận đơn');
    
    expect(actionButton).toBeTruthy();
    fireEvent.press(actionButton);
    expect(mockProps.onUpdateStatus).toHaveBeenCalledWith(mockOrder);
  });

  it('shows action button "Làm xong" for status 2', () => {
    const orderPreparing = { ...mockOrder, status: 2 };
    const { getByText } = render(<OrderItemCard {...mockProps} item={orderPreparing} />);
    
    expect(getByText('Làm xong')).toBeTruthy();
  });

  it('shows pre-order labels only when isPreOrder is true', () => {
    const preOrder = { 
      ...mockOrder, 
      isPreOrder: true, 
      requestedPickupAt: new Date('2026-03-29T12:00:00Z').toISOString() 
    };
    const { getByText, queryByText } = render(<OrderItemCard {...mockProps} item={preOrder} />);
    
    expect(getByText('PRE-ORDER')).toBeTruthy();
    expect(getByText(/Nhận lúc:/)).toBeTruthy();
  });

  it('shows "Xác nhận giờ nhận hàng" for status 1 pre-order without confirmation', () => {
    const preOrder = { ...mockOrder, isPreOrder: true, confirmedPickupAt: null };
    const { getByText } = render(<OrderItemCard {...mockProps} item={preOrder} />);
    
    const pickupButton = getByText('Xác nhận giờ nhận hàng');
    expect(pickupButton).toBeTruthy();
    
    fireEvent.press(pickupButton);
    expect(mockProps.onOpenPickup).toHaveBeenCalledWith(preOrder);
  });

  it('opens options menu when MoreVertical icon is pressed', () => {
    // We pass activeMenuId matching the order id to simulate it being open
    const { getByText } = render(<OrderItemCard {...mockProps} activeMenuId="ord-123" />);
    
    expect(getByText('Chi tiết')).toBeTruthy();
    expect(getByText('Hoàn tiền')).toBeTruthy();
    
    fireEvent.press(getByText('Chi tiết'));
    expect(mockProps.onViewDetail).toHaveBeenCalledWith('ord-123');
    expect(mockProps.setActiveMenuId).toHaveBeenCalledWith(null);
  });
});
