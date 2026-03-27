// src/hooks/useSignalR.ts
import { useEffect, useRef } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { createSignalRConnection } from '../services/logicServices/signalRService';

interface SignalREvent {
  name: string;
  handler: (data: any) => void;
}

export const useSignalR = (
  restaurantId?: number,
  staffId?: string,
  events: SignalREvent[] = []
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const eventsRef = useRef<SignalREvent[]>(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!restaurantId && !staffId) return;

    console.log('🚀 Creating SignalR connection');

    const connection = createSignalRConnection();

    // 🔥 register events
    eventsRef.current.forEach(event => {
      console.log('📡 Register event:', event.name);
      connection.on(event.name, event.handler);
    });

    connection.start()
      .then(async () => {
        console.log('✅ SignalR Connected');

        // 🔥 join restaurant group
        if (restaurantId) {
          await connection.invoke('JoinRestaurantGroup', restaurantId.toString());
          console.log('✅ Joined restaurant group:', restaurantId);
        }

        // 🔥 join staff group (QUAN TRỌNG)
        if (staffId) {
          await connection.invoke('JoinGroup', `staff:${staffId}`);
          console.log('✅ Joined staff group:', `staff:${staffId}`);
        }
      })
      .catch(err => console.error('❌ Connection Error:', err));

    // 🔥 reconnect → join lại group
    connection.onreconnected(async () => {
      console.log('🔁 Reconnected');

      if (restaurantId) {
        await connection.invoke('JoinRestaurantGroup', restaurantId.toString());
      }

      if (staffId) {
        await connection.invoke('JoinGroup', `staff:${staffId}`);
      }
    });

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        console.log('🛑 Disconnect SignalR');

        eventsRef.current.forEach(event =>
          connectionRef.current?.off(event.name)
        );

        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [restaurantId, staffId]);

  return connectionRef.current;
};