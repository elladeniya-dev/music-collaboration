import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocketService';

/**
 * Custom hook for WebSocket chat functionality
 * Handles connection, subscription, and message sending
 * 
 * @param {string} chatId - The chat room ID
 * @param {string} userId - Current user ID
 * @param {function} onMessageReceived - Callback when message is received
 * @param {boolean} enabled - Whether to enable WebSocket connection
 */
export const useWebSocket = (chatId, userId, onMessageReceived, enabled = true) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    if (websocketService.isConnected()) {
      setConnected(true);
      setError(null);
    }

    // Connect to WebSocket
    websocketService.connect(
      () => {
        setConnected(true);
        setError(null);
      },
      (err) => {
        setConnected(false);
        setError(err);
        console.error('WebSocket connection error:', err);
      }
    );

    return () => {
      // Clean up on unmount
      if (subscriptionRef.current) {
        websocketService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [enabled, userId]);

  useEffect(() => {
    if (!connected || !chatId || !onMessageReceived) return;

    // Subscribe to chat room
    subscriptionRef.current = websocketService.subscribeToChatRoom(chatId, (message) => {
      onMessageReceived(message);
    });

    return () => {
      if (subscriptionRef.current) {
        websocketService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [connected, chatId, onMessageReceived]);

  /**
   * Send a message through WebSocket
   */
  const sendMessage = (message) => {
    try {
      websocketService.sendMessage(message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error);
      return false;
    }
  };

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = (isTyping, userName) => {
    try {
      websocketService.sendTypingIndicator({
        chatId,
        userId,
        userName,
        isTyping,
      });
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  };

  /**
   * Update message status
   */
  const updateMessageStatus = (messageId, status) => {
    try {
      websocketService.updateMessageStatus({
        messageId,
        chatId,
        userId,
        status,
      });
    } catch (error) {
      console.error('Failed to update message status:', error);
    }
  };

  return {
    connected,
    error,
    sendMessage,
    sendTypingIndicator,
    updateMessageStatus,
    isConnected: () => websocketService.isConnected(),
  };
};
