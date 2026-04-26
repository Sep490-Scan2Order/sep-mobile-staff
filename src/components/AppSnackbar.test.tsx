import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
const { AppSnackbar } = jest.requireActual('./AppSnackbar');
jest.useFakeTimers();
describe('AppSnackbar', () => {
  const mockOnDismiss = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <AppSnackbar
        visible={true}
        message="Test Message"
        onDismiss={mockOnDismiss}
      />
    );
    expect(getByText('Test Message')).toBeTruthy();
  });
  it('does not render when not visible', () => {
    const { queryByText } = render(
      <AppSnackbar
        visible={false}
        message="Test Message"
        onDismiss={mockOnDismiss}
      />
    );
    expect(queryByText('Test Message')).toBeNull();
  });
  it('calls onDismiss after duration', () => {
    render(
      <AppSnackbar
        visible={true}
        message="Test Message"
        duration={1000}
        onDismiss={mockOnDismiss}
      />
    );
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(mockOnDismiss).toHaveBeenCalled();
  });
  it('calls onAction when action button is pressed', () => {
    const mockOnAction = jest.fn();
    const { getByText } = render(
      <AppSnackbar
        visible={true}
        message="Test Message"
        actionLabel="Retry"
        onAction={mockOnAction}
        onDismiss={mockOnDismiss}
      />
    );
    fireEvent.press(getByText('Retry'));
    expect(mockOnAction).toHaveBeenCalled();
  });
  it('hides when close button is pressed', () => {
    const { getByTestId, queryByText } = render(
      <AppSnackbar
        visible={true}
        message="Test Message"
        onDismiss={mockOnDismiss}
      />
    );
  });
});
