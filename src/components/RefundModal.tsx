import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import {
  X,
  Camera as CameraIcon,
  ChevronDown,
  User,
  Check,
  Minus,
  Plus,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { OrderItem } from '@/type';
import { refundApi } from '@/services/apiEndpoints/refundApi';
import { staffApi } from '@/services/apiEndpoints/staffApi';
import Toast from 'react-native-toast-message';
import { Camera, useCameraDevice, PhotoFile } from 'react-native-vision-camera';
import ImageResizer from 'react-native-image-resizer';
interface Staff {
  id: string;
  name: string;
  email: string;
}
interface RefundModalProps {
  isVisible: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  isUnpaid: boolean;
  orderItems: OrderItem[];
  orderTotalAmount: number;
  orderFinalAmount: number;
}
export const RefundModal: React.FC<RefundModalProps> = ({
  isVisible,
  onClose,
  orderId,
  orderCode,
  isUnpaid,
  orderItems,
  orderTotalAmount,
  orderFinalAmount,
}) => {
  const [refundType, setRefundType] = useState<number>(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [staffSearchText, setStaffSearchText] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [selectedRefundItems, setSelectedRefundItems] = useState<
    Record<string, number>
  >({});
  const staffCacheRef = React.useRef<Staff[]>([]);
  const cameraRef = React.useRef<Camera>(null);
  const device = useCameraDevice('back');
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const paymentRatio = orderTotalAmount > 0 ? orderFinalAmount / orderTotalAmount : 1;
  const isDiscounted = paymentRatio < 0.999; 
  React.useEffect(() => {
    if (isVisible && userInfo?.restaurantId) {
      setSelectedStaffId(userInfo.id);
      if (staffCacheRef.current.length > 0) {
        setStaffList(staffCacheRef.current);
      } else {
        fetchStaff();
      }
    }
  }, [isVisible, userInfo]);
  const fetchStaff = async () => {
    try {
      const response = await staffApi.getStaffByRestaurant(
        userInfo!.restaurantId,
      );
      if (response.data.isSuccess) {
        staffCacheRef.current = response.data.data;
        setStaffList(response.data.data);
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
    }
  };
  const filteredStaff = staffList.filter(
    staff =>
      staff.name?.toLowerCase().includes(staffSearchText.toLowerCase()) ||
      staff.email?.toLowerCase().includes(staffSearchText.toLowerCase()),
  );
  const refundTypes = [
    ...(isUnpaid
      ? [{ label: 'Lỗi Hệ thống (System Error)', value: 2 }]
      : [
          { label: 'Lỗi Khách quan (Refund Cash)', value: 0 },
          { label: 'Lỗi Nhân viên (Staff pay)', value: 1 },
        ]),
  ];
  const handleTakePhoto = async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Không có quyền',
        text2:
          'Ứng dụng cần quyền truy cập máy ảnh. Vui lòng cấp phép trong cài đặt.',
      });
      return;
    }
    setShowCamera(true);
  };
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          enableShutterSound: false,
        });
        setCapturedPhoto(photo);
        setShowCamera(false);
      } catch (e) {
        console.error('Take photo error:', e);
      }
    }
  };
  const toggleItemSelection = (itemId: string, availableQty: number) => {
    if (availableQty <= 0) return;
    setSelectedRefundItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemId]) {
        delete newItems[itemId];
      } else {
        newItems[itemId] = 1;
      }
      return newItems;
    });
  };
  const updateItemQty = (itemId: string, delta: number, availableQty: number) => {
    setSelectedRefundItems(prev => {
      const current = prev[itemId] || 0;
      if (current === 0 && delta < 0) return prev;
      const next = Math.min(availableQty, Math.max(1, current + delta));
      return { ...prev, [itemId]: next };
    });
  };
  const handleSubmit = async () => {
    setLoading(true); 
    try {
      if (isUnpaid) {
        const formData = new FormData();
        formData.append('OrderId', orderId.trim());
        formData.append('ResponsibleStaffId', selectedStaffId.trim());
        formData.append('Note', note.trim());
        if (capturedPhoto) {
          const rawPath = capturedPhoto.path.startsWith('file://')
            ? capturedPhoto.path
            : `file://${capturedPhoto.path}`;
          const resizedImage = await ImageResizer.createResizedImage(
            rawPath, 600, 600, 'JPEG', 50, 0, undefined, false,
            { mode: 'contain', onlyScaleDown: true },
          );
          formData.append('ImageFile', {
            uri: resizedImage.uri,
            type: 'image/jpeg',
            name: `refund_${Date.now()}.jpg`,
          } as any);
        }
        const startTime = Date.now();
        const res = await refundApi.confirmSystemPayment(formData);
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã xác nhận thanh toán hệ thống' });
        onClose();
        return;
      }
      const formData = new FormData();
      formData.append('OrderId', orderId.trim());
      formData.append('RefundType', String(refundType));
      formData.append('ResponsibleStaffId', selectedStaffId.trim());
      formData.append('Note', note.trim());
      formData.append('IsFullRefund', String(isFullRefund));
      if (!isFullRefund) {
        const refundItemsArray = Object.entries(selectedRefundItems).map(
          ([id, qty]) => ({
            orderDetailId: parseInt(id),
            quantityToRefund: qty,
          }),
        );
        formData.append('RefundItems', JSON.stringify(refundItemsArray));
      } else {
        formData.append('RefundItems', '[]');
      }
      if (capturedPhoto) {
        const rawPath = capturedPhoto.path.startsWith('file://')
          ? capturedPhoto.path
          : `file://${capturedPhoto.path}`;
        const resizedImage = await ImageResizer.createResizedImage(
          rawPath,
          600,  
          600,  
          'JPEG',
          50,   
          0,
          undefined,
          false,
          { mode: 'contain', onlyScaleDown: true },
        );
        formData.append('ImageFile', {
          uri: resizedImage.uri,
          type: 'image/jpeg',
          name: `refund_${Date.now()}.jpg`,
        } as any);
      }
      const startTime = Date.now();
      const res = await refundApi.createRefund(formData);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tạo yêu cầu hoàn tiền',
      });
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Không thể hoàn tiền. Vui lòng thử lại.';
      Toast.show({
        type: 'error',
        text1: 'Hoàn tiền thất bại',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 h-[70%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              Hoàn tiền đơn hàng
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-gray-500 mb-1">Mã đơn hàng</Text>
              <Text className="text-lg font-semibold text-[#226B5D]">
                ORD-{orderCode}
              </Text>
            </View>
            {}
            {!isUnpaid && isDiscounted && (
              <View className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex-row items-center">
                <View className="bg-blue-100 p-2 rounded-full mr-3">
                  <Text className="text-blue-700 font-bold">%</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-blue-800 font-bold text-sm">
                    Đơn hàng có áp dụng Khuyến mãi
                  </Text>
                  <Text className="text-blue-600 text-xs">
                    Tỉ lệ hoàn trả mỗi món: {(paymentRatio * 100).toFixed(0)}% giá niêm yết.
                  </Text>
                </View>
              </View>
            )}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">
                Nhân viên chịu trách nhiệm
              </Text>
              <TouchableOpacity
                onPress={() => setShowStaffPicker(!showStaffPicker)}
                className="flex-row items-center justify-between bg-gray-100 rounded-xl p-4 border border-gray-200"
              >
                <View className="flex-row items-center">
                  <User size={20} color="#226B5D" />
                  <Text className="ml-2 text-gray-800">
                    {staffList.find(s => s.id === selectedStaffId)?.name ||
                      'Chọn nhân viên...'}
                  </Text>
                </View>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
              {showStaffPicker && (
                <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-64">
                  <View className="p-2 border-b border-gray-100 bg-gray-50">
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-gray-800"
                      placeholder="Tìm tên hoặc email..."
                      value={staffSearchText}
                      onChangeText={setStaffSearchText}
                    />
                  </View>
                  <ScrollView nestedScrollEnabled>
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map(staff => (
                        <TouchableOpacity
                          key={staff.id}
                          onPress={() => {
                            setSelectedStaffId(staff.id);
                            setShowStaffPicker(false);
                            setStaffSearchText('');
                          }}
                          className={`p-4 border-b border-gray-100 ${
                            selectedStaffId === staff.id ? 'bg-[#E8F3F0]' : ''
                          }`}
                        >
                          <Text
                            className={
                              selectedStaffId === staff.id
                                ? 'text-[#226B5D] font-bold'
                                : 'text-gray-700'
                            }
                          >
                            {staff.name}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {staff.email}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="p-4 items-center">
                        <Text className="text-gray-400">
                          Không tìm thấy nhân viên
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-3">
                Loại hoàn tiền
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {refundTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setRefundType(type.value)}
                    className={`px-4 py-2 rounded-full border ${
                      refundType === type.value
                        ? 'bg-[#226B5D] border-[#226B5D]'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`${
                        refundType === type.value
                          ? 'text-white'
                          : 'text-gray-600'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {}
            {!isUnpaid && (
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-3">
                  Phạm vi hoàn tiền
                </Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => setIsFullRefund(true)}
                    className={`flex-1 py-3 border rounded-xl items-center ${
                      isFullRefund
                        ? 'bg-[#E8F3F0] border-[#226B5D]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={
                        isFullRefund
                          ? 'text-[#226B5D] font-bold'
                          : 'text-gray-600'
                      }
                    >
                      Toàn bộ đơn
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsFullRefund(false)}
                    className={`flex-1 py-3 border rounded-xl items-center ${
                      !isFullRefund
                        ? 'bg-[#E8F3F0] border-[#226B5D]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={
                        !isFullRefund
                          ? 'text-[#226B5D] font-bold'
                          : 'text-gray-600'
                      }
                    >
                      Một phần đơn
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {}
            {!isFullRefund && !isUnpaid && (
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">
                  Chọn món hoàn tiền
                </Text>
                <View className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                  {orderItems.map(item => {
                    const isSelected = !!selectedRefundItems[item.id];
                    const refundedQty = item.refundedQuantity || 0;
                    const availableQty = item.quantity - refundedQty;
                    const isFullyRefunded = availableQty <= 0;
                    return (
                      <View
                        key={item.id}
                        className={`p-3 border-b border-gray-100 last:border-0 ${
                          isFullyRefunded ? 'bg-gray-50 opacity-60' : ''
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <TouchableOpacity
                            onPress={() =>
                              toggleItemSelection(item.id, availableQty)
                            }
                            disabled={isFullyRefunded}
                            className="flex-row items-center flex-1"
                          >
                            <View
                              className={`w-6 h-6 rounded border items-center justify-center mr-3 ${
                                isSelected
                                  ? 'bg-[#226B5D] border-[#226B5D]'
                                  : isFullyRefunded
                                  ? 'bg-gray-200 border-gray-300'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              {isSelected && <Check size={16} color="white" />}
                            </View>
                            <View className="flex-1">
                              <Text className={`font-medium ${isFullyRefunded ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {item.name} {isFullyRefunded && '(Đã hoàn hết)'}
                              </Text>
                              <View className="flex-row items-center">
                                <Text className={`text-xs ${isDiscounted || (item.originalPrice && item.originalPrice > item.price) ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                  {(item.originalPrice ?? 0).toLocaleString()}đ
                                </Text>
                                {(isDiscounted || (item.originalPrice && item.originalPrice > item.price)) && (
                                  <Text className="text-xs text-red-600 font-bold ml-2">
                                    → {(Math.round((item.price ?? 0) * paymentRatio)).toLocaleString()}đ
                                  </Text>
                                )}
                                <Text className={`text-xs ml-2 ${isFullyRefunded ? 'text-gray-400' : 'text-gray-500 font-bold'}`}>
                                  x {availableQty} {refundedQty > 0 && `(Gốc ${item.quantity})`}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                          {isSelected && (
                            <View className="flex-row items-center bg-white border border-gray-200 rounded-lg">
                              <TouchableOpacity
                                onPress={() =>
                                  updateItemQty(item.id, -1, availableQty)
                                }
                                className="p-2"
                              >
                                <Minus size={16} color="#226B5D" />
                              </TouchableOpacity>
                              <View className="px-2 min-w-[30px] items-center">
                                <Text className="font-bold text-[#226B5D]">
                                  {selectedRefundItems[item.id]}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() =>
                                  updateItemQty(item.id, 1, availableQty)
                                }
                                className="p-2"
                              >
                                <Plus size={16} color="#226B5D" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Ghi chú</Text>
              <TextInput
                className="bg-gray-100 rounded-xl p-4 text-gray-800 h-32"
                placeholder="Nhập lý do hoàn tiền..."
                multiline
                textAlignVertical="top"
                value={note}
                onChangeText={setNote}
              />
            </View>
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">
                Ảnh bằng chứng
              </Text>
              {capturedPhoto ? (
                <View className="relative">
                  <Image
                    source={{ uri: 'file://' + capturedPhoto.path }}
                    className="w-full h-48 rounded-xl bg-gray-100"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setCapturedPhoto(null)}
                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50"
                >
                  <CameraIcon size={32} color="#999" />
                  <Text className="text-gray-400 mt-2">
                    Chụp ảnh bằng chứng
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {}
            {!isUnpaid && !isFullRefund && Object.keys(selectedRefundItems).length > 0 && (
              <View className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-500">Tổng giá niêm yết:</Text>
                  <Text className="text-gray-700">
                    {Object.entries(selectedRefundItems).reduce((acc, [id, qty]) => {
                      const item = orderItems.find(i => i.id === id);
                      return acc + (item?.originalPrice ?? 0) * qty;
                    }, 0).toLocaleString()}đ
                  </Text>
                </View>
                {isDiscounted && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-red-500 text-xs italic">Khấu trừ khuyến mãi đơn hàng:</Text>
                    <Text className="text-red-500 text-xs italic">
                      -{(Object.entries(selectedRefundItems).reduce((acc, [id, qty]) => {
                        const item = orderItems.find(i => i.id === id);
                        const gross = (item?.originalPrice ?? 0) * qty;
                        const net = Math.round((item?.price ?? 0) * qty * paymentRatio);
                        return acc + (gross - net);
                      }, 0)).toLocaleString()}đ
                    </Text>
                  </View>
                )}
                <View className="border-t border-gray-100 my-2" />
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-gray-800">DỰ KIẾN THỰC HOÀN:</Text>
                  <Text className="text-[#226B5D] font-bold text-lg">
                    {Object.entries(selectedRefundItems).reduce((acc, [id, qty]) => {
                      const item = orderItems.find(i => i.id === id);
                      return acc + Math.round((item?.price ?? 0) * qty * paymentRatio);
                    }, 0).toLocaleString()}đ
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`py-4 rounded-xl items-center ${
                loading ? 'bg-gray-400' : 'bg-[#226B5D]'
              }`}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? 'Đang nén & Gửi...' : 'Xác nhận hoàn tiền'}
              </Text>
            </TouchableOpacity>
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
      {showCamera && device && (
        <View className="absolute inset-0 bg-black z-[100]">
          <Camera
            ref={cameraRef}
            style={{ flex: 1 }}
            device={device}
            isActive={true}
            photo={true}
          />
          <View className="absolute bottom-10 inset-x-0 flex-row justify-around items-center">
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              className="bg-white/20 p-4 rounded-full"
            >
              <X size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-300"
            />
            <View className="w-14" />
          </View>
        </View>
      )}
    </Modal>
  );
};
