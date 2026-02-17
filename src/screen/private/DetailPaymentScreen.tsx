import React, { useState } from 'react';
import { View } from 'react-native';
import { DetailPaymentComponent } from '../../components/DetailPaymentComponent';
import { PaymentInputComponent } from '../../components/PaymentInputComponent';
import { CashPaymentSuccessComponent } from '../../components/CashPaymentSuccessComponent';

export default function DetailOrderScreen() {
  // 1: Detail, 2: Input, 3: Success
  const [step, setStep] = useState(1);

  return (
    <View className="flex-1 bg-gray-100">
      {step === 1 && <DetailPaymentComponent onConfirm={() => setStep(2)} />}

      {step === 2 && (
        <PaymentInputComponent
          onBack={() => setStep(1)}
          onConfirmPayment={() => setStep(3)} // Giả sử khi nhấn Xác nhận ở Input sẽ qua trang Success
        />
      )}

      {step === 3 && (
        <CashPaymentSuccessComponent onComplete={() => setStep(1)} />
      )}
    </View>
  );
}
