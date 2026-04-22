import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Search, X } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  updateOrderStatus,
  confirmPickupTime,
  confirmCashOrder,
  forceRefresh,
} from '@/store/slices/orderSlice';
import { useAppModal } from '@/hooks/useAppModal';
import { AppModal } from '@/components/AppModal';
import { Order } from '@/type';
import { playNotificationSound } from '@/utils/notificationSound';
import RefundModal from '@/components/RefundModal';
import { isToday } from '@/utils/dateUtils';
import { TimePickerModal } from '@/components/TimePickerModal';
import { OrderItemCard } from '@/components/OrderItemCard';
import { PaymentDetailModal } from '@/components/PaymentDetailModal';
import { orderService } from '@/services/logicServices/orderService';
import { playAudioUrl } from '@/services/logicServices/playAudioUrl';

interface SDKTableProps {
  statusFilter: number;
}

type RootStackParamList = {
  DetailOrderScreen: { orderId: string };
  ScanDeliveryScreen: { orderNumber: number };
};

export const SDKTable: React.FC<SDKTableProps> = ({ statusFilter }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const snackbar = useSnackbar();
  const modal = useAppModal();
  const orders = useSelector((state: RootState) => state.order.orders);
  const [searchText, setSearchText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState<
    'all' | 'preorder' | 'dinein'
  >('all');
  const [showConfirmPickupModal, setShowConfirmPickupModal] = useState(false);
  const [pickupOrderId, setPickupOrderId] = useState<string | null>(null);
  const [confirmingPickup, setConfirmingPickup] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<Order | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const initNow = new Date();
  const [selectedHour, setSelectedHour] = useState(initNow.getHours());
  const [selectedMinute, setSelectedMinute] = useState(
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

  const filteredOrders = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return orders
      .filter(order => {
        // 1. Date filter
        if (!isToday(order.createdAt)) return false;

        // 2. Status & Refund Filter
        if (statusFilter === 5) {
          // Refund tab
          if (order.typeOrder !== 1) return false;
        } else {
          // Regular tabs
          if (order.typeOrder === 1) return false;
          if (statusFilter !== -1 && order.status !== statusFilter) return false;
        }

        // 3. Type Filter
        if (orderTypeFilter === 'preorder' && order.isPreOrder !== true)
          return false;
        if (orderTypeFilter === 'dinein' && order.isPreOrder === true)
          return false;

        // 4. Search Filter
        if (keyword) {
          const orderCodeFull = `ord-${order.orderCode}`.toLowerCase();
          const matchPhone = order.phone?.toLowerCase().includes(keyword);
          const matchCode = order.orderCode?.toString().includes(keyword);
          const matchFullCode = orderCodeFull.includes(keyword);
          const matchItems = order.items?.some(item =>
            item.name?.toLowerCase().includes(keyword),
          );

          if (!matchPhone && !matchCode && !matchFullCode && !matchItems)
            return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, statusFilter, searchText, orderTypeFilter]);

  const handleUpdateStatus = useCallback(async (order: Order) => {
    if (order.status === 0) {
      if (order.type === 'Cash') {
        setSelectedOrderForPayment(order);
        setShowPaymentModal(true);
      }
      return;
    }

    const newStatus = getNextStatus(order.status);
    try {
      if (order.status === 2) {
        const audio = await orderService.readyForPickup(order.orderCode);
        await playAudioUrl(audio.audioUrl);
        await dispatch(
          updateOrderStatus({
            orderId: order.id,
            newStatus: 3,
          }),
        );
        playNotificationSound();
        return;
      }
      if (newStatus === 4) {
        navigation.navigate('ScanDeliveryScreen', {
          orderNumber: order.orderCode,
        });
        return;
      }
      const result = await dispatch(
        updateOrderStatus({
          orderId: order.id,
          newStatus,
        }),
      );
      if (updateOrderStatus.rejected.match(result)) {
        const errorMsg =
          (result.payload as string) || 'Cập nhật trạng thái thất bại';
        snackbar.showError(errorMsg);
        return;
      }
      if (newStatus === 2) {
        playNotificationSound();
      }
    } catch (err) {
      snackbar.showError('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  }, [dispatch, navigation, snackbar]);

  const handleConfirmPayment = useCallback(async (orderId: string) => {
    try {
      setConfirmingPayment(true);
      await dispatch(confirmCashOrder(orderId)).unwrap();
      dispatch(forceRefresh());
      snackbar.showSuccess('Xác nhận thanh toán thành công');
      setShowPaymentModal(false);
      setSelectedOrderForPayment(null);
    } catch (error: any) {
      snackbar.showError(error?.message || 'Thanh toán thất bại');
    } finally {
      setConfirmingPayment(false);
    }
  }, [dispatch, snackbar]);

  const handleConfirmPickup = useCallback(async () => {
    if (!pickupOrderId) return;
    const pickedDate = new Date();
    pickedDate.setHours(selectedHour, selectedMinute, 0, 0);
    if (pickedDate.getTime() < Date.now()) {
      snackbar.showWarning('Không thể chọn thời gian trong quá khứ');
      return;
    }
    const confirmedAt = pickedDate.toISOString();
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
      snackbar.showError(errorMsg);
    } else {
      snackbar.showSuccess('Đã xác nhận giờ nhận hàng thành công');
    }
  }, [dispatch, pickupOrderId, selectedHour, selectedMinute, snackbar]);

  const renderItem = useCallback(({ item }: { item: Order }) => (
    <OrderItemCard
      item={item}
      isActive={activeMenuId === item.id}
      onToggleMenu={setActiveMenuId}
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
  ), [activeMenuId, handleUpdateStatus, navigation, scrollToHour, scrollToMinute]);

  return (
    <View className="flex-1" style={{ position: 'relative' }}>
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-[#E8F3F0] border border-[#226B5D] rounded-xl px-3 py-2">
          <Search size={18} color="#226B5D" />
          <TextInput
            placeholder="SĐT / mã đơn..."
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

      <View className="flex-row px-4 pt-3 gap-2">
        {['all', 'preorder', 'dinein'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setOrderTypeFilter(type as any)}
            className={`px-3 py-1.5 rounded-full border ${
              orderTypeFilter === type
                ? 'bg-[#226B5D] border-[#226B5D]'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                orderTypeFilter === type ? 'text-white' : 'text-gray-600'
              }`}
            >
              {type === 'all'
                ? 'Tất cả'
                : type === 'preorder'
                ? 'Pre-order'
                : 'Tại quán'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400">Không tìm thấy kết quả</Text>
          </View>
        }
        initialNumToRender={7}
        maxToRenderPerBatch={15}
        windowSize={11}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />

      {selectedOrder && (
        <RefundModal
          isVisible={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
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

      <PaymentDetailModal
        visible={showPaymentModal}
        order={selectedOrderForPayment}
        onClose={() => {
          if (!confirmingPayment) {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }
        }}
        onConfirm={handleConfirmPayment}
        loading={confirmingPayment}
      />

      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      <AppModal {...modal.modalConfig} onDismiss={modal.hideModal} />
    </View>
  );
};
