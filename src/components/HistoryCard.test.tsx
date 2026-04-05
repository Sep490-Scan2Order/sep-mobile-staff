import React from 'react';
import { render } from '@testing-library/react-native';
import { HistoryCard } from './HistoryCard';

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  User: () => null,
  Store: () => null,
  TrendingUp: () => null,
}));

describe('HistoryCard', () => {
  const defaultProps = {
    employee: 'John Doe',
    restaurant: 'Main Branch',
    totalCashOrder: 500000,
    totalTransferOrder: 200000,
    totalRefundAmount: 50000,
    expectedCashAmount: 450000,
    actualCashAmount: 450000,
    difference: 0,
    note: 'Uniform match',
  };

  it('renders general information correctly', () => {
    const { getByText } = render(<HistoryCard {...defaultProps} />);
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Main Branch')).toBeTruthy();
    expect(getByText('Uniform match')).toBeTruthy();
  });

  it('renders financial breakdown correctly', () => {
    // Use different values to avoid "multiple elements" error in test
    const props = { ...defaultProps, actualCashAmount: 460000, difference: 10000 };
    const { getByText } = render(<HistoryCard {...props} />);
    
    expect(getByText('500,000 VND')).toBeTruthy();
    expect(getByText('200,000 VND')).toBeTruthy();
    expect(getByText('-50,000 VND')).toBeTruthy();
    expect(getByText('450,000 VND')).toBeTruthy(); // Expected
    expect(getByText('460,000 VND')).toBeTruthy(); // Actual
  });

  it('renders "Khớp" status when difference is 0', () => {
    const { getByText, getAllByText } = render(<HistoryCard {...defaultProps} />);
    expect(getByText(/Khớp/)).toBeTruthy();
    // In match case, both expected and actual are 450,000
    expect(getAllByText('450,000 VND').length).toBe(2);
  });

  it('renders "Thừa tiền" status and positive difference', () => {
    const props = { ...defaultProps, difference: 10000, actualCashAmount: 460000 };
    const { getByText } = render(<HistoryCard {...props} />);
    
    expect(getByText(/Thừa tiền/)).toBeTruthy();
    expect(getByText('+ 10,000 VND')).toBeTruthy();
  });

  it('renders "Thiếu tiền" status and negative difference', () => {
    const props = { ...defaultProps, difference: -5000, actualCashAmount: 445000 };
    const { getByText } = render(<HistoryCard {...props} />);
    
    expect(getByText(/Thiếu tiền/)).toBeTruthy();
    expect(getByText('- 5,000 VND')).toBeTruthy();
  });
});
