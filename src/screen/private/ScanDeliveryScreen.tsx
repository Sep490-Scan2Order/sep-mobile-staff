import React from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import QRScanner from '../../components/QRScanner';
import { orderService } from '../../services/logicServices/orderService';
import { getOrderAudio } from '../../services/logicServices/orderAudioService';
import { playAudioUrl } from '../../services/logicServices/playAudioUrl';
import { useRoute } from '@react-navigation/native';
export default function ScanDeliveryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNumber } = route.params as { orderNumber: number };
  const handleScan = async (qrContent: string) => {
    try {
      const audioUrl = await orderService.scanOrderQr(qrContent, orderNumber);

      console.log('OrderNumber:', orderNumber);

      if (!audioUrl) {
        Alert.alert('QR không hợp lệ');
        return;
      }

      Alert.alert('Giao hàng thành công');
      await playAudioUrl(audioUrl);

      navigation.goBack();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Lỗi khi quét QR', error?.message || 'Unknown error');
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <QRScanner onScan={handleScan} />
    </View>
  );
}
