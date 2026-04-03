import React from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { useSelector } from 'react-redux';
import CashReportScreen from './CashReportScreen';
import { shiftService } from '@/services/logicServices/shiftService';

// Mock Redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

// Mock Services
jest.mock('@/services/logicServices/shiftService', () => ({
  shiftService: {
    getReport: jest.fn(),
    getReportsByStaff: jest.fn(),
  },
}));

// Mock Components
jest.mock('@/components/Header', () => ({ Header: () => null }));
jest.mock('@/components/HistoryCard', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return {
        HistoryCard: ({ shiftId }: { shiftId: number }) => (
            <View testID={`history-item-${shiftId}`}>
                <Text>{`History Part ${shiftId}`}</Text>
            </View>
        ),
    };
});

// Mock Lucide Icons
jest.mock('lucide-react-native', () => ({
  AlertCircle: () => null,
  Clock: () => null,
  ChevronLeft: () => null,
  Calendar: () => null,
}));

describe('CashReportScreen High Coverage', () => {
  const mockUser = { id: 'user-123', name: 'Test Staff', restaurantName: 'Test Restaurant' };
  const mockReport = { 
    shiftId: 100, 
    reportDate: '2024-01-01T08:00:00Z', 
    totalCashOrder: 500000, 
    totalTransferOrder: 200000, 
    totalRefundAmount: 50000, 
    expectedCashAmount: 650000, 
    actualCashAmount: 650000, 
    difference: 0 
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector({ auth: { userInfo: mockUser } }));
  });

  it('renders shift report detail success', async () => {
    (shiftService.getReport as jest.Mock).mockResolvedValue(mockReport);
    render(<CashReportScreen route={{ params: { shiftId: 100 } }} />);
    await waitFor(() => expect(screen.queryByText(/CA #100/i)).toBeTruthy());
  });

  it('handles error in fetchSingleReport', async () => {
    (shiftService.getReport as jest.Mock).mockRejectedValue(new Error('Fetch Failed'));
    render(<CashReportScreen route={{ params: { shiftId: 101 } }} />);
    await waitFor(() => expect(screen.queryByText(/Fetch Failed/)).toBeTruthy());
  });

  it('renders staff history success', async () => {
    const mockHistory = [{ shiftId: 101, reportDate: '2024-01-01', totalCashOrder: 100, totalTransferOrder: 0, totalRefundAmount: 0, expectedCashAmount: 100, actualCashAmount: 100, difference: 0 }];
    (shiftService.getReportsByStaff as jest.Mock).mockResolvedValue(mockHistory);
    render(<CashReportScreen route={{}} />);
    await waitFor(() => expect(screen.queryByText(/History|101/i)).toBeTruthy());
  });

  it('handles error in fetchStaffHistory', async () => {
    (shiftService.getReportsByStaff as jest.Mock).mockRejectedValue(new Error('History Fail'));
    render(<CashReportScreen route={{}} />);
    await waitFor(() => expect(screen.queryByText(/History Fail/i)).toBeTruthy());
  });

  it('handles onRefresh for detail branch', async () => {
    (shiftService.getReport as jest.Mock).mockResolvedValue(mockReport);
    render(<CashReportScreen route={{ params: { shiftId: 100 } }} />);
    await waitFor(() => expect(screen.queryByText(/100/)).toBeTruthy());
    
    const scrollView = screen.UNSAFE_queryByType(RefreshControl);
    scrollView?.props.onRefresh();
    expect(shiftService.getReport).toHaveBeenCalledTimes(2);
  });

  it('handles onRefresh for history fallback branch', async () => {
    (shiftService.getReportsByStaff as jest.Mock).mockResolvedValue([]);
    render(<CashReportScreen route={{}} />);
    await waitFor(() => expect(shiftService.getReportsByStaff).toHaveBeenCalledTimes(1));
    
    const scrollView = screen.UNSAFE_queryByType(RefreshControl);
    scrollView?.props.onRefresh();
    expect(shiftService.getReportsByStaff).toHaveBeenCalledTimes(2);
  });

  it('handles navigation actions (Back and item click)', async () => {
    // 1. Click "Back"
    (shiftService.getReport as jest.Mock).mockResolvedValue(mockReport);
    const { getByText } = render(<CashReportScreen route={{ params: { shiftId: 100 } }} />);
    await waitFor(() => expect(screen.queryByText(/Quay|Back/i)).toBeTruthy());
    fireEvent.press(getByText(/Quay|Back/i));
    expect(shiftService.getReportsByStaff).toHaveBeenCalled();

    // 2. Fresh mount for item click
    const mockHistory = [{ shiftId: 202, reportDate: '2024' }];
    (shiftService.getReportsByStaff as jest.Mock).mockResolvedValue(mockHistory);
    (shiftService.getReport as jest.Mock).mockResolvedValue({ ...mockReport, shiftId: 202 });
    
    render(<CashReportScreen route={{}} />);
    await waitFor(() => expect(screen.queryByText(/History Part 202/i)).toBeTruthy());
    fireEvent.press(screen.getByText(/History Part 202/i));
    await waitFor(() => expect(screen.queryByText(/CA #202/i)).toBeTruthy());
  });

  it('verifies formatCurrency utility behavior', async () => {
    (shiftService.getReport as jest.Mock).mockResolvedValue({ ...mockReport, totalCashOrder: null, totalTransferOrder: 'invalid' });
    render(<CashReportScreen route={{ params: { shiftId: 123 } }} />);
    await waitFor(() => expect(screen.getAllByText(/0 đ/).length).toBeGreaterThan(0));
  });
});
