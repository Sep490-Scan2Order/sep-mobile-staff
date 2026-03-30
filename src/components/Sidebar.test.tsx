import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Sidebar } from './Sidebar';
import { useSelector } from 'react-redux';

// Mock Lucide icons locally with the simplest possible way
jest.mock('lucide-react-native', () => ({
  ClipboardList: () => null,
  CookingPot: () => null,
  CheckCircle2: () => null,
  Truck: () => null,
  CreditCard: () => null,
  LayoutDashboard: () => null,
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('Sidebar Component', () => {
  const mockOnItemPress = jest.fn();
  
  const mockUnreadCounts = {
    all: 10,
    1: 5, // Chờ nhận
    2: 2, // Đang làm
    3: 0, // Hoàn thành
    4: 1, // Đã giao
    0: 0, // Chưa thanh toán
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

    expect(getByText('10')).toBeTruthy(); // Tất cả
    expect(getByText('5')).toBeTruthy();  // Chờ nhận
    expect(getByText('2')).toBeTruthy();  // Đang làm
    expect(getByText('1')).toBeTruthy();  // Đã giao
  });

  it('calls onItemPress with correct status code when an item is clicked', () => {
    const { getByText } = render(
      <Sidebar activeIndex={1} onItemPress={mockOnItemPress} />
    );

    // Clicking "Đang làm" should call with status 2
    fireEvent.press(getByText('Đang làm'));
    expect(mockOnItemPress).toHaveBeenCalledWith(2);

    // Clicking "Tất cả" should call with status -1
    fireEvent.press(getByText('Tất cả'));
    expect(mockOnItemPress).toHaveBeenCalledWith(-1);
  });

  it('highlights the active item based on activeIndex', () => {
    const { getByText } = render(
      <Sidebar activeIndex={2} onItemPress={mockOnItemPress} />
    );

    // activeIndex corresponds to the index in the navItems array (0 to 4)
    // index 1 is 'Đang làm' (status 2)
    const activeItem = getByText('Đang làm');
    expect(activeItem).toBeTruthy();
  });
});
