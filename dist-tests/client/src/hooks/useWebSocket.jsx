import { useEffect, useRef, useState } from 'react';
export function useWebSocket(_a) {
    var gameId = _a.gameId, playerId = _a.playerId, onMessage = _a.onMessage, onConnect = _a.onConnect, onDisconnect = _a.onDisconnect;
    var _b = useState(false), isConnected = _b[0], setIsConnected = _b[1];
    var _c = useState(null), connectionError = _c[0], setConnectionError = _c[1];
    var wsRef = useRef(null);
    var reconnectTimeoutRef = useRef(null);
    var reconnectAttempts = useRef(0);
    var maxReconnectAttempts = 5;
    // Keep latest identifiers and callbacks in refs so handlers always read current values
    var latestGameIdRef = useRef(gameId);
    var latestPlayerIdRef = useRef(playerId);
    var latestOnMessageRef = useRef(onMessage);
    var lastJoinedGameIdRef = useRef(undefined);
    useEffect(function () {
        latestGameIdRef.current = gameId;
        latestPlayerIdRef.current = playerId;
        latestOnMessageRef.current = onMessage;
    }, [gameId, playerId, onMessage]);
    var connect = function () {
        var _a;
        if (((_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            return;
        }
        try {
            var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            var wsUrl = "".concat(protocol, "//").concat(window.location.host, "/ws");
            console.log('Connecting to WebSocket:', wsUrl);
            wsRef.current = new WebSocket(wsUrl);
            wsRef.current.onopen = function () {
                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
                // Join the current game room if identifiers are available
                if (latestGameIdRef.current && latestPlayerIdRef.current) {
                    var joinData = { gameId: latestGameIdRef.current, playerId: latestPlayerIdRef.current };
                    sendMessage({ type: 'join_game', data: joinData });
                    lastJoinedGameIdRef.current = latestGameIdRef.current;
                }
                onConnect === null || onConnect === void 0 ? void 0 : onConnect();
            };
            wsRef.current.onmessage = function (event) {
                var _a;
                try {
                    var message = JSON.parse(event.data);
                    // Use the ref to ensure the latest onMessage handler is called
                    (_a = latestOnMessageRef.current) === null || _a === void 0 ? void 0 : _a.call(latestOnMessageRef, message);
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            wsRef.current.onclose = function (event) {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                wsRef.current = null;
                onDisconnect === null || onDisconnect === void 0 ? void 0 : onDisconnect();
                // Attempt to reconnect if it wasn't a manual close
                if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                    var delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log("Attempting to reconnect in ".concat(delay, "ms (attempt ").concat(reconnectAttempts.current + 1, ")"));
                    reconnectTimeoutRef.current = setTimeout(function () {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                }
            };
            wsRef.current.onerror = function (error) {
                console.error('WebSocket error:', error);
                setConnectionError('Connection failed');
            };
        }
        catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionError('Failed to connect');
        }
    };
    var disconnect = function () {
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
    var sendMessage = function (message) {
        var _a;
        if (((_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            console.log('WebSocket message sent:', message);
        }
        else {
            console.warn('WebSocket not connected, cannot send message:', message);
        }
    };
    // Establish connection on mount, clean up on unmount (do not close on id changes)
    useEffect(function () {
        connect();
        return function () {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // When identifiers change and we're connected, send a fresh join to switch rooms server-side
    useEffect(function () {
        if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
            return;
        if (!latestGameIdRef.current || !latestPlayerIdRef.current)
            return;
        if (lastJoinedGameIdRef.current !== latestGameIdRef.current) {
            var joinData = { gameId: latestGameIdRef.current, playerId: latestPlayerIdRef.current };
            sendMessage({ type: 'join_game', data: joinData });
            lastJoinedGameIdRef.current = latestGameIdRef.current;
        }
    }, [isConnected, gameId, playerId]);
    return {
        isConnected: isConnected,
        connectionError: connectionError,
        sendMessage: sendMessage,
        connect: connect,
        disconnect: disconnect
    };
}
