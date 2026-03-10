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
};