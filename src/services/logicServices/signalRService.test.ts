import * as signalR from '@microsoft/signalr';
import { createSignalRConnection } from './signalRService';
import { SIGNALR_URL } from '@/config/apiConfig';
jest.mock('@microsoft/signalr', () => {
  const mockBuilder = {
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    configureLogging: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({ id: 'mock-connection' }),
  };
  return {
    HubConnectionBuilder: jest.fn(() => mockBuilder),
    LogLevel: { Information: 1 },
  };
});
describe('signalRService', () => {
  it('should create and build a SignalR connection with correct parameters', () => {
    const connection = createSignalRConnection();
    const builderInstance = new (signalR.HubConnectionBuilder as jest.Mock)();
    expect(builderInstance.withUrl).toHaveBeenCalledWith(
        `${SIGNALR_URL}scan2order-hub`
    );
    expect(builderInstance.withAutomaticReconnect).toHaveBeenCalled();
    expect(builderInstance.configureLogging).toHaveBeenCalledWith(signalR.LogLevel.Information);
    expect(builderInstance.build).toHaveBeenCalled();
    expect(connection).toEqual({ id: 'mock-connection' });
  });
});
