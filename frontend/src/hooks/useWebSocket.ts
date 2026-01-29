/**
 * WebSocket Hook - For real-time communication
 * Uses built-in browser WebSocket API (FREE)
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface UseWebSocketOptions {
  onMessage?: (data: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export interface WebSocketHookReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  send: (data: any) => void;
  disconnect: () => void;
  reconnect: () => void;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): WebSocketHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = options.reconnectAttempts ?? 5;

  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect: shouldReconnect = true,
    reconnectInterval = 3000,
  } = options;

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionState('connecting');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onOpen?.();
        console.log('WebSocket connected to:', url);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(data);
          onMessage?.(data);
        } catch (e) {
          // If not JSON, wrap in message object
          const data: WebSocketMessage = {
            type: 'raw',
            data: event.data,
            timestamp: Date.now(),
          };
          setLastMessage(data);
          onMessage?.(data);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onClose?.(event);
        console.log('WebSocket disconnected:', event.code, event.reason);

        // Attempt reconnection if enabled and not manually closed
        if (shouldReconnect && event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionState('error');
      console.error('WebSocket connection error:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, shouldReconnect, reconnectInterval, maxReconnectAttempts]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
  }, [clearReconnectTimeout, maxReconnectAttempts]);

  const manualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      clearReconnectTimeout();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, [connect, clearReconnectTimeout]);

  return {
    isConnected,
    lastMessage,
    send,
    disconnect,
    reconnect: manualReconnect,
    connectionState,
  };
}

/**
 * Simple hook for one-way WebSocket (receive only)
 */
export function useWebSocketReceiver(
  url: string,
  onMessage: (data: WebSocketMessage) => void
): { isConnected: boolean; connectionState: string } {
  const { isConnected, connectionState } = useWebSocket(url, { onMessage });
  return { isConnected, connectionState };
}
