import { shiftApi, CheckInRequest, CheckOutRequest } from '../apiEndpoints/shiftApi';

export const shiftService = {
  async checkIn(data: CheckInRequest) {
    try {
      console.log('shiftService - checkIn called with data:', data);
      const response = await shiftApi.checkIn(data);
      console.log('shiftService - checkIn response:', response);
      return response.data;
    } catch (error: any) {
      console.log('shiftService - checkIn error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Check-in thất bại';
      throw new Error(message);
    }
  },

  async checkOut(data: CheckOutRequest) {
    try {
      console.log('shiftService - checkOut called with data:', data);
      const response = await shiftApi.checkOut(data);
      console.log('shiftService - checkOut response:', response);
      return response.data;
    } catch (error: any) {
      console.log('shiftService - checkOut error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Check-out thất bại';
      throw new Error(message);
    }
  },

  async getReport(shiftId: number) {
    try {
      console.log('shiftService - getReport called for shiftId:', shiftId);
      const response = await shiftApi.getReport(shiftId);
      console.log('shiftService - getReport response:', response);
      // Backend trả về wrapper { isSuccess: true, data: { ... } }
      return response.data?.data || response.data;
    } catch (error: any) {
      console.log('shiftService - getReport error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lấy báo cáo thất bại';
      throw new Error(message);
    }
  },

  async getReportsByStaff(staffId: string) {
    try {
      console.log('shiftService - getReportsByStaff called for staffId:', staffId);
      const response = await shiftApi.getReportsByStaff(staffId);
      console.log('shiftService - getReportsByStaff response:', response);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.log('shiftService - getReportsByStaff error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lấy lịch sử báo cáo thất bại';
      throw new Error(message);
    }
  },
};