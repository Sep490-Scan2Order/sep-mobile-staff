import { SIGNALR_URL } from '@/config/apiConfig';
describe('globalSignalR', () => {
  let mockConnection: any;
  let initSignalR: any;
  let stopSignalR: any;
  let createSignalRConnectionMock: any;
  let storeMock: any;
  let updateOrderStatusLocalMock: any;
  let addOrderMock: any;
  let updateReceivingOrdersLocalMock: any;
  let setShiftMock: any;
  let clearShiftMock: any;
  let playNotificationSoundMock: any;
  let playAudioFromUrlMock: any;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    createSignalRConnectionMock = jest.fn();
    storeMock = { dispatch: jest.fn() };
    updateOrderStatusLocalMock = jest.fn();
    addOrderMock = jest.fn();
    updateReceivingOrdersLocalMock = jest.fn();
    setShiftMock = jest.fn();
    clearShiftMock = jest.fn();
    playNotificationSoundMock = jest.fn();
    playAudioFromUrlMock = jest.fn();
    jest.doMock('@/services/logicServices/signalRService', () => ({
      createSignalRConnection: createSignalRConnectionMock,
    }));
    jest.doMock('@/store', () => ({
      store: storeMock,
    }));
    jest.doMock('@/store/slices/orderSlice', () => ({
      updateOrderStatusLocal: updateOrderStatusLocalMock,
      addOrder: addOrderMock,
    }));
    jest.doMock('@/store/slices/restaurantSlice', () => ({
      updateReceivingOrdersLocal: updateReceivingOrdersLocalMock,
    }));
    jest.doMock('@/store/slices/shiftSlice', () => ({
      setShift: setShiftMock,
      clearShift: clearShiftMock,
    }));
    jest.doMock('@/utils/notificationSound', () => ({
      playNotificationSound: playNotificationSoundMock,
      playAudioFromUrl: playAudioFromUrlMock,
    }));
    mockConnection = {
      on: jest.fn(),
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      invoke: jest.fn().mockResolvedValue(undefined),
      onreconnected: jest.fn(),
    };
    createSignalRConnectionMock.mockReturnValue(mockConnection);
    const globalSignalR = require('./globalSignalR');
    initSignalR = globalSignalR.initSignalR;
    stopSignalR = globalSignalR.stopSignalR;
  });
  describe('initSignalR', () => {
    it('should create and start connection', async () => {
      await initSignalR(1, 'staff1');
      expect(createSignalRConnectionMock).toHaveBeenCalled();
      expect(mockConnection.start).toHaveBeenCalled();
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinRestaurantGroup', '1');
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinGroup', 'staff:staff1');
    });
    it('should handle UpdateStatus event', async () => {
      await initSignalR();
      const updateStatusHandler = mockConnection.on.mock.calls.find(call => call[0] === 'UpdateStatus')[1];
      updateStatusHandler({ orderId: 'o1', status: 2 });
      expect(updateOrderStatusLocalMock).toHaveBeenCalledWith({ id: 'o1', status: 2 });
      expect(storeMock.dispatch).toHaveBeenCalled();
    });
    it('should handle ReceiveOrder event', async () => {
      await initSignalR();
      const receiveOrderHandler = mockConnection.on.mock.calls.find(call => call[0] === 'ReceiveOrder')[1];
      receiveOrderHandler({ id: 'o1', items: [] });
      expect(playNotificationSoundMock).toHaveBeenCalled();
      expect(addOrderMock).toHaveBeenCalled();
    });
    it('should handle PaymentReceived event', async () => {
        await initSignalR();
        const handler = mockConnection.on.mock.calls.find(call => call[0] === 'PaymentReceived')[1];
        handler({ audioUrl: 'url' });
        expect(playAudioFromUrlMock).toHaveBeenCalledWith('url');
    });
    it('should handle ReceivingOrdersChanged event', async () => {
        await initSignalR();
        const handler = mockConnection.on.mock.calls.find(call => call[0] === 'ReceivingOrdersChanged')[1];
        handler({ isReceivingOrders: true });
        expect(updateReceivingOrdersLocalMock).toHaveBeenCalledWith(true);
    });
    it('should handle ShiftChanged event', async () => {
        await initSignalR();
        const handler = mockConnection.on.mock.calls.find(call => call[0] === 'ShiftChanged')[1];
        handler({ status: 1 });
        expect(clearShiftMock).toHaveBeenCalled();
        handler({ status: 0, id: 's1' });
        expect(setShiftMock).toHaveBeenCalledWith({ status: 0, id: 's1' });
    });
  });
  describe('stopSignalR', () => {
    it('should stop the connection', async () => {
      await initSignalR();
      await stopSignalR();
      expect(mockConnection.stop).toHaveBeenCalled();
    });
  });
});
