import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDishesByRestaurant } from '../../store/slices/dishSlice';

import { HeaderDetail } from '../../components/HeaderDetail';
import { StatCard } from '../../components/StatCard';
import { TabBar } from '../../components/TabBar';
import { FoodItemCard } from '../../components/FoodItemCard';

const FoodManagementScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { dishes, loading, error } = useSelector(
    (state: RootState) => state.dish,
  );

  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );

  const [activeTab, setActiveTab] = useState('Tất cả');
  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchDishesByRestaurant(restaurantId));
    }
  }, [dispatch, restaurantId]);

  const total = dishes.length;
  const selling = dishes.filter(d => !d.isSoldOut).length;
  const stopped = dishes.filter(d => d.isSoldOut).length;
  const filteredDishes = dishes.filter(d => {
    if (activeTab === 'Đang bán') return !d.isSoldOut;
    if (activeTab === 'Đã bán hết') return d.isSoldOut;
    return true;
  });
  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail title="Quản lý món ăn" heightClass="h-2/6" />

      <View className="flex-row px-5" style={{ marginTop: -120 }}>
        <StatCard number={total} label="Tất cả" />
        <StatCard number={selling} label="Đang bán" />
        <StatCard number={stopped} label="Đã bán hết" />
      </View>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* {loading && <ActivityIndicator size="large" />} */}

      {error && <Text className="text-red-500 text-center">{error}</Text>}

      <ScrollView className="mt-4 mb-24">
        {filteredDishes.map(item => (
          <FoodItemCard
            key={item.id}
            name={item.dishName}
            price={`${item.price.toLocaleString()} VND`}
            image={item.dishImage}
            active={!item.isSoldOut}
            id={item.id}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default FoodManagementScreen;
