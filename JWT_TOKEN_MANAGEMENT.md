## 🔐 JWT Token Management - Hướng Dẫn Sử Dụng

Tài liệu này mô tả cách sử dụng hệ thống quản lý JWT tokens đã được thêm vào dự án.

---

### 📋 Tính Năng Chính

#### 1. **Decode JWT Token** ✅
Giải mã token JWT và lấy payload

```typescript
import { decodeJWT } from '@/utils/jwtHelper';

const payload = decodeJWT(accessToken);
console.log(payload); 
// Output: { sub: '123', email: 'user@example.com', exp: 1772423485, ... }
```

#### 2. **Kiểm Tra Token Hết Hạn** ✅
```typescript
import { isTokenExpired } from '@/utils/jwtHelper';

// Kiểm tra với buffer mặc định 60 giây
if (isTokenExpired(accessToken)) {
  console.log('Token đã hết hạn!');
}

// Kiểm tra với buffer tùy chỉnh (30 giây)
if (isTokenExpired(accessToken, 30)) {
  console.log('Token sắp hết hạn!');
}
```

#### 3. **Lấy Thông Tin Expire** ✅
```typescript
import { getTokenExpirationInfo } from '@/utils/jwtHelper';

const info = getTokenExpirationInfo(accessToken);
// Output:
// {
//   expiryTime: 1772423485,
//   expiryDate: Date object,
//   timeRemaining: 3600,  // Số giây còn lại
//   isExpired: false
// }

console.log(`Token hết hạn lúc: ${info.expiryDate.toLocaleString('vi-VN')}`);
console.log(`Còn lại: ${info.timeRemaining} giây`);
```

#### 4. **Logout User** ✅
```typescript
import { authService } from '@/services/logicServices/authService';

// Logout bình thường
const result = await authService.logout();
if (result.success) {
  console.log('Đã đăng xuất thành công');
  // Navigate to login screen
}

// Force logout (do token hết hạn)
await authService.forceLogout();
```

---

### 🔄 Tự Động Kiểm Tra Expiration

#### Cơ Chế Hoạt Động

Hệ thống đã được cấu hình để **tự động kiểm tra token expiration** trước mỗi request:

```typescript
// src/services/axios/privateClient.ts

// ✅ Kiểm tra token hết hạn TRƯỚC khi gửi request
axiosPrivate.interceptors.request.use(
  async config => {
    const { accessToken } = await tokenStorage.getTokens();
    
    if (accessToken) {
      // Check: Token đã hết hạn hay chưa? (buffer 60 giây)
      if (isTokenExpired(accessToken, 60)) {
        // Tự động logout và show alert
        await tokenStorage.clearTokens();
        store.dispatch(logout());
        Alert.alert(
          'Phiên đã hết hạn',
          'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.'
        );
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  }
);
```

#### Quy Trình:
1. **Request gửi đi** → Kiểm tra token hết hạn?
   - **Hết hạn**: Clear tokens, logout, show alert
   - **Còn hạn**: Gửi request bình thường

2. **Response 401** → Cố gắng refresh token
   - Refresh thành công → Tiếp tục request
   - Refresh thất bại → Logout, show alert

---

### 📱 Sử Dụng trong Component

#### Ví Dụ: Hiển Thị Thời Gian Expire

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { getTokenExpirationInfo } from '@/utils/jwtHelper';

export const TokenExpiryDisplay = () => {
  const { accessToken } = useSelector((state: any) => state.auth);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const info = getTokenExpirationInfo(accessToken);
    if (info) {
      setTimeRemaining(info.timeRemaining);
    }

    const interval = setInterval(() => {
      const info = getTokenExpirationInfo(accessToken);
      if (info) {
        setTimeRemaining(info.timeRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  if (!timeRemaining) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <View>
      <Text>
        Phiên hết hạn trong: {minutes}:{seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};
```

#### Ví Dụ: Logout Button

```typescript
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { authService } from '@/services/logicServices/authService';
import { useNavigation } from '@react-navigation/native';

export const LogoutButton = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    const result = await authService.logout();
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Đăng Xuất</Text>
    </TouchableOpacity>
  );
};
```

---

### ⚙️ File Được Tạo/Chỉnh Sửa

| File | Thay Đổi | Mô Tả |
|------|----------|-------|
| `src/utils/jwtHelper.ts` | 📝 Tạo mới | Utility functions cho JWT |
| `src/services/logicServices/authService.ts` | ✏️ Chỉnh sửa | Thêm `logout()` và `forceLogout()` |
| `src/services/axios/privateClient.ts` | ✏️ Chỉnh sửa | Thêm kiểm tra token expiration |
| `src/services/axios/index.ts` | ✏️ Chỉnh sửa | Export privateClient |

---

### 🔍 Logs & Debug

Hệ thống sẽ in logs giúp debug:

```
✅ Token còn hạn. Hết hạn trong 3600s (12/3/2026 10:31:25)
⏰ Token đã hết hạn lúc: 12/3/2026 9:31:25
⚠️ Token expired - clearing tokens and logging out
📤 Logging out...
✅ Logout SUCCESS
```

---

### 🛡️ Buffer Time (60 giây)

**Tại sao sử dụng buffer 60 giây?**

```typescript
isTokenExpired(accessToken, 60) // Buffer 60 giây
```

- Tránh tình huống: Request gửi đi rồi token mới hết hạn giữa chừng
- Cho phép refresh token trước khi token thực sự hết hạn
- An toàn cho user experience

---

### 📌 Lưu Ý Quan Trọng

1. **Token Payload** được lưu ở phần **thứ 2** của JWT (giữa 2 dấu `.`)
   ```
   header.PAYLOAD.signature
   ```

2. **`exp` claim** là **Unix timestamp** (giây), không phải millisecond
   ```typescript
   exp: 1772423485 // Giây
   new Date(1772423485 * 1000) // Chuyển sang millisecond
   ```

3. **Automatic logout** xảy ra khi:
   - Token hết hạn + tạo request mới
   - Server trả về 401
   - Refresh token thất bại

4. **Buffer time** nên set 30-120 giây tùy theo yêu cầu

---

### 🎯 Chạy Thử

```bash
# Build project
npm install

# Start development
npm start

# Watch logs
adb logcat *:S ReactNative:V ReactNativeJS:V
```

Khi token hết hạn, bạn sẽ thấy alert và tự động redirect về login screen.

---

**Được tạo:** 09/03/2026
**Version:** 1.0
