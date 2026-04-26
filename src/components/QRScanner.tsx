import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { X, Zap, ZapOff, Scan } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_SIZE = SCREEN_WIDTH * 0.7;

interface Props {
  onScan: (qrContent: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const navigation = useNavigation();
  const device = useCameraDevice('back');
  
  const [hasPermission, setHasPermission] = useState(false);
  const [torch, setTorch] = useState<'off' | 'on'>('off');
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isScanned, setIsScanned] = useState(false);

  // Animation for the laser line
  const translateY = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
        setHasPermission(permission === 'granted');
    })();
    
    // Start laser animation
    translateY.value = withRepeat(
      withTiming(SCAN_SIZE - 2, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, []);

  const animatedLaserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      // ONLY set qrValue, do NOT call onScan
      if (!isScanned && codes.length > 0) {
        const value = codes[0].value;
        if (value && value !== qrValue) {
          setQrValue(value);
        }
      }
    },
  });

  const handleManualScan = useCallback(() => {
    if (qrValue && !isScanned) {
      setIsScanned(true);
      onScan(qrValue);
    }
  }, [qrValue, isScanned, onScan]);

  if (!device || !hasPermission) return null;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isScanned}
        codeScanner={codeScanner}
        torch={torch}
      />

      <View style={styles.overlayContainer}>
        <View style={styles.backdrop} />
        
        <View style={styles.middleRow}>
          <View style={styles.backdrop} />
          
          <View style={styles.scanWindow}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <Animated.View style={[styles.laserLine, animatedLaserStyle]} />
          </View>
          
          <View style={styles.backdrop} />
        </View>

        <View style={[styles.backdrop, styles.bottomBackdrop]}>
          <Text style={styles.hintText}>
            {qrValue 
              ? `Đã nhận diện mã: ${qrValue.slice(0, 12)}...` 
              : "Căn khung hình vào mã QR để nhận diện"}
          </Text>
          {qrValue && (
            <Text style={styles.subHintText}>Nhấn nút bên dưới để xác nhận</Text>
          )}
        </View>
      </View>

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.iconButton}
        >
          <X color="#FFF" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setTorch(t => t === 'on' ? 'off' : 'on')} 
          style={styles.iconButton}
        >
          {torch === 'on' ? <ZapOff color="#FFD700" size={24} /> : <Zap color="#FFF" size={24} />}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.scanButton, !qrValue && styles.scanButtonDisabled]} 
          onPress={handleManualScan}
          disabled={!qrValue || isScanned}
        >
          <Scan color={qrValue ? "#FFF" : "#9ca3af"} size={24} />
          <Text style={[styles.scanButtonText, { color: qrValue ? "#FFF" : "#9ca3af" }]}>
            {isScanned ? "ĐANG XỬ LÝ..." : qrValue ? "XÁC NHẬN QUÉT" : "ĐANG TÌM MÃ..."}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  bottomBackdrop: {
    flex: 1.5,
    paddingTop: 30,
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#226B5D',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    position: 'absolute',
    left: 5,
    right: 5,
    height: 2,
    backgroundColor: '#226B5D',
    shadowColor: '#226B5D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    width: '100%',
    zIndex: 10,
  },
  hintText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  subHintText: {
    color: '#226B5D',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    backgroundColor: '#E8F3F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#226B5D',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 1,
  },
});

