import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  X,
  Camera as CameraIcon,
  ChevronDown,
  User,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { refundApi } from '@/services/apiEndpoints/refundApi';
import { staffApi } from '@/services/apiEndpoints/staffApi';
import Toast from 'react-native-toast-message';
import { Camera, useCameraDevice, PhotoFile } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
// 👇 Import thư viện nén ảnh
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
  paymentStatus: number;
  isUnpaid: boolean;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isVisible,
  onClose,
  orderId,
  orderCode,
  isUnpaid,
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
  const cameraRef = React.useRef<Camera>(null);
  const device = useCameraDevice('back');

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  React.useEffect(() => {
    if (isVisible && userInfo?.restaurantId) {
      fetchStaff();
      setSelectedStaffId(userInfo.id);
    }
  }, [isVisible, userInfo]);

  const fetchStaff = async () => {
    try {
      const response = await staffApi.getStaffByRestaurant(
        userInfo!.restaurantId,
      );
      if (response.data.isSuccess) {
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
  console.log('🔍 Refund types:', isUnpaid);
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
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập máy ảnh');
      return;
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'speed',
          enableShutterSound: false,
          quality: 50,
        });
        setCapturedPhoto(photo);
        setShowCamera(false);
      } catch (e) {
        console.error('Take photo error:', e);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Bật loading ngay từ đầu để chặn spam click
    try {
      const formData = new FormData();
      formData.append('OrderId', orderId.trim());
      formData.append('RefundType', String(refundType));
      formData.append('ResponsibleStaffId', selectedStaffId.trim());
      formData.append('Note', note.trim());

      if (capturedPhoto) {
        // Đảm bảo đường dẫn luôn có scheme file:// cho Android
        const rawPath = capturedPhoto.path.startsWith('file://')
          ? capturedPhoto.path
          : `file://${capturedPhoto.path}`;

        console.log('🔄 Đang nén ảnh...');

        // 👇 THỰC HIỆN NÉN ẢNH
        const resizedImage = await ImageResizer.createResizedImage(
          rawPath,
          1024, // maxWidth
          1024, // maxHeight
          'JPEG', // Định dạng đầu ra
          70, // Chất lượng (0-100)
          0, // Góc xoay
          undefined, // Đường dẫn lưu (để undefined sẽ tự lưu vào cache)
          false, // Không giữ lại metadata để giảm dung lượng thêm
          { mode: 'contain', onlyScaleDown: true },
        );

        console.log('✅ Đã nén ảnh xong. URI mới:', resizedImage.uri);

        const file = {
          uri: resizedImage.uri,
          type: 'image/jpeg',
          name: `refund_${Date.now()}.jpg`,
        };
        formData.append('ImageFile', file as any);
      }

      console.log('🚀 GỌI API REFUND...');
      let res;
      console.log('isUnpaid:', isUnpaid);
      if (isUnpaid) {
        // Lỗi hệ thống → gọi API riêng
        res = await refundApi.confirmSystemPayment(formData);
      } else {
        // Các loại khác → API cũ
        res = await refundApi.createRefund(formData);
      }
      console.log('✅ THÀNH CÔNG:', res.data);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tạo yêu cầu hoàn tiền',
      });
      onClose(); // Đóng modal khi thành công
    } catch (err) {
      console.log('❌ FINAL ERROR:', err);
      Alert.alert('Lỗi', 'Không thể hoàn tiền. Vui lòng thử lại.');
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
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
