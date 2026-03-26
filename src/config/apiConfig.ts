import Config from 'react-native-config';

// Sử dụng giá trị từ .env được nạp bởi react-native-config
export const API_BASE_URL = Config.API_BASE_URL || 'http://10.0.2.2:5201/api';

export const SIGNALR_URL = Config.SIGNALR_URL || 'http://10.0.2.2:5201';

console.log('Current API_BASE_URL:', API_BASE_URL);