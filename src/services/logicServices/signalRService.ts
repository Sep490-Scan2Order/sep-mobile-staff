import * as signalR from '@microsoft/signalr';

export const createSignalRConnection = () => {
  return new signalR.HubConnectionBuilder()
    .withUrl('http://10.0.2.2:5201/scan2order-hub')
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
};