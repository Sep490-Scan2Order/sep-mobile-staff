import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChangePasswordScreen from './ChangePasswordScreen';
import { authService } from '@/services/logicServices/authService';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('@/services/logicServices/authService', () => ({
  authService: {
    changePassword: jest.fn(),
  },
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Eye: () => null,
  EyeOff: () => null,
}));

describe('ChangePasswordScreen', () => {
  const mockGoBack = jest.fn();
  const mockEmail = 'staff@fpt.edu.vn';

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack });
    (useRoute as jest.Mock).mockReturnValue({ params: { email: mockEmail } });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  // Helper: get 3 inputs by index (old=0, new=1, confirm=2)
  const getInputs = () => screen.UNSAFE_getAllByType(require('react-native').TextInput);
  const pressSubmit = () => {
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    // Last button is the submit button
    fireEvent.press(buttons[buttons.length - 1]);
  };

  it('renders email as non-editable field', () => {
    render(<ChangePasswordScreen />);
    expect(screen.getByDisplayValue(mockEmail)).toBeTruthy();
  });

  it('renders 4 text inputs (email + 3 password)', () => {
    render(<ChangePasswordScreen />);
    // email, oldPassword, newPassword, confirmPassword
    expect(getInputs().length).toBeGreaterThanOrEqual(4);
  });

  it('shows error when oldPassword is empty', () => {
    render(<ChangePasswordScreen />);
    pressSubmit();
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/c.+i|old|c/i)
    );
  });

  it('shows error when newPassword is shorter than 6 chars', () => {
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass'); // oldPassword
    fireEvent.changeText(inputs[2], '123');     // newPassword < 6
    pressSubmit();
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/6/i)
    );
  });

  it('shows error when passwords do not match', () => {
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'DiffPass!');
    pressSubmit();
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/kh.+p|match/i)
    );
  });

  it('calls authService.changePassword with correct payload', async () => {
    (authService.changePassword as jest.Mock).mockResolvedValue({ success: true });
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass123');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'NewPass123!');
    pressSubmit();

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith({
        email: mockEmail,
        oldPassword: 'OldPass123',
        newPassword: 'NewPass123!',
      });
    });
  });

  it('shows success alert and calls goBack when pressing OK', async () => {
    (authService.changePassword as jest.Mock).mockResolvedValue({ success: true });
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass123');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'NewPass123!');
    pressSubmit();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringMatching(/th.+nh|success/i),
        expect.any(String),
        expect.arrayContaining([expect.objectContaining({ text: 'OK' })])
      );
    });

    const okPress = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
    okPress();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('shows error alert with server message when success is false', async () => {
    (authService.changePassword as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Wrong old password',
    });
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'Wrong');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'NewPass123!');
    pressSubmit();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        'Wrong old password'
      );
    });
  });

  it('shows fallback message when success false with no message', async () => {
    (authService.changePassword as jest.Mock).mockResolvedValue({ success: false, message: null });
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass123');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'NewPass123!');
    pressSubmit();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/kh.+ng th|unable|cannot/i)
      );
    });
  });

  it('shows error when authService throws exception', async () => {
    (authService.changePassword as jest.Mock).mockRejectedValue(new Error('Network Error'));
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass123');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'NewPass123!');
    pressSubmit();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/kh.+ng th|cannot/i)
      );
    });
  });

  it('navigates back when back button pressed', () => {
    render(<ChangePasswordScreen />);
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]); // first = back arrow
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('toggles password visibility when eye icon is pressed', () => {
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    // newPassword input (index 2): default is secureTextEntry=true
    expect(inputs[2].props.secureTextEntry).toBe(true);

    // Press the eye/eyeOff toggle button (2nd button after back button)
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    // buttons[1] is the showPassword toggle
    fireEvent.press(buttons[1]);

    const inputsAfter = getInputs();
    expect(inputsAfter[2].props.secureTextEntry).toBe(false);
  });
});
