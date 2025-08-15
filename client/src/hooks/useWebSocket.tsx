import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage } from '@shared/schema';

interface UseWebSocketOptions {
  gameId?: string;
  playerId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({ gameId, playerId, onMessage, onConnect, onDisconnect }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Keep latest identifiers and callbacks in refs so handlers always read current values
  const latestGameIdRef = useRef<string | undefined>(gameId);
  const latestPlayerIdRef = useRef<string | undefined>(playerId);
  const latestOnMessageRef = useRef<((message: WebSocketMessage) => void) | undefined>(onMessage);
  const lastJoinedGameIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    latestGameIdRef.current = gameId;
    latestPlayerIdRef.current = playerId;
    latestOnMessageRef.current = onMessage;
  }, [gameId, playerId, onMessage]);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        // Join the current game room if identifiers are available
        if (latestGameIdRef.current && latestPlayerIdRef.current) {
          const joinData = { gameId: latestGameIdRef.current, playerId: latestPlayerIdRef.current };
          sendMessage({ type: 'join_game', data: joinData });
          lastJoinedGameIdRef.current = latestGameIdRef.current;
        }
        
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // Use the ref to ensure the latest onMessage handler is called
          latestOnMessageRef.current?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        
        onDisconnect?.();

        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  };

  // Establish connection on mount, clean up on unmount (do not close on id changes)
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When identifiers change and we're connected, send a fresh join to switch rooms server-side
  useEffect(() => {
    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!latestGameIdRef.current || !latestPlayerIdRef.current) return;

    if (lastJoinedGameIdRef.current !== latestGameIdRef.current) {
      const joinData = { gameId: latestGameIdRef.current, playerId: latestPlayerIdRef.current };
      sendMessage({ type: 'join_game', data: joinData });
      lastJoinedGameIdRef.current = latestGameIdRef.current;
    }
  }, [isConnected, gameId, playerId]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect
  };
}