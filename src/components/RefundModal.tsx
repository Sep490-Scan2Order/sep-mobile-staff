import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Camera as CameraIcon, ChevronDown, User } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { refundApi } from '../services/apiEndpoints/refundApi';
import { staffApi } from '../services/apiEndpoints/staffApi';
import Toast from 'react-native-toast-message';

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
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isVisible,
  onClose,
  orderId,
  orderCode,
}) => {
  const [refundType, setRefundType] = useState<number>(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [staffSearchText, setStaffSearchText] = useState('');
  
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  React.useEffect(() => {
    if (isVisible && userInfo?.restaurantId) {
      fetchStaff();
      setSelectedStaffId(userInfo.id);
    }
  }, [isVisible, userInfo]);

  const fetchStaff = async () => {
    try {
      const response = await staffApi.getStaffByRestaurant(userInfo!.restaurantId);
      if (response.data.isSuccess) {
        setStaffList(response.data.data);
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
    }
  };

  const filteredStaff = staffList.filter(staff =>
    staff.name?.toLowerCase().includes(staffSearchText.toLowerCase()) ||
    staff.email?.toLowerCase().includes(staffSearchText.toLowerCase())
  );

  const refundTypes = [
    { label: 'Lỗi Khách quan (Refund Cash)', value: 0 },
    { label: 'Lỗi Nhân viên (Staff pay)', value: 1 },
    { label: 'Lỗi Hệ thống (System Error)', value: 2 },
  ];

  const handleSubmit = async () => {
    if (!note.trim()) {
      Alert.alert('Vui lòng nhập ghi chú');
      return;
    }

    setLoading(true);
    try {
      if (refundType === 2) {
         // System error requires confirmSystemPayment logic
         // For now, we'll just alert that photo is needed if we don't have a picker
         Alert.alert('Tính năng hoàn tiền hệ thống cần đính kèm ảnh bằng chứng (đang phát triển)');
         setLoading(false);
         return;
      }

      await refundApi.createRefund({
        orderId,
        refundType,
        responsibleStaffId: selectedStaffId,
        note,
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã gửi yêu cầu hoàn tiền cho đơn ORD-${orderCode}`,
      });
      onClose();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: error.response?.data?.message || 'Có lỗi xảy ra',
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
            <Text className="text-xl font-bold text-gray-800">Hoàn tiền đơn hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-gray-500 mb-1">Mã đơn hàng</Text>
              <Text className="text-lg font-semibold text-[#226B5D]">ORD-{orderCode}</Text>
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Nhân viên chịu trách nhiệm</Text>
              <TouchableOpacity
                onPress={() => setShowStaffPicker(!showStaffPicker)}
                className="flex-row items-center justify-between bg-gray-100 rounded-xl p-4 border border-gray-200"
              >
                <View className="flex-row items-center">
                  <User size={20} color="#226B5D" />
                  <Text className="ml-2 text-gray-800">
                    {staffList.find(s => s.id === selectedStaffId)?.name || 'Chọn nhân viên...'}
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
                      filteredStaff.map((staff) => (
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
                          <Text className={selectedStaffId === staff.id ? 'text-[#226B5D] font-bold' : 'text-gray-700'}>
                            {staff.name}
                          </Text>
                          <Text className="text-xs text-gray-400">{staff.email}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="p-4 items-center">
                        <Text className="text-gray-400">Không tìm thấy nhân viên</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-3">Loại hoàn tiền</Text>
              <View className="flex-row flex-wrap gap-2">
                {refundTypes.map((type) => (
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
                        refundType === type.value ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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

            {refundType === 2 && (
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Ảnh bằng chứng (System Refund)</Text>
                <TouchableOpacity className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50">
                  <CameraIcon size={32} color="#999" />
                  <Text className="text-gray-400 mt-2">Chụp ảnh thanh toán lỗi</Text>
                </TouchableOpacity>
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
                {loading ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
              </Text>
            </TouchableOpacity>
            
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
