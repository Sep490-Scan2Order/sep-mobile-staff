import React from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import QRScanner from '../../components/QRScanner';
import { orderService } from '../../services/logicServices/orderService';
import { getOrderAudio } from '../../services/logicServices/orderAudioService';
import { playAudioUrl } from '../../services/logicServices/playAudioUrl';

export default function ScanDeliveryScreen() {
  const navigation = useNavigation();

  const handleScan = async (qrContent: string) => {
    try {
      const orderCode = Number(qrContent);

      const isValid = await orderService.scanOrderQr(qrContent);

      if (!isValid) {
        Alert.alert('QR không hợp lệ');
        return;
      }

      // 🔊 lấy audio
      const audioUrl = await getOrderAudio(orderCode);

      // 🔊 phát audio
      await playAudioUrl(audioUrl);

      Alert.alert('Giao hàng thành công');

      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi khi quét QR');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <QRScanner onScan={handleScan} />
    </View>
  );
}
