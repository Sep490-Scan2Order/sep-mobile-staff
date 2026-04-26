import axiosPrivate from '@/services/axios/privateClient';
import { shiftApi } from './shiftApi';

jest.mock('@/services/axios/privateClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe('shiftApi', () => {
  it('calls checkIn', () => {
    shiftApi.checkIn({} as any);
    expect(axiosPrivate.post).toHaveBeenCalledWith('/Shift/check-in', {});
  });

  it('calls checkOut', () => {
    shiftApi.checkOut({} as any);
    expect(axiosPrivate.post).toHaveBeenCalledWith('/Shift/check-out', {});
  });

  it('calls getReport', () => {
    shiftApi.getReport(1);
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/1/report');
  });

  it('calls getPreview', () => {
    shiftApi.getPreview(1);
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/1/preview');
  });

  it('calls getReportsByStaff', () => {
    shiftApi.getReportsByStaff('s1');
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/reports/staff/s1');
  });

  it('calls getCurrentShift', () => {
    shiftApi.getCurrentShift();
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/current');
  });

  it('calls getPendingReports', () => {
    shiftApi.getPendingReports();
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/current/pending-reports');
  });

  it('calls getTransferQr', () => {
    shiftApi.getTransferQr(1);
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/1/transfer-qr');
  });

  it('calls getStaffShifts', () => {
    shiftApi.getStaffShifts(1);
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/1/staff-shifts');
  });

  it('calls blockShift', () => {
    shiftApi.blockShift(1);
    expect(axiosPrivate.post).toHaveBeenCalledWith('/Shift/1/block', {});
  });
});
