import axiosPrivate from '../axios/privateClient';

export interface CheckInRequest {
  restaurantId: number;
  staffId: string;
  openingCashAmount: number;
  note: string;
}

export interface CheckOutRequest {
  shiftId: number;
  cashAmount: number;
  note: string;
}

export const shiftApi = {
  checkIn: (data: CheckInRequest) => {
    return axiosPrivate.post('/Shift/check-in', data);
  },
   checkOut: (data: CheckOutRequest) => {
    return axiosPrivate.post('/Shift/check-out', data);
  },
};