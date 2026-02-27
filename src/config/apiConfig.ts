import Config from 'react-native-config';

// Sử dụng giá trị từ .env, nếu không có thì dùng fallback để tránh lỗi app
export const API_BASE_URL = Config.API_BASE_URL ;
console.log('API_BASE_URL123 =', Config.API_BASE_URL);