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
  AlertCircle: () => null,
}));
jest.mock('@/components/AppSnackbar', () => {
    const { View, Text } = require('react-native');
    return {
      AppSnackbar: ({ message, visible }: any) => {
        if (!visible) return null;
        return <View><Text>{message}</Text></View>;
      }
    };
});
jest.mock('@/components/AppModal', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        AppModal: ({ visible, title, message, buttons }: any) => {
            if (!visible) return null;
            return (
                <View>
                    <Text>{title}</Text>
                    <Text>{message}</Text>
                    {buttons?.map((btn: any, index: number) => (
                        <TouchableOpacity key={index} onPress={btn.onPress}>
                            <Text>{btn.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
    }
});
describe('ChangePasswordScreen', () => {
  const mockGoBack = jest.fn();
  const mockEmail = 'staff@fpt.edu.vn';
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack });
    (useRoute as jest.Mock).mockReturnValue({ params: { email: mockEmail } });
  });
  const getInputs = () => screen.UNSAFE_getAllByType(require('react-native').TextInput);
  const pressSubmit = () => {
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[buttons.length - 1]);
  };
  it('renders email as non-editable field', () => {
    render(<ChangePasswordScreen />);
    expect(screen.getByDisplayValue(mockEmail)).toBeTruthy();
  });
  it('renders 4 text inputs (email + 3 password)', () => {
    render(<ChangePasswordScreen />);
    expect(getInputs().length).toBeGreaterThanOrEqual(4);
  });
  it('shows error when oldPassword is empty', () => {
    render(<ChangePasswordScreen />);
    pressSubmit();
    expect(screen.getByText('Vui lòng nhập mật khẩu cũ')).toBeTruthy();
  });
  it('shows error when newPassword is shorter than 6 chars', () => {
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass'); 
    fireEvent.changeText(inputs[2], '123');     
    pressSubmit();
    expect(screen.getByText('Mật khẩu phải có ít nhất 8 ký tự')).toBeTruthy();
  });
  it('shows error when passwords do not match', () => {
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'DiffPass!');
    pressSubmit();
    expect(screen.getByText('Mật khẩu xác nhận không khớp')).toBeTruthy();
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
  it('shows success modal and calls goBack when pressing OK', async () => {
    (authService.changePassword as jest.Mock).mockResolvedValue({ success: true });
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    fireEvent.changeText(inputs[1], 'OldPass123');
    fireEvent.changeText(inputs[2], 'NewPass123!');
    fireEvent.changeText(inputs[3], 'NewPass123!');
    pressSubmit();
    await waitFor(() => {
      expect(screen.getByText('Đổi mật khẩu thành công')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('OK'));
    expect(mockGoBack).toHaveBeenCalled();
  });
  it('shows error snackbar with server message when success is false', async () => {
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
      expect(screen.getByText('Wrong old password')).toBeTruthy();
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
      expect(screen.getByText(/Không thể đổi mật khẩu/)).toBeTruthy();
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
      expect(screen.getByText(/Không thể đổi mật khẩu. Vui lòng thử lại./)).toBeTruthy();
    });
  });
  it('navigates back when back button pressed', () => {
    render(<ChangePasswordScreen />);
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]); 
    expect(mockGoBack).toHaveBeenCalled();
  });
  it('toggles password visibility when eye icon is pressed', () => {
    render(<ChangePasswordScreen />);
    const inputs = getInputs();
    expect(inputs[2].props.secureTextEntry).toBe(true);
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[1]);
    const inputsAfter = getInputs();
    expect(inputsAfter[2].props.secureTextEntry).toBe(false);
  });
});
