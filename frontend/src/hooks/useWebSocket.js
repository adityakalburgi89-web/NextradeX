import { useEffect, useRef, useCallback, useState } from "react";
import websocketService from "../services/websocket";

export function useWebSocket(destination, callback, autoConnect = true) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const onConnect = useCallback(() => {
    setConnected(true);
    setError(null);
    if (destination) {
      subscriptionRef.current = websocketService.subscribe(destination, (data) => {
        callbackRef.current(data);
      });
    }
  }, [destination]);

  const onError = useCallback((err) => {
    setError(err);
    console.error("WebSocket error:", err);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      websocketService.connect(onConnect, onError);
    }

    return () => {
      if (subscriptionRef.current) {
        websocketService.unsubscribe(subscriptionRef.current);
      }
    };
  }, [autoConnect, onConnect, onError]);

  const reconnect = useCallback(() => {
    websocketService.disconnect();
    websocketService.connect(onConnect, onError);
  }, [onConnect, onError]);

  return { connected, error, reconnect };
}
