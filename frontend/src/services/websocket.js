import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:8080/api/ws";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connectionState = "DISCONNECTED"; // "DISCONNECTED", "CONNECTING", "CONNECTED"
    this.subscriptions = new Map();
    this.reconnectDelay = 3000;
    this.subscriptionSequence = 0;
    this.connectCallbacks = [];
    this.errorCallbacks = [];
  }

  connect(onConnect, onError) {
    // If already connected, trigger callback immediately
    if (this.client && this.connectionState === "CONNECTED" && this.client.connected) {
      if (onConnect) onConnect();
      return;
    }

    // If currently connecting, queue the callbacks
    if (this.connectionState === "CONNECTING") {
      if (onConnect) this.connectCallbacks.push(onConnect);
      if (onError) this.errorCallbacks.push(onError);
      return;
    }

    // If disconnected, start the connection process
    this.connectionState = "CONNECTING";
    if (onConnect) this.connectCallbacks.push(onConnect);
    if (onError) this.errorCallbacks.push(onError);

    console.log("[WS] Connecting to:", WS_URL);

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connectionState = "CONNECTED";
        console.log("[WS] WebSocket connected successfully");
        
        // Reset and establish all subscriptions
        this.resubscribeAll();

        // Invoke and clear all queued connect callbacks
        const callbacks = [...this.connectCallbacks];
        this.connectCallbacks = [];
        callbacks.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            console.error("[WS] Error in onConnect callback:", err);
          }
        });
      },
      onDisconnect: () => {
        this.connectionState = "DISCONNECTED";
        console.log("[WS] WebSocket disconnected");
        this.clearStaleSubscriptions();
      },
      onStompError: (frame) => {
        this.connectionState = "DISCONNECTED";
        console.error("[WS] STOMP error:", frame);
        this.clearStaleSubscriptions();
        
        const callbacks = [...this.errorCallbacks];
        callbacks.forEach((cb) => {
          try {
            cb(frame);
          } catch (err) {
            console.error("[WS] Error in onError callback:", err);
          }
        });
      },
      onWebSocketError: (event) => {
        this.connectionState = "DISCONNECTED";
        console.error("[WS] WebSocket error:", event);
        this.clearStaleSubscriptions();
        
        const callbacks = [...this.errorCallbacks];
        callbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (err) {
            console.error("[WS] Error in onError callback:", err);
          }
        });
      },
      onWebSocketClose: () => {
        this.connectionState = "DISCONNECTED";
        console.log("[WS] WebSocket connection closed");
        this.clearStaleSubscriptions();
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connectionState = "DISCONNECTED";
    this.connectCallbacks = [];
    this.errorCallbacks = [];
    this.clearStaleSubscriptions();
  }

  subscribe(destination, callback) {
    const id = `sub-${this.subscriptionSequence++}`;
    const entry = {
      destination,
      callback,
      stompSubscription: null,
    };

    this.subscriptions.set(id, entry);

    if (this.client && this.connectionState === "CONNECTED" && this.client.connected) {
      this.attachSubscription(entry);
    } else {
      console.warn("[WS] Not connected. Subscription queued for destination:", destination);
    }

    return id;
  }

  unsubscribe(id) {
    const entry = this.subscriptions.get(id);
    if (entry?.stompSubscription) {
      try {
        entry.stompSubscription.unsubscribe();
      } catch (err) {
        console.warn("[WS] Failed to unsubscribe subscription:", id, err.message);
      }
    }
    this.subscriptions.delete(id);
  }

  attachSubscription(entry) {
    if (!this.client || !this.client.connected) {
      console.warn("[WS] Cannot attach subscription: STOMP client not connected.");
      return;
    }
    try {
      entry.stompSubscription = this.client.subscribe(entry.destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          entry.callback(data);
        } catch (error) {
          console.error("[WS] Error parsing WebSocket message:", error);
        }
      });
      console.log("[WS] Subscribed successfully to destination:", entry.destination);
    } catch (err) {
      console.error("[WS] Failed to subscribe to destination:", entry.destination, err);
      entry.stompSubscription = null;
    }
  }

  clearStaleSubscriptions() {
    this.subscriptions.forEach((entry) => {
      entry.stompSubscription = null;
    });
  }

  resubscribeAll() {
    this.subscriptions.forEach((entry) => {
      if (this.client && this.client.connected) {
        this.attachSubscription(entry);
      }
    });
  }

  send(destination, body) {
    if (!this.client || !this.client.connected) {
      console.warn("[WS] WebSocket not connected. Message not sent.");
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(body) });
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
