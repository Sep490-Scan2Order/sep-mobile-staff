import React, { useState } from 'react';
import { View } from 'react-native';
import { DetailPaymentComponent } from '../../components/DetailPaymentComponent';
import { PaymentInputComponent } from '../../components/PaymentInputComponent';
import { CashPaymentSuccessComponent } from '../../components/CashPaymentSuccessComponent';
import { RouteProp, useRoute } from '@react-navigation/native';
type PaymentRouteProp = RouteProp<RootStackParamList, 'DetailOrderScreen'>;
export default function DetailOrderScreen() {
  // 1: Detail, 2: Input, 3: Success
  const [step, setStep] = useState(1);
  const route = useRoute<PaymentRouteProp>();
  const { order } = route.params;
  return (
    <View className="flex-1 bg-gray-100">
      {step === 1 && (
        <DetailPaymentComponent
          order={order}
          paymentMethod="cash"
          onConfirm={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <PaymentInputComponent
          totalAmount={order.amount}
          onBack={() => setStep(1)}
          onConfirmPayment={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <CashPaymentSuccessComponent
          order={order}
          onComplete={() => setStep(1)}
        />
      )}
    </View>
  );
}
