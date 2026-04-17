import axiosPrivate from '@/services/axios/privateClient';
import { shiftApi } from './shiftApi';
import { CheckInRequest, CheckOutRequest } from '@/type';
jest.mock('@/services/axios/privateClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
describe('shiftApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('checkIn should call /Shift/check-in with correct data', async () => {
    const mockData: CheckInRequest = {
      staffId: 'staff-123',
      initialAmount: 100000,
      note: 'Start shift',
    };
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await shiftApi.checkIn(mockData);
    expect(axiosPrivate.post).toHaveBeenCalledWith('/Shift/check-in', mockData);
  });
  it('checkOut should call /Shift/check-out with correct data', async () => {
    const mockData: CheckOutRequest = {
      shiftId: 1,
      endAmount: 200000,
      note: 'End shift',
    };
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await shiftApi.checkOut(mockData);
    expect(axiosPrivate.post).toHaveBeenCalledWith('/Shift/check-out', mockData);
  });
  it('getReport should call /Shift/{id}/report', async () => {
    const shiftId = 123;
    (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await shiftApi.getReport(shiftId);
    expect(axiosPrivate.get).toHaveBeenCalledWith(`/Shift/${shiftId}/report`);
  });
  it('getReportsByStaff should call /Shift/reports/staff/{id}', async () => {
    const staffId = 'staff-123';
    (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await shiftApi.getReportsByStaff(staffId);
    expect(axiosPrivate.get).toHaveBeenCalledWith(`/Shift/reports/staff/${staffId}`);
  });
  it('getCurrentShift should call /Shift/current', async () => {
    (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await shiftApi.getCurrentShift();
    expect(axiosPrivate.get).toHaveBeenCalledWith('/Shift/current');
  });
});
