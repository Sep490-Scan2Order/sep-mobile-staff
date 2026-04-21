import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { TabBar } from './TabBar';
describe('TabBar', () => {
  const setActiveTab = jest.fn();
  beforeEach(() => {
    setActiveTab.mockClear();
  });
  it('renders all tabs correctly', () => {
    render(<TabBar activeTab="Tất cả" setActiveTab={setActiveTab} />);
    expect(screen.getByText('Tất cả')).toBeTruthy();
    expect(screen.getByText('Đang bán')).toBeTruthy();
    expect(screen.getByText('Đã bán hết')).toBeTruthy();
  });
  it('calls setActiveTab with the correct tab name when a tab is pressed', () => {
    render(<TabBar activeTab="Tất cả" setActiveTab={setActiveTab} />);
    fireEvent.press(screen.getByText('Đang bán'));
    expect(setActiveTab).toHaveBeenCalledWith('Đang bán');
    fireEvent.press(screen.getByText('Đã bán hết'));
    expect(setActiveTab).toHaveBeenCalledWith('Đã bán hết');
  });
  it('highlights the active tab', () => {
    const { rerender } = render(<TabBar activeTab="Tất cả" setActiveTab={setActiveTab} />);
    expect(screen.getByText('Tất cả')).toBeTruthy();
    rerender(<TabBar activeTab="Đang bán" setActiveTab={setActiveTab} />);
    expect(screen.getByText('Đang bán')).toBeTruthy();
  });
});
