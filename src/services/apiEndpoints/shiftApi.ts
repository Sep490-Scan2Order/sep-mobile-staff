import axiosPrivate from '@/services/axios/privateClient';
import { CheckInRequest, CheckOutRequest, ShiftReportDto } from '@/type';

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
    getCurrentShift: () => {
    return axiosPrivate.get('/Shift/current');
  },
};