import * as signalR from '@microsoft/signalr';

export const createSignalRConnection = () => {
  return new signalR.HubConnectionBuilder()
    .withUrl('https://api.scan2order.io.vn/scan2order-hub')
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
};