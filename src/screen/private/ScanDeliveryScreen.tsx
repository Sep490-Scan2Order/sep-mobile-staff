import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QRScanner from '@/components/QRScanner';
import { orderService } from '@/services/logicServices/orderService';
import { playAudioUrl } from '@/services/logicServices/playAudioUrl';
import { useRoute } from '@react-navigation/native';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
export default function ScanDeliveryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNumber } = route.params as { orderNumber: number };
  const snackbar = useSnackbar();
  const handleScan = async (qrContent: string) => {
    try {
      const audioUrl = await orderService.scanOrderQr(qrContent, orderNumber);
      if (!audioUrl) {
        snackbar.showError('QR không hợp lệ. Vui lòng thử lại.');
        return;
      }
      snackbar.showSuccess('Giao hàng thành công!');
      await playAudioUrl(audioUrl);
      navigation.goBack();
    } catch (error: any) {
      snackbar.showError(
        error?.message || 'Lỗi khi quét QR. Vui lòng thử lại.',
      );
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <QRScanner onScan={handleScan} />
      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
    </View>
  );
}
