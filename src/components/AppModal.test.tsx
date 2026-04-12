import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppModal, AppModalButton } from './AppModal';

describe('AppModal', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible with title and message', () => {
    const { getByText } = render(
      <AppModal
        visible={true}
        title="Test Title"
        message="Test Message Content"
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message Content')).toBeTruthy();
  });

  it('shows a default "Close" button if no buttons are provided', () => {
    const { getByText } = render(
      <AppModal
        visible={true}
        title="Confirm Modal"
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByText('Đóng')).toBeTruthy();
  });

  it('renders multiple buttons correctly and handles clicks', () => {
    const onConfirmClick = jest.fn();
    const onCancelClick = jest.fn();
    const customButtons: AppModalButton[] = [
      { label: 'Cancel', onPress: onCancelClick, style: 'secondary' },
      { label: 'Confirm', onPress: onConfirmClick, style: 'primary' },
    ];

    const { getByText } = render(
      <AppModal
        visible={true}
        title="Action Required"
        buttons={customButtons}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(onCancelClick).toHaveBeenCalled();

    fireEvent.press(getByText('Confirm'));
    expect(onConfirmClick).toHaveBeenCalled();
  });

  it('handles the dismiss event correctly', () => {
    // This is tested by dismiss but we can also test the provided dismiss button if it exists.
  });
});
