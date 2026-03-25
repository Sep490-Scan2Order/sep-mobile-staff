import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Calendar, Phone, MoreVertical, Search, X } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  updateOrderStatus,
  confirmPickupTime,
} from '../store/slices/orderSlice';
import { Order } from '../type';
import { playNotificationSound } from '../utils/notificationSound';
import { RefundModal } from './RefundModal';
import { isToday } from '../utils/dateUtils';
import { TimePickerModal } from './TimePickerModal';
import { OrderItemCard } from './OrderItemCard';

interface SDKTableProps {
  statusFilter: number;
}

type RootStackParamList = {
  DetailOrderScreen: { orderId: string };
  ScanDeliveryScreen: undefined;
};

export const SDKTable: React.FC<SDKTableProps> = ({ statusFilter }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  const orders = useSelector((state: RootState) => state.order.orders);

  const [searchText, setSearchText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Pre-order type filter: 'all' | 'preorder' | 'dinein'
  const [orderTypeFilter, setOrderTypeFilter] = useState<
    'all' | 'preorder' | 'dinein'
  >('all');

  // Confirm pickup modal
  const [showConfirmPickupModal, setShowConfirmPickupModal] = useState(false);
  const [pickupOrderId, setPickupOrderId] = useState<string | null>(null);
  const [confirmingPickup, setConfirmingPickup] = useState(false);

  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const initNow = new Date();
  const [selectedHour, setSelectedHour] = useState<number>(initNow.getHours());
  const [selectedMinute, setSelectedMinute] = useState<number>(
    Math.floor(initNow.getMinutes() / 5) * 5,
  );

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);

  const scrollToHour = useCallback((h: number) => {
    hourListRef.current?.scrollToIndex({ index: h, animated: true });
  }, []);

  const scrollToMinute = useCallback((mIdx: number) => {
    minuteListRef.current?.scrollToIndex({ index: mIdx, animated: true });
  }, []);
  const getNextStatus = (status: number) => {
    switch (status) {
      case 1:
        return 2;
      case 2:
        return 3;
      case 3:
        return 4;
      default:
        return status;
    }
  };
  /**
   * FILTER ORDERS
   */
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => isToday(order.createdAt))
      .filter(order =>
        statusFilter === -1 ? true : order.status === statusFilter,
      )
      .filter(order => {
        if (orderTypeFilter === 'preorder') return order.isPreOrder === true;
        if (orderTypeFilter === 'dinein') return order.isPreOrder !== true;
        return true;
      })
      .filter(order => {
        if (!searchText.trim()) return true;

        const keyword = searchText.toLowerCase();
        const orderCodeFull = `ord-${order.orderCode}`;

        return (
          order.phone?.toLowerCase().includes(keyword) ||
          order.orderCode?.toString().includes(keyword) ||
          orderCodeFull.includes(keyword) ||
          order.items?.some(item => item.name?.toLowerCase().includes(keyword))
        );
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [orders, statusFilter, searchText, orderTypeFilter]);

  /**
   * HANDLE STATUS CHANGE
   */
  const handleUpdateStatus = async (order: Order) => {
    const newStatus = getNextStatus(order.status);

    // Nếu là bước giao hàng -> mở camera
    if (newStatus === 4) {
      navigation.navigate('ScanDeliveryScreen');
      return;
    }

    const result = await dispatch(
      updateOrderStatus({
        orderId: order.id,
        newStatus,
      }),
    );

    if (updateOrderStatus.rejected.match(result)) {
      // Show backend validation error (e.g. pre-order pending, not confirmed by cashier)
      const errorMsg =
        (result.payload as string) || 'Cập nhật trạng thái thất bại';
      Alert.alert('Không thể cập nhật', errorMsg, [{ text: 'OK' }]);
      return;
    }

    try {
      if (newStatus === 2 || newStatus === 3) {
        playNotificationSound();
      }
    } catch (err) {
      console.log('Voice error:', err);
    }
  };

  /**
   * HANDLE CONFIRM PICKUP TIME
   */
  const handleConfirmPickup = async () => {
    if (!pickupOrderId) return;

    const pickedDate = new Date();
    pickedDate.setHours(selectedHour, selectedMinute, 0, 0);

    if (pickedDate.getTime() < Date.now()) {
      Alert.alert('Lỗi', 'Không thể chọn thời gian trong quá khứ');
      return;
    }

    const confirmedAt = pickedDate.toISOString();

    console.log('SEND:', confirmedAt);

    const result = await dispatch(
      confirmPickupTime({
        orderId: pickupOrderId,
        confirmedPickupAt: confirmedAt,
      }),
    );

    setConfirmingPickup(false);
    setShowConfirmPickupModal(false);
    setPickupOrderId(null);

    if (confirmPickupTime.rejected.match(result)) {
      const errorMsg =
        (result.payload as string) || 'Xác nhận giờ nhận hàng thất bại';
      Alert.alert('Lỗi', errorMsg, [{ text: 'OK' }]);
    } else {
      Alert.alert(
        'Thành công',
        'Đã xác nhận giờ nhận hàng cho đơn pre-order.',
        [{ text: 'OK' }],
      );
    }
  };

  /**
   * RENDER ITEM
   */
  const renderItem = ({ item }: { item: Order }) => {
    return (
      <OrderItemCard
        item={item}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        onViewDetail={id =>
          navigation.navigate('DetailOrderScreen', { orderId: id })
        }
        onRefund={order => {
          setSelectedOrder(order);
          setShowRefundModal(true);
        }}
        onUpdateStatus={handleUpdateStatus}
        onOpenPickup={order => {
          const t = new Date();
          const h = t.getHours();
          const mIdx = Math.max(
            0,
            MINUTES.indexOf(Math.floor(t.getMinutes() / 5) * 5),
          );

          setSelectedHour(h);
          setSelectedMinute(MINUTES[mIdx === -1 ? 0 : mIdx]);
          setPickupOrderId(order.id);
          setShowConfirmPickupModal(true);

          setTimeout(() => {
            scrollToHour(h);
            scrollToMinute(mIdx === -1 ? 0 : mIdx);
          }, 120);
        }}
      />
    );
  };

  return (
    <View className="flex-1">
      {/* SEARCH */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-[#E8F3F0] border border-[#226B5D] rounded-xl px-3 py-2">
          <Search size={18} color="#226B5D" />

          <TextInput
            placeholder="Tìm món ăn / SĐT / mã đơn..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-2 text-gray-700"
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={18} color="#226B5D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ORDER TYPE FILTER */}
      <View className="flex-row px-4 pt-3 gap-2">
        <TouchableOpacity
          onPress={() => setOrderTypeFilter('all')}
          className={`flex-row items-center px-3 py-1.5 rounded-full border ${
            orderTypeFilter === 'all'
              ? 'bg-[#226B5D] border-[#226B5D]'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              orderTypeFilter === 'all' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setOrderTypeFilter('preorder')}
          className={`px-3 py-1.5 rounded-full border ${
            orderTypeFilter === 'preorder'
              ? 'bg-[#226B5D] border-[#226B5D]'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              orderTypeFilter === 'preorder' ? 'text-white' : 'text-[#226B5D]'
            }`}
          >
            Pre-order
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setOrderTypeFilter('dinein')}
          className={`px-3 py-1.5 rounded-full border ${
            orderTypeFilter === 'dinein'
              ? 'bg-[#226B5D] border-[#226B5D]'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              orderTypeFilter === 'dinein' ? 'text-white' : 'text-[#226B5D]'
            }`}
          >
            Tại quán
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400 text-base">
              Không tìm thấy kết quả
            </Text>
          </View>
        }
      />

      {/* REFUND MODAL */}
      {selectedOrder && (
        <RefundModal
          isVisible={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          orderCode={selectedOrder.orderCode.toString()}
        />
      )}

      <TimePickerModal
        visible={showConfirmPickupModal}
        onClose={() => {
          if (!confirmingPickup) {
            setShowConfirmPickupModal(false);
            setPickupOrderId(null);
          }
        }}
        onConfirm={handleConfirmPickup}
        confirming={confirmingPickup}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        setSelectedHour={setSelectedHour}
        setSelectedMinute={setSelectedMinute}
      />
    </View>
  );
};
