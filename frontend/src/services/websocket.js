import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:8080/api/ws";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(onConnect, onError) {
    if (this.client && this.connected) {
      if (onConnect) onConnect();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log("WebSocket connected");
        if (onConnect) onConnect();
        this.resubscribeAll();
      },
      onDisconnect: () => {
        this.connected = false;
        console.log("WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        if (onError) onError(frame);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
        if (onError) onError(event);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.warn("WebSocket not connected. Subscription queued.");
      return null;
    }

    const id = this.subscriptions.size.toString();
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    });

    this.subscriptions.set(id, subscription);
    return id;
  }

  unsubscribe(id) {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(id);
    }
  }

  resubscribeAll() {
    const callbacks = [];
    this.subscriptions.forEach((sub, id) => {
      callbacks.push({ id, destination: sub.destination });
    });
    this.subscriptions.clear();
  }

  send(destination, body) {
    if (!this.client || !this.connected) {
      console.warn("WebSocket not connected. Message not sent.");
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(body) });
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
