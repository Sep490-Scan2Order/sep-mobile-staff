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
  console.log("Creating SignalR connection");

  const connection = createSignalRConnection();

  eventsRef.current.forEach(event => {
    console.log("Register event:", event.name);
    connection.on(event.name, event.handler);
  });

  console.log("Starting connection...");

  connection.start()
    .then(() => {
      console.log("✅ SignalR Connected");

      connection.invoke("JoinRestaurantGroup", restaurantId.toString())
        .then(() => console.log("Joined group:", restaurantId))
        .catch(err => console.error("Join Group Error:", err));
    })
    .catch(err => console.error("❌ Connection Error:", err));

  connectionRef.current = connection;

  return () => {
    if (connectionRef.current) {
      eventsRef.current.forEach(event =>
        connectionRef.current?.off(event.name)
      );
      connectionRef.current.stop();
    }
  };
}, [restaurantId]);
  return connectionRef.current;
};