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
}

export const shiftApi = {
  checkIn: (data: CheckInRequest) => {
    return axiosPrivate.post('/Shift/check-in', data);
  },
   checkOut: (data: CheckOutRequest) => {
    return axiosPrivate.post('/Shift/check-out', data);
  },
  getReport: (shiftId: number) => {
    return axiosPrivate.get(`/Shift/${shiftId}/report`);
  },
  getReportsByStaff: (staffId: string) => {
    return axiosPrivate.get(`/Shift/reports/staff/${staffId}`);
  },
};