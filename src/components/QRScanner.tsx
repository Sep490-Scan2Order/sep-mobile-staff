import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

interface Props {
  onScan: (qrContent: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        const value = codes[0].value;
        if (value) setQrValue(value);
      }
    },
  });

  const handleCapture = () => {
    if (qrValue) {
      onScan(qrValue);
    }
  };

  if (!device || !hasPermission) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {/* Overlay button */}
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.button, !qrValue && styles.buttonDisabled]}
          onPress={handleCapture}
          disabled={!qrValue}
        >
          <Text style={styles.buttonText}>Scan QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
