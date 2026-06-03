import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * WebSocket Service for real-time chat messaging
 * Uses STOMP protocol over WebSocket with SockJS fallback
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectionCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to WebSocket server
   * @param {string} userId - Current user ID to send in connect headers
   * @param {function} onConnected - Callback when connection is established
   * @param {function} onError - Callback when connection fails
   */
  connect(userId, onConnected, onError) {
    if (this.client?.connected || this.connected) {
      this.connected = true;
      if (onConnected) onConnected();
      return;
    }

    if (onConnected) this.connectionCallbacks.push(onConnected);

    if (this.client?.active) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      connectHeaders: {
        userId: (typeof userId === 'string') ? userId : ''
      },

      debug: (str) => {
        if (import.meta.env.VITE_DEBUG) {
          console.log('STOMP: ' + str);
        }
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.connectionCallbacks.forEach(cb => cb(frame));
        this.connectionCallbacks = [];
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
        this.connected = false;
        if (onError) onError(error);
      },

      onDisconnect: () => {
        console.log('🔌 WebSocket Disconnected');
        this.connected = false;
        this.subscriptions.clear();
      },
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Subscribe to a chat room
   * @param {string} chatId - The chat ID to subscribe to
   * @param {function} callback - Callback function to handle received messages
   * @returns {string} Subscription ID
   */
  subscribeToChatRoom(chatId, callback) {
    if (!this.client) {
      console.error('WebSocket not initialized. Call connect() first.');
      return null;
    }

    if (!this.client.connected) {
      console.warn('WebSocket not connected yet. Skipping subscription attempt.');
      return null;
    }

    const destination = `/topic/chat/${chatId}`;
    const subscriptionId = `chat-${chatId}`;

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(subscriptionId)) {
      this.unsubscribe(subscriptionId);
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body);
          callback(messageData);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      this.subscriptions.set(subscriptionId, subscription);
      console.log(`📩 Subscribed to chat room: ${chatId}`);
      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to chat room:', error);
      return null;
    }
  }

  /**
   * Subscribe to personal message queue
   * @param {string} userId - User ID
   * @param {function} callback - Callback for notifications
   */
  subscribeToUserMessages(userId, callback) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/queue/messages/${userId}`;
    const subscriptionId = `user-${userId}`;

    if (this.subscriptions.has(subscriptionId)) {
      this.unsubscribe(subscriptionId);
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body);
          callback(messageData);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      this.subscriptions.set(subscriptionId, subscription);
      console.log(`🔔 Subscribed to user messages: ${userId}`);
      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to user messages:', error);
      return null;
    }
  }

  /**
   * Subscribe to live notifications
   * @param {string} userId - User ID
   * @param {function} callback - Callback for notifications
   */
  subscribeToNotifications(userId, callback) {
    if (!this.client || !this.client.connected) return null;

    const destination = `/queue/notifications/${userId}`;
    const subscriptionId = `notifications-${userId}`;

    if (this.subscriptions.has(subscriptionId)) {
      this.unsubscribe(subscriptionId);
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const notifData = JSON.parse(message.body);
          callback(notifData);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      this.subscriptions.set(subscriptionId, subscription);
      console.log(`🔔 Subscribed to live notifications for: ${userId}`);
      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  }

  /**
   * Subscribe to global presence indicator
   * @param {function} callback - Callback for presence events
   */
  subscribeToPresence(callback) {
    if (!this.client || !this.client.connected) return null;

    const destination = `/topic/presence`;
    const subscriptionId = `presence-global`;

    if (this.subscriptions.has(subscriptionId)) {
      this.unsubscribe(subscriptionId);
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const presenceData = JSON.parse(message.body);
          callback(presenceData);
        } catch (error) {
          console.error('Error parsing presence indicator:', error);
        }
      });

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to presence:', error);
      return null;
    }
  }

  /**
   * Subscribe to typing indicators
   * @param {string} chatId - Chat ID
   * @param {function} callback - Callback for typing events
   */
  subscribeToTyping(chatId, callback) {
    if (!this.client || !this.client.connected) return null;

    const destination = `/topic/chat/${chatId}/typing`;
    const subscriptionId = `typing-${chatId}`;

    if (this.subscriptions.has(subscriptionId)) {
      this.unsubscribe(subscriptionId);
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const typingData = JSON.parse(message.body);
          callback(typingData);
        } catch (error) {
          console.error('Error parsing typing indicator:', error);
        }
      });

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to typing:', error);
      return null;
    }
  }

  /**
   * Send a message via WebSocket
   * @param {object} message - Message object
   */
  sendMessage(message) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected. Cannot send message.');
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify(message),
    });
  }

  /**
   * Send a typing indicator
   * @param {Object} data - {chatId, userId, userName, typing}
   */
  sendTypingIndicator(data) {
    if (!this.connected || !this.client) return;

    this.client.publish({
      destination: '/app/typing',
      body: JSON.stringify(data),
    });
  }

  /**
   * Send a request to check presence of a specific user
   * @param {string} targetUserId - User ID to check
   */
  checkPresence(targetUserId) {
    if (!this.connected || !this.client) return;

    this.client.publish({
      destination: '/app/presence/check',
      body: targetUserId,
    });
  }

  /**
   * Send presence indicator
   * @param {object} indicator - Presence indicator object {userId, isOnline}
   */
  sendPresenceIndicator(indicator) {
    if (!this.client || !this.client.connected) return;

    this.client.publish({
      destination: '/app/presence',
      body: JSON.stringify(indicator),
    });
  }

  /**
   * Update message status (delivered/read)
   * @param {object} statusUpdate - Status update object
   */
  updateMessageStatus(statusUpdate) {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: '/app/message/status',
      body: JSON.stringify(statusUpdate),
    });
  }

  /**
   * Unsubscribe from a specific subscription
   * @param {string} subscriptionId - Subscription ID to unsubscribe
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from: ${subscriptionId}`);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, id) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    console.log('Unsubscribed from all topics');
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.client?.connected;
  }
}

// Export singleton instance
export default new WebSocketService();
