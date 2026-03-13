// src/hooks/useSignalR.ts
import { useEffect, useRef } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { createSignalRConnection } from '../services/logicServices/signalRService';

interface SignalREvent {
  name: string;
  handler: (data: any) => void;
}

export const useSignalR = (restaurantId: number, events: SignalREvent[]) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const eventsRef = useRef<SignalREvent[]>(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const connection = createSignalRConnection();

    // Đăng ký các sự kiện động dựa trên tham số truyền vào
    eventsRef.current.forEach(event => {
      connection.on(event.name, event.handler);
    });

    connection.start()
      .then(() => {
        console.log('--- SignalR Connected ---');
        connection.invoke('JoinRestaurantGroup', restaurantId.toString())
          .catch(err => console.error('Join Group Error:', err));
      })
      .catch(err => console.error('Connection Error:', err));

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        // Hủy đăng ký các sự kiện đã đăng ký
        eventsRef.current.forEach(event => connectionRef.current?.off(event.name));
        connectionRef.current.stop();
      }
    };
    // Chỉ chạy lại khi restaurantId thay đổi
  }, [restaurantId]); 

  return connectionRef.current;
};