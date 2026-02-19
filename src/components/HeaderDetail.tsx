import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface HeaderDetailProps {
  onBack?: () => void;
  title?: string;
  isSuccess?: boolean;
  heightClass?: string; // 👈 thêm prop
}

export const HeaderDetail: React.FC<HeaderDetailProps> = ({
  onBack,
  title = 'Chi tiết thanh toán',
  isSuccess = false,
  heightClass = 'h-2/4', // 👈 mặc định như cũ
}) => {
  return (
    <View
      className={`bg-[#226B5D] pt-14 px-4 rounded-b-2xl -mb-10 ${heightClass}`}
    >
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-white text-lg font-semibold mr-6">
          {isSuccess ? '' : title}
        </Text>
      </View>

      {isSuccess && (
        <View className="items-center -mt-6">
          <CheckCircle color="white" size={70} strokeWidth={1.5} />
          <Text className="text-white text-xl font-bold mt-4">{title}</Text>
        </View>
      )}
    </View>
  );
};
