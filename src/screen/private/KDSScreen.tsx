import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SDKTable } from '@/components/KDSTable';

import {
  fetchActiveOrders,
  clearUnreadByStatus,
} from '@/store/slices/orderSlice';

import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

const KDSScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );

  const [activeSidebarIndex, setActiveSidebarIndex] = useState(-1);

  useEffect(() => {
    if (!restaurantId) return;

    dispatch(fetchActiveOrders(restaurantId));
  }, [restaurantId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (!restaurantId) return;

      console.log('🔄 Refetch orders khi focus');
      dispatch(fetchActiveOrders(restaurantId));
    }, [restaurantId, dispatch]),
  );

  const handleSidebarPress = useCallback(
    (status: number) => {
      setActiveSidebarIndex(status);
      dispatch(clearUnreadByStatus(status));
    },
    [dispatch],
  );

  return (
    <View className="flex-1 bg-teal-700">
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />

        <View className="flex-1 flex-row bg-white">
          <Sidebar
            activeIndex={activeSidebarIndex}
            onItemPress={handleSidebarPress}
          />

          <View className="flex-1">
            <SDKTable statusFilter={activeSidebarIndex} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default KDSScreen;
