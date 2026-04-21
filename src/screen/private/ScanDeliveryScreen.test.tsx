import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScanDeliveryScreen from './ScanDeliveryScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { orderService } from '@/services/logicServices/orderService';
import { playAudioUrl } from '@/services/logicServices/playAudioUrl';
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
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));
jest.mock('@/services/logicServices/orderService', () => ({
  orderService: {
    scanOrderQr: jest.fn(),
  },
}));
jest.mock('@/services/logicServices/playAudioUrl', () => ({
  playAudioUrl: jest.fn(),
}));
jest.mock('@/components/QRScanner', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return ({ onScan }: any) => (
        <TouchableOpacity onPress={() => onScan('mock-qr-content')} testID="mock-qr-scanner">
            <Text>Scan Button</Text>
        </TouchableOpacity>
    );
});
describe('ScanDeliveryScreen', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockParams = { orderNumber: 101 };
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate, goBack: mockGoBack });
    (useRoute as jest.Mock).mockReturnValue({ params: mockParams });
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  it('handles successful QR scan', async () => {
    (orderService.scanOrderQr as jest.Mock).mockResolvedValue('test-audio-url');
    const { getByTestId, getByText } = render(<ScanDeliveryScreen />);
    fireEvent.press(getByTestId('mock-qr-scanner'));
    await waitFor(() => {
      expect(orderService.scanOrderQr).toHaveBeenCalledWith('mock-qr-content', 101);
      expect(getByText('Giao hàng thành công!')).toBeTruthy();
      expect(playAudioUrl).toHaveBeenCalledWith('test-audio-url');
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
  it('handles invalid QR code (no audioUrl)', async () => {
    (orderService.scanOrderQr as jest.Mock).mockResolvedValue(null);
    const { getByTestId, getByText } = render(<ScanDeliveryScreen />);
    fireEvent.press(getByTestId('mock-qr-scanner'));
    await waitFor(() => {
      expect(getByText(/QR không hợp lệ/i)).toBeTruthy();
      expect(playAudioUrl).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });
  it('handles service errors', async () => {
    (orderService.scanOrderQr as jest.Mock).mockRejectedValue(new Error('Network Fail'));
    const { getByTestId, getByText } = render(<ScanDeliveryScreen />);
    fireEvent.press(getByTestId('mock-qr-scanner'));
    await waitFor(() => {
      expect(getByText('Network Fail')).toBeTruthy();
    });
  });
});
