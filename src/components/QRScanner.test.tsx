import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import QRScanner from './QRScanner';
import { Camera } from 'react-native-vision-camera';
let mockOnCodeScanned: any = null;
jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Camera: Object.assign(({ children }: any) => <View testID="mock-camera">{children}</View>, {
        requestCameraPermission: jest.fn().mockResolvedValue('granted'),
    }),
    useCameraDevice: jest.fn(() => ({ name: 'back' })),
    useCodeScanner: jest.fn((config) => {
        mockOnCodeScanned = config.onCodeScanned;
        return { isScanning: true };
    }),
  };
});
describe('QRScanner', () => {
  const onScan = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (Camera.requestCameraPermission as jest.Mock).mockResolvedValue('granted');
    mockOnCodeScanned = null;
  });
  it('renders nothing if no permission', async () => {
    (Camera.requestCameraPermission as jest.Mock).mockResolvedValue('denied');
    const { queryByText } = render(<QRScanner onScan={onScan} />);
    await waitFor(() => {
        expect(queryByText('Scan QR')).toBeNull();
    });
  });
  it('renders camera and scan button when permission is granted', async () => {
    const { getByText } = render(<QRScanner onScan={onScan} />);
    await waitFor(() => {
        expect(getByText('Scan QR')).toBeTruthy();
    });
  });
  it('enables scan button and calls onScan when QR is detected', async () => {
    const { getByText } = render(<QRScanner onScan={onScan} />);
    await waitFor(() => {
        expect(getByText('Scan QR')).toBeTruthy();
    });
    await act(async () => {
        if (mockOnCodeScanned) {
            mockOnCodeScanned([{ value: 'test-qr-code' }]);
        }
    });
    const scanButton = getByText('Scan QR');
    await act(async () => {
        fireEvent.press(scanButton);
    });
    expect(onScan).toHaveBeenCalledWith('test-qr-code');
  });
});
