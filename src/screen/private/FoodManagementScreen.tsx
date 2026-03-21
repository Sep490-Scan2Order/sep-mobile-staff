import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDishesByRestaurant } from '../../store/slices/dishSlice';

import { Header } from '../../components/Header';
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
    <View className="flex-1 bg-teal-700">
      <StatusBar barStyle="light-content" backgroundColor="#134e4a" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />

        <View className="flex-1 bg-white pb-5">
          {!restaurantId ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-red-500 text-center px-5">
                ❌ Không tìm thấy thông tin nhà hàng. Vui lòng đăng nhập lại.
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row px-5 -mb-5 mt-4">
                <StatCard number={total} label="Tất cả" />
                <StatCard number={selling} label="Đang bán" />
                <StatCard number={stopped} label="Đã bán hết" />
              </View>

              <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

              {loading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#0d9488" />
                  <Text className="mt-3 text-gray-500">
                    Đang tải dữ liệu...
                  </Text>
                </View>
              ) : error ? (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-red-500 text-center px-5">
                    ❌ Lỗi: {error}
                  </Text>
                </View>
              ) : dishes.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-gray-400 text-center">
                    Không có món ăn nào
                  </Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredDishes.map(item => (
                    <FoodItemCard
                      key={item.id}
                      name={item.dishName}
                      price={`${item.price.toLocaleString()} VND`}
                      image={item.dishImageUrl}
                      active={!item.isSoldOut}
                      id={item.id}
                      originalPrice={item.price}
                      discountedPrice={item.discountedPrice}
                      promotionName={item.promotionName}
                      hasPromotion={item.hasPromotion}
                    />
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default FoodManagementScreen;
