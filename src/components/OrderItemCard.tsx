import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Phone, MoreVertical } from 'lucide-react-native';
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
   * STATUS LABEL (hiển thị text)
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
   * ACTION LABEL (text nút)
   */
  const ACTION_LABEL: Record<number, string> = {
    1: 'Nhận đơn',
    2: 'Làm xong',
    3: 'Giao hàng',
  };
  // /**
  //  * SHOW ACTION BUTTON?
  //  */
  // const showActionButton = [1, 2, 3].includes(item.status);

  // /**
  //  * BUTTON COLOR (optional UX upgrade)
  //  */
  // const getButtonColor = () => {
  //   switch (item.status) {
  //     case 1:
  //       return 'bg-blue-500';
  //     case 2:
  //       return 'bg-orange-500';
  //     case 3:
  //       return 'bg-green-600';
  //     default:
  //       return 'bg-gray-400';
  //   }
  // };

  return (
    <View className="bg-gray-100 rounded-xl border-2 border-[#226B5D] overflow-hidden mb-6">
      {/* PREORDER */}
      {isPreOrder && (
        <View className="flex-row items-center px-4 py-1.5 bg-[#E8F3F0] border-b border-[#226B5D]">
          <Text className="text-xs font-bold text-[#226B5D]">PRE-ORDER</Text>

          {item.requestedPickupAt && (
            <Text className="ml-2 text-xs text-[#226B5D]">
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
        <Phone size={20} color="#226B5D" />

        <Text className="flex-1 ml-3 text-base text-gray-700">
          {item.phone || 'Không có SĐT'}
        </Text>

        <View className="relative">
          <TouchableOpacity
            onPress={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
          >
            <MoreVertical size={18} color="#226B5D" />
          </TouchableOpacity>

          {activeMenuId === item.id && (
            <View className="absolute right-0 top-8 bg-white border rounded-lg shadow-xl z-50 w-32 py-1">
              <TouchableOpacity
                className="px-4 py-2 border-b"
                onPress={() => {
                  setActiveMenuId(null);
                  onViewDetail(item.id);
                }}
              >
                <Text>Chi tiết</Text>
              </TouchableOpacity>

              {[1, 2, 3].includes(item.status) && (
                <TouchableOpacity
                  className="px-4 py-2"
                  onPress={() => {
                    setActiveMenuId(null);
                    onRefund(item);
                  }}
                >
                  <Text className="text-red-500">Hoàn tiền</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* BODY */}
      <View className="flex-row">
        <View className="flex-1 px-3 py-4 border-r">
          <Text className="text-lg font-semibold">ORD-{item.orderCode}</Text>
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

          {/* STATUS TEXT */}
          <Text className="mt-2 text-xs text-gray-500">
            {ORDER_STATUS_LABEL[item.status]}
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

      {/* ACTION BUTTON */}
      {[1, 2, 3].includes(item.status) && (
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
