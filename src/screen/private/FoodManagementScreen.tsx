import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { StatCard } from '../../components/StatCard';
import { TabBar } from '../../components/TabBar';
import { FoodItemCard } from '../../components/FoodItemCard';

const FoodManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail title="Quản lý món ăn" heightClass="h-2/6" />

      {/* Stats */}
      <View className="flex-row px-5" style={{ marginTop: -120 }}>
        <StatCard number={8} label="Tổng số" />
        <StatCard number={8} label="Đang bán" />
        <StatCard number={8} label="Ngừng bán" />
      </View>

      {/* Tabs */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* List */}
      <ScrollView className="mt-4 mb-24">
        <FoodItemCard name="Combo 1 người" price="100.000 VND" active={false} />
      </ScrollView>
    </View>
  );
};
export default FoodManagementScreen;
