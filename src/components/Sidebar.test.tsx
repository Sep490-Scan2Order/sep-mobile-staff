import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Sidebar } from './Sidebar';
import { useSelector } from 'react-redux';
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
describe('Sidebar Component', () => {
  const mockOnItemPress = jest.fn();
  const mockUnreadCounts = {
    all: 10,
    1: 5, 
    2: 2, 
    3: 0, 
    4: 1, 
    0: 0, 
  };
  beforeEach(() => {
    jest.clearAllMocks();
    (useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      return selectorFn({ order: { unread: mockUnreadCounts } });
    });
  });
  it('renders all navigation items correctly', () => {
    const { getByText } = render(
      <Sidebar activeIndex={1} onItemPress={mockOnItemPress} />
    );
    expect(getByText('Tất cả')).toBeTruthy();
    expect(getByText('Chờ nhận')).toBeTruthy();
    expect(getByText('Đang làm')).toBeTruthy();
    expect(getByText('Hoàn thành')).toBeTruthy();
    expect(getByText('Đã giao')).toBeTruthy();
    expect(getByText('Chưa thanh toán')).toBeTruthy();
  });
  it('displays correct unread counts from redux state', () => {
    const { getByText } = render(
      <Sidebar activeIndex={1} onItemPress={mockOnItemPress} />
    );
    expect(getByText('10')).toBeTruthy(); 
    expect(getByText('5')).toBeTruthy();  
    expect(getByText('2')).toBeTruthy();  
    expect(getByText('1')).toBeTruthy();  
  });
  it('calls onItemPress with correct status code when an item is clicked', () => {
    const { getByText } = render(
      <Sidebar activeIndex={1} onItemPress={mockOnItemPress} />
    );
    fireEvent.press(getByText('Đang làm'));
    expect(mockOnItemPress).toHaveBeenCalledWith(2);
    fireEvent.press(getByText('Tất cả'));
    expect(mockOnItemPress).toHaveBeenCalledWith(-1);
  });
  it('highlights the active item based on activeIndex', () => {
    const { getByText } = render(
      <Sidebar activeIndex={2} onItemPress={mockOnItemPress} />
    );
    const activeItem = getByText('Đang làm');
    expect(activeItem).toBeTruthy();
  });
});
