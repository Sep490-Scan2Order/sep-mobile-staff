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

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const restaurantId = userInfo?.restaurantId;

  console.log('🔍 FoodManagementScreen Debug:', {
    userInfo,
    restaurantId,
    dishesLength: dishes.length,
    loading,
    error,
  });

  const [activeTab, setActiveTab] = useState('Tất cả');

  useEffect(() => {
    console.log('✅ useEffect triggered with restaurantId:', restaurantId);
    if (restaurantId) {
      console.log(
        '📤 Dispatching fetchDishesByRestaurant for restaurantId:',
        restaurantId,
      );
      dispatch(fetchDishesByRestaurant(restaurantId));
    } else {
      console.warn('⚠️ restaurantId is undefined, skipping fetch');
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

      {/* ⚠️ Kiểm tra restaurantId */}
      {!restaurantId && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 text-center px-4">
            ❌ Không tìm thấy thông tin nhà hàng. Vui lòng đăng nhập lại.
          </Text>
        </View>
      )}

      {restaurantId && (
        <>
          <View className="flex-row px-5" style={{ marginTop: -120 }}>
            <StatCard number={total} label="Tất cả" />
            <StatCard number={selling} label="Đang bán" />
            <StatCard number={stopped} label="Đã bán hết" />
          </View>
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

          {loading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="mt-3 text-gray-600">Đang tải dữ liệu...</Text>
            </View>
          )}

          {error && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-red-500 text-center px-4">
                ❌ Lỗi: {error}
              </Text>
            </View>
          )}

          {!loading && !error && dishes.length === 0 && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 text-center">
                Không có món ăn nào
              </Text>
            </View>
          )}

          {!loading && !error && dishes.length > 0 && (
            <ScrollView className="mt-4 mb-21">
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
          )}
        </>
      )}
    </View>
  );
};

export default FoodManagementScreen;
