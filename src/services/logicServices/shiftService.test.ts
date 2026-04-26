import { shiftService } from './shiftService';
import { shiftApi } from '@/services/apiEndpoints/shiftApi';
jest.mock('@/services/apiEndpoints/shiftApi', () => ({
  shiftApi: {
    checkIn: jest.fn(),
    checkOut: jest.fn(),
    getReport: jest.fn(),
    getReportsByStaff: jest.fn(),
    getCurrentShift: jest.fn(),
    getPreview: jest.fn(),
    getPendingReports: jest.fn(),
    getTransferQr: jest.fn(),
    getStaffShifts: jest.fn(),
    blockShift: jest.fn(),
  },
}));
describe('shiftService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  describe('checkIn', () => {
    it('should return data on success', async () => {
      const mockRequest = { 
        staffId: '1', 
        restaurantId: 1, 
        openingCashAmount: 100, 
        note: 'test' 
      };
      const mockResponse = { data: { id: 's1', isSuccess: true } };
      (shiftApi.checkIn as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.checkIn(mockRequest as any);
      expect(result).toEqual(mockResponse.data);
    });
    it('should throw error with message from response on failure', async () => {
      const error = { response: { data: { message: 'Api Error' } } };
      (shiftApi.checkIn as jest.Mock).mockRejectedValue(error);
      await expect(shiftService.checkIn({} as any)).rejects.toThrow('Api Error');
    });
    it('should throw error with generic message on failure without response', async () => {
      const error = new Error('Network Error');
      (shiftApi.checkIn as jest.Mock).mockRejectedValue(error);
      await expect(shiftService.checkIn({} as any)).rejects.toThrow('Network Error');
    });
    it('should throw default message if no message found', async () => {
      (shiftApi.checkIn as jest.Mock).mockRejectedValue({});
      await expect(shiftService.checkIn({} as any)).rejects.toThrow('Check-in thất bại');
    });
  });
  describe('checkOut', () => {
    it('should return data on success', async () => {
      const mockRequest = { 
        shiftId: 1, 
        cashAmount: 200, 
        note: 'out' 
      };
      const mockResponse = { data: { id: 's1', isSuccess: true } };
      (shiftApi.checkOut as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.checkOut(mockRequest as any);
      expect(result).toEqual(mockResponse.data);
    });
    it('should throw error on failure', async () => {
      const error = { response: { data: { message: 'Out Fail' } } };
      (shiftApi.checkOut as jest.Mock).mockRejectedValue(error);
      await expect(shiftService.checkOut({} as any)).rejects.toThrow('Out Fail');
    });
    it('should throw default message if no message found', async () => {
      (shiftApi.checkOut as jest.Mock).mockRejectedValue({});
      await expect(shiftService.checkOut({} as any)).rejects.toThrow('Check-out thất bại');
    });
  });
  describe('getReport', () => {
    it('should return report data on success', async () => {
      const mockResponse = { data: { data: { totalAmount: 1000 } } };
      (shiftApi.getReport as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getReport(123);
      expect(result).toEqual(mockResponse.data.data);
    });
    it('should return full data if data.data is missing', async () => {
      const mockResponse = { data: { totalAmount: 1000 } };
      (shiftApi.getReport as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getReport(123);
      expect(result).toEqual(mockResponse.data);
    });
    it('should throw error on failure', async () => {
      const error = { response: { data: { message: 'Report Fail' } } };
      (shiftApi.getReport as jest.Mock).mockRejectedValue(error);
      await expect(shiftService.getReport(123)).rejects.toThrow('Report Fail');
    });
    it('should throw default message if no message found', async () => {
      (shiftApi.getReport as jest.Mock).mockRejectedValue({});
      await expect(shiftService.getReport(123)).rejects.toThrow('Lấy báo cáo thất bại');
    });
  });
  describe('getReportsByStaff', () => {
    it('should return list reports from response.data.data', async () => {
      const mockResponse = { data: { data: [{ id: '1' }] } };
      (shiftApi.getReportsByStaff as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getReportsByStaff('s1');
      expect(result).toEqual([{ id: '1' }]);
    });
    it('should return list reports from response.data.items', async () => {
      const mockResponse = { data: { items: [{ id: '2' }] } };
      (shiftApi.getReportsByStaff as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getReportsByStaff('s2');
      expect(result).toEqual([{ id: '2' }]);
    });
    it('should return list reports from response.data if it is an array', async () => {
      const mockResponse = { data: [{ id: '3' }] };
      (shiftApi.getReportsByStaff as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getReportsByStaff('s3');
      expect(result).toEqual([{ id: '3' }]);
    });
    it('should throw error on failure', async () => {
      const error = { response: { data: { message: 'History Fail' } } };
      (shiftApi.getReportsByStaff as jest.Mock).mockRejectedValue(error);
      await expect(shiftService.getReportsByStaff('s1')).rejects.toThrow('History Fail');
    });
    it('should throw default message if no message found', async () => {
      (shiftApi.getReportsByStaff as jest.Mock).mockRejectedValue({});
      await expect(shiftService.getReportsByStaff('s1')).rejects.toThrow('Lấy lịch sử báo cáo thất bại');
    });
  });
  describe('getCurrentShift', () => {
    it('should return current shift data on success', async () => {
      const mockResponse = { data: { data: { id: 's1' } } };
      (shiftApi.getCurrentShift as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getCurrentShift();
      expect(result).toEqual(mockResponse.data.data);
    });
    it('should return full data if data.data is missing', async () => {
      const mockResponse = { data: { id: 's1' } };
      (shiftApi.getCurrentShift as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getCurrentShift();
      expect(result).toEqual(mockResponse.data);
    });
    it('should throw error on failure', async () => {
      (shiftApi.getCurrentShift as jest.Mock).mockRejectedValue(new Error('Internal Error'));
      await expect(shiftService.getCurrentShift()).rejects.toThrow('Internal Error');
    });
    it('should throw default message if no message found', async () => {
      (shiftApi.getCurrentShift as jest.Mock).mockRejectedValue({});
      await expect(shiftService.getCurrentShift()).rejects.toThrow('Không lấy được ca hiện tại');
    });
  });

  describe('getPreview', () => {
    it('should return preview data on success', async () => {
      const mockResponse = { data: { data: { id: 1 } } };
      (shiftApi.getPreview as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getPreview(1);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error on failure', async () => {
      const error = { response: { data: { message: 'Preview Fail' } } };
      (shiftApi.getPreview as jest.Mock).mockRejectedValue(error);
      await expect(shiftService.getPreview(1)).rejects.toThrow('Preview Fail');
    });
  });

  describe('getPendingReports', () => {
    it('should return pending reports on success', async () => {
      const mockResponse = { data: [{ id: 1 }] };
      (shiftApi.getPendingReports as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getPendingReports();
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failure', async () => {
      (shiftApi.getPendingReports as jest.Mock).mockRejectedValue(new Error('Pending Error'));
      await expect(shiftService.getPendingReports()).rejects.toThrow('Pending Error');
    });
  });

  describe('getTransferQr', () => {
    it('should return qr data on success', async () => {
      const mockResponse = { data: { qrCode: 'abc' } };
      (shiftApi.getTransferQr as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getTransferQr(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failure', async () => {
      (shiftApi.getTransferQr as jest.Mock).mockRejectedValue(new Error('QR Error'));
      await expect(shiftService.getTransferQr(1)).rejects.toThrow('QR Error');
    });
  });

  describe('getStaffShifts', () => {
    it('should return staff shifts on success', async () => {
      const mockResponse = { data: { data: [1, 2] } };
      (shiftApi.getStaffShifts as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.getStaffShifts(1);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error on failure', async () => {
      (shiftApi.getStaffShifts as jest.Mock).mockRejectedValue(new Error('Staff Error'));
      await expect(shiftService.getStaffShifts(1)).rejects.toThrow('Staff Error');
    });
  });

  describe('blockShift', () => {
    it('should return data on success', async () => {
      const mockResponse = { data: { success: true } };
      (shiftApi.blockShift as jest.Mock).mockResolvedValue(mockResponse);
      const result = await shiftService.blockShift(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failure', async () => {
      (shiftApi.blockShift as jest.Mock).mockRejectedValue(new Error('Block Error'));
      await expect(shiftService.blockShift(1)).rejects.toThrow('Block Error');
    });
  });
});
