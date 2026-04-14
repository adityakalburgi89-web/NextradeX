import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:8080/api/ws";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectDelay = 3000;
    this.subscriptionSequence = 0;
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
        console.log("WebSocket connected");
        this.resubscribeAll();
        if (onConnect) onConnect();
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
      this.subscriptions.forEach((entry) => {
        entry.stompSubscription = null;
      });
    }
  }

  subscribe(destination, callback) {
    const id = `sub-${this.subscriptionSequence++}`;
    const entry = {
      destination,
      callback,
      stompSubscription: null,
    };

    this.subscriptions.set(id, entry);

    if (this.client && this.connected) {
      this.attachSubscription(entry);
    } else {
      console.warn("WebSocket not connected. Subscription queued.");
    }

    return id;
  }

  unsubscribe(id) {
    const entry = this.subscriptions.get(id);
    if (entry?.stompSubscription) {
      entry.stompSubscription.unsubscribe();
    }
    this.subscriptions.delete(id);
  }

  attachSubscription(entry) {
    entry.stompSubscription = this.client.subscribe(entry.destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        entry.callback(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
  }

  resubscribeAll() {
    this.subscriptions.forEach((entry) => {
      if (!entry.stompSubscription && this.client && this.connected) {
        this.attachSubscription(entry);
      }
    });
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
