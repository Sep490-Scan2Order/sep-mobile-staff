import * as signalR from '@microsoft/signalr';
import { SIGNALR_URL } from '@/config/apiConfig';
export const createSignalRConnection = () => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_URL}scan2order-hub`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
};