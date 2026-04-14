/**
 * CENTRAL TYPE DEFINITION FILE
 * All shared models, DTOs, and navigation types are consolidated here.
 */

import { NavigatorScreenParams } from '@react-navigation/native';

/* ==========================================================================
   AUTH & USER TYPES
   ========================================================================== */

export interface UserInfo {
  id: string;
  accountId: string;
  restaurantId: number;
  restaurantName: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
}

/* ==========================================================================
   RESTAURANT TYPES
   ========================================================================== */

export interface Restaurant {
  id: number;
  tenantId: string;
  restaurantName: string;
  address: string;
  longitude: number;
  latitude: number;
  image: string;
  phone: string;
  slug: string;
  description: string;
  profileUrl: string;
  qrMenu: string;
  isActive: boolean;
  isOpened: boolean;
  isReceivingOrders: boolean;
  totalOrder: number;
  createdAt: string;
  distanceKm: number | null;
  openTime?: string;
  closeTime?: string;
}

export interface RestaurantState {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
}

/* ==========================================================================
   DISH TYPES
   ========================================================================== */

export interface Dish {
  id: number;
  restaurantName: string;
  dishName: string;
  dishImageUrl: string;
  isSelling: boolean;
  price: number;
  isSoldOut: boolean;
  discountedPrice?: number;
  promotionName?: string | null;
  promotionLabel?: string | null;
  hasPromotion?: boolean;
  quantity?: number;
}

export interface DishState {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
}

export interface TogglePayload {
  restaurantId: number;
  id: number;
  isSoldOut: boolean;
  quantity: number;
}

/* ==========================================================================
   ORDER TYPES
   ========================================================================== */

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  originalPrice?: number;
  discountAmount?: number;
  promotionName?: string;
  subTotal?: number;
  image?: string;
  refundedQuantity?: number;
}

export interface Order {
  id: string;
  phone: string;
  orderCode: number;
  createdAt: string;
  amount: number;
  status: number;
  items: OrderItem[];
  type?: string;
  tableName?: string;
  isPreOrder?: boolean;
  requestedPickupAt?: string | null;
  confirmedPickupAt?: string | null;
  restaurantId?: number;
  refundOrderId?: string;
  typeOrder?: number;
  totalAmount?: number;
  promotionDiscount?: number;
  promotionName?: string | null;
  finalAmount?: number;
  originalOrderCode?: number;
}

export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshCount: number;
  unread: {
    all: number;
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
  };
}

/* ==========================================================================
   SHIFT TYPES
   ========================================================================== */

export interface CheckInRequest {
  restaurantId: number;
  staffId: string;
  openingCashAmount: number;
  note: string | null;
}

export interface CheckOutRequest {
  shiftId: number;
  cashAmount: number;
  note: string | null;
}

export interface ShiftReportDto {
  id: number;
  shiftId: number;
  reportDate: string;
  totalCashOrder: number;
  totalTransferOrder: number;
  totalRefundAmount: number;
  expectedCashAmount: number;
  actualCashAmount: number;
  difference: number;
  expectedTotalAmount: number;
  note: string;
  cashierName?: string;
}

export interface RefundRequest {
  orderId: string;
  refundType: number;
  responsibleStaffId: string;
  note: string;
  imageFile?: any; 
  isFullRefund: boolean;
  refundItems: { orderDetailId: number; quantityToRefund: number }[];
}

export interface ShiftState {
  currentShift: any | null;
  currentShiftId: number | null;
  loading: boolean;
  error: string | null;
}

/* ==========================================================================
   NAVIGATION TYPES
   ========================================================================== */

export type BottomTabParamList = {
  KDS: undefined;
  Foods: undefined;
  Orders: undefined;
  Menu: undefined;
  CheckIn: undefined;
  CashReport: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainApp: NavigatorScreenParams<BottomTabParamList>;
  ProfileScreen: undefined;
  DetailOrderScreen: { orderId: string };
  DetailPaymentScreen: { order: Order };
  ChangePasswordScreen: { email: string };
  ScanDeliveryScreen: undefined;
  Login: undefined;
  EmailForOTPScreen: undefined;
  ResetPasswordScreen: { email: string };
};
