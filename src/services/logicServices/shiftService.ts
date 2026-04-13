import { shiftApi } from '@/services/apiEndpoints/shiftApi';
import { CheckInRequest, CheckOutRequest } from '@/type';


export const shiftService = {
  async checkIn(data: CheckInRequest) {
    try {
      const response = await shiftApi.checkIn(data);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Check-in thất bại';
      throw new Error(message);
    }
  },

  async checkOut(data: CheckOutRequest) {
    try {
      const response = await shiftApi.checkOut(data);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Check-out thất bại';
      throw new Error(message);
    }
  },

  async getReport(shiftId: number) {
    try {
      const response = await shiftApi.getReport(shiftId);
      return response.data?.data || response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lấy báo cáo thất bại';
      throw new Error(message);
    }
  },

  async getPreview(shiftId: number) {
    try {
      const response = await shiftApi.getPreview(shiftId);
      return response.data?.data || response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lấy bản xem trước báo cáo thất bại';
      throw new Error(message);
    }
  },

  async getReportsByStaff(staffId: string) {
    try {
      const response = await shiftApi.getReportsByStaff(staffId);
      const raw = response.data?.data ?? response.data;
      // Đảm bảo trả về array dù API wrapped hay không
      return Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);

    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lấy lịch sử báo cáo thất bại';
      throw new Error(message);
    }
  },
  async getCurrentShift() {
    try {
      const res = await shiftApi.getCurrentShift();
      return res.data?.data || res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        'Không lấy được ca hiện tại'
      );
    }
  },
};