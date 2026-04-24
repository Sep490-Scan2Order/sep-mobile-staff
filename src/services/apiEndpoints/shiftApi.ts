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
  getPreview: (shiftId: number) => {
    return axiosPrivate.get(`/Shift/${shiftId}/preview`);
  },
  getReportsByStaff: (staffId: string) => {
    return axiosPrivate.get(`/Shift/reports/staff/${staffId}`);
  },
    getCurrentShift: () => {
    return axiosPrivate.get('/Shift/current');
  },
  getPendingReports: () => {
    return axiosPrivate.get('/Shift/current/pending-reports');
  },
  getTransferQr: (shiftId: number) => {
    return axiosPrivate.get(`/Shift/${shiftId}/transfer-qr`);
  },
  getStaffShifts: (cashierShiftId: number) => {
    return axiosPrivate.get(`/Shift/${cashierShiftId}/staff-shifts`);
  },
  blockShift: (shiftId: number) => {
    return axiosPrivate.post(`/Shift/${shiftId}/block`, {});
  },
};