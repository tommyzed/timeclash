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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let host = window.location.host;
      
      // Handle potential domain mismatch in Replit environments
      // If we're on a different domain, try to use the current domain for WebSocket
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      console.log('Environment debug:', {
        protocol,
        host,
        href: window.location.href,
        origin: window.location.origin,
        repl_domain: window.location.hostname
      });
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        // Join the game room if we have gameId and playerId
        if (gameId && playerId) {
          console.log('Sending join_game message:', { gameId, playerId });
          sendMessage({
            type: 'join_game',
            data: { gameId, playerId }
          });
        } else {
          console.log('WebSocket connected but missing gameId or playerId:', { gameId, playerId });
        }
        
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          onMessage?.(message);
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
          console.log('Reconnect will use URL:', `${protocol}//${window.location.host}/ws`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket URL that failed:', wsUrl);
        console.error('Current location details:', {
          href: window.location.href,
          host: window.location.host,
          protocol: window.location.protocol
        });
        
        // For cross-domain issues, provide helpful error message
        const isDomainMismatch = wsUrl.includes('.replit.app') && 
                                 !window.location.host.includes(wsUrl.split('//')[1].split('/')[0]);
        
        if (isDomainMismatch) {
          setConnectionError('Cross-domain connection issue - please refresh the page');
          console.warn('Domain mismatch detected - WebSocket connection may fail due to cross-origin restrictions');
        } else {
          setConnectionError('Connection failed');
        }
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

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  // Re-send join_game message when gameId or playerId becomes available
  useEffect(() => {
    if (isConnected && gameId && playerId) {
      console.log('Re-sending join_game message after connection established:', { gameId, playerId });
      sendMessage({
        type: 'join_game',
        data: { gameId, playerId }
      });
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