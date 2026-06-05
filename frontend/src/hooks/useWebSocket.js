import { useEffect, useRef, useCallback, useState } from "react";
import websocketService from "../services/websocket";

export function useWebSocket(destination, callback, autoConnect = true) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);
  const callbackRef = useRef(callback);
  const isMountedRef = useRef(true);

  // Keep callback up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onConnect = useCallback(() => {
    if (!isMountedRef.current) return;
    setConnected(true);
    setError(null);
    if (destination) {
      // Unsubscribe existing ref first if it exists
      if (subscriptionRef.current) {
        websocketService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      subscriptionRef.current = websocketService.subscribe(destination, (data) => {
        if (isMountedRef.current) {
          callbackRef.current(data);
        }
      });
    }
  }, [destination]);

  const onError = useCallback((err) => {
    if (!isMountedRef.current) return;
    setError(err);
    console.error("[useWebSocket] Hook error:", err);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      websocketService.connect(onConnect, onError);
    }

    return () => {
      if (subscriptionRef.current) {
        websocketService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [autoConnect, onConnect, onError]);

  const reconnect = useCallback(() => {
    websocketService.disconnect();
    websocketService.connect(onConnect, onError);
  }, [onConnect, onError]);

  return { connected, error, reconnect };
}
