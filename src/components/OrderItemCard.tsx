import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Phone, MoreVertical, RotateCcw } from 'lucide-react-native';
import { Order } from '@/type';

interface Props {
  item: Order;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onViewDetail: (id: string) => void;
  onRefund: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
  onOpenPickup: (order: Order) => void;
}

export const OrderItemCard: React.FC<Props> = ({
  item,
  activeMenuId,
  setActiveMenuId,
  onViewDetail,
  onRefund,
  onUpdateStatus,
  onOpenPickup,
}) => {
  const isPreOrder = item.isPreOrder === true;

  // 👇 NEW: check unpaid
  const isUnpaid = item.status === 0;

  const needsPickupConfirm =
    isPreOrder && item.status === 1 && !item.confirmedPickupAt;

  /**
   * FORMAT
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} - ${date.toLocaleTimeString(
      [],
      { hour: '2-digit', minute: '2-digit' },
    )}`;
  };

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * STATUS LABEL
   */
  const ORDER_STATUS_LABEL: Record<number, string> = {
    0: 'Thanh toán',
    1: 'Đã nhận',
    2: 'Đang làm',
    3: 'Đang giao',
    4: 'Đã giao',
    5: 'Đã hủy',
  };

  /**
   * ACTION LABEL
   */
  const ACTION_LABEL: Record<number, string> = {
    1: 'Nhận đơn',
    2: 'Làm xong',
    3: 'Giao hàng',
  };

  // 👇 NEW: logic hiển thị refund
  const isRefund = item.typeOrder === 1;
  const canRefund = !isRefund && (isUnpaid || [1, 2, 3].includes(item.status));

  const REFUND_TYPE_LABEL: Record<number, string> = {
    0: 'Khách quan / Đổi món',
    1: 'Lỗi nhân viên',
    2: 'Lỗi hệ thống',
  };

  const mainColor = isRefund ? '#dc2626' : '#226B5D';
  const bgColor = isRefund ? 'bg-red-50' : 'bg-gray-100';
  const borderColor = isRefund ? 'border-red-500' : 'border-[#226B5D]';

  return (
    <View className={`${bgColor} rounded-xl border-2 ${borderColor} overflow-hidden mb-6`}>
      {/* PREORDER */}
      {isPreOrder && !isRefund && (
        <View className={`flex-row items-center px-4 py-1.5 ${isRefund ? 'bg-red-100' : 'bg-[#E8F3F0]'} border-b ${borderColor}`}>
          <Text className={`text-xs font-bold ${isRefund ? 'text-red-700' : 'text-[#226B5D]'}`}>PRE-ORDER</Text>

          {item.requestedPickupAt && (
            <Text className={`ml-2 text-xs ${isRefund ? 'text-red-700' : 'text-[#226B5D]'}`}>
              · Nhận lúc: {formatTime(item.requestedPickupAt)}
            </Text>
          )}

          {item.confirmedPickupAt && (
            <Text className="ml-2 text-xs text-green-700 font-semibold">
              Đã xác nhận: {formatTime(item.confirmedPickupAt)}
            </Text>
          )}
        </View>
      )}

      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 border-b border-dashed border-gray-400">
        {isRefund ? (
          <RotateCcw size={20} color="#dc2626" />
        ) : (
          <Phone size={20} color="#226B5D" />
        )}

        <Text className={`flex-1 ml-3 text-base font-bold ${isRefund ? 'text-red-600' : 'text-gray-700'}`}>
          {isRefund ? 'ĐƠN HOÀN TIỀN' : (item.phone || 'Không có SĐT')}
        </Text>

        <View className="relative">
          <TouchableOpacity
            onPress={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
          >
            <MoreVertical size={18} color={mainColor} />
          </TouchableOpacity>

          {activeMenuId === item.id && (
            <View className="absolute right-0 top-8 bg-white border rounded-lg shadow-xl z-50 w-40 py-1">
              {/* VIEW DETAIL */}
              <TouchableOpacity
                className="px-4 py-2 border-b"
                onPress={() => {
                  setActiveMenuId(null);
                  onViewDetail(item.id);
                }}
              >
                <Text>Chi tiết</Text>
              </TouchableOpacity>

              {/* REFUND */}
              {canRefund && (
                <TouchableOpacity
                  className="px-4 py-2"
                  onPress={() => {
                    setActiveMenuId(null);
                    onRefund(item);
                  }}
                >
                  <Text className="text-red-500">
                    {isUnpaid ? 'Xác nhận thanh toán' : 'Hoàn tiền'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* BODY */}
      <View className="flex-row">
        <View className="flex-1 px-3 py-4 border-r">
          <Text className={`text-lg font-semibold ${isRefund ? 'text-red-700' : 'text-black'}`}>ORD-{item.orderCode}</Text>
          {isRefund && (
            <View className="mt-2 bg-red-200 self-start px-2 py-1 rounded">
              <Text className="text-red-800 text-[10px] font-bold">
                LÝ DO: {REFUND_TYPE_LABEL[item.refundType ?? 0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 px-3 py-4">
          <View className="flex-row items-center mb-3">
            <Calendar size={16} color="#777" />
            <Text className="ml-2 text-sm text-gray-600">
              {formatDate(item.createdAt)}
            </Text>
          </View>

          <Text className="text-sm text-gray-600">
            {item.amount.toLocaleString()} đ
          </Text>

          {/* STATUS */}
          <Text className="mt-2 text-xs text-gray-500">
            {ORDER_STATUS_LABEL[item.status]}
          </Text>

          {/* 👇 NEW: hiển thị payment status */}
          <Text
            className={`mt-1 text-xs font-semibold ${
              isUnpaid ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {isUnpaid ? 'Chưa thanh toán' : 'Đã thanh toán'}
          </Text>
        </View>
      </View>

      {/* PICKUP */}
      {needsPickupConfirm && (
        <TouchableOpacity
          className="py-3 items-center border-t bg-[#E8F3F0]"
          onPress={() => onOpenPickup(item)}
        >
          <Text className="text-[#226B5D] font-semibold">
            Xác nhận giờ nhận hàng
          </Text>
        </TouchableOpacity>
      )}

      {/* ACTION */}
      {!isRefund && [0, 1, 2, 3].includes(item.status) && (
        <TouchableOpacity
          className="py-4 items-center border-t border-dashed"
          onPress={() => onUpdateStatus(item)}
        >
          <Text className="text-[#226B5D] font-semibold">
            {ACTION_LABEL[item.status]}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
