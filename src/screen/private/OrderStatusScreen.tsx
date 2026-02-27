import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { RestaurantCard } from '../../components/RestaurantCard';
import { OrderStatusCard } from '../../components/OrderStatusCard';

export const OrderStatusScreen = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail title="Trạng thái đơn hàng" heightClass="h-2/6" />

      <ScrollView className="flex-1" style={{ marginTop: -120 }}>
        <RestaurantCard
          name="Tava Restaurant"
          address="kazi Deiry, Taiger Pass,Chittagong"
          openTime="10:00 AM - 12:00 PM"
          image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
        />

        <OrderStatusCard isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

        <View className="h-28" />
      </ScrollView>
    </View>
  );
};
export default OrderStatusScreen;
