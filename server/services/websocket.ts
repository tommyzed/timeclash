import { WebSocket } from "ws";
import { type WebSocketMessage } from "@shared/schema";

// WebSocket connection management
export const gameRooms = new Map<string, Set<WebSocket>>();
export const playerConnections = new Map<string, WebSocket>();

/**
 * Broadcast a message to all players in a game
 */
export function broadcastToGame(gameId: string, message: WebSocketMessage) {
    const connections = gameRooms.get(gameId);
    if (connections) {
        connections.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }
}

/**
 * Add a player connection to a game room
 */
export function addPlayerToGameRoom(
    gameId: string,
    playerId: string,
    ws: WebSocket
) {
    // Remove this socket from all rooms first (in case player is re-joining)
    gameRooms.forEach((connections) => connections.delete(ws));

    // Add to the new game room
    if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, new Set());
    }
    gameRooms.get(gameId)?.add(ws);
    playerConnections.set(playerId, ws);

    console.log("Player connections after join:", {
        size: playerConnections.size,
        keys: Array.from(playerConnections.keys()),
    });
}

/**
 * Remove a player connection from all game rooms
 */
export function removePlayerConnection(ws: WebSocket) {
    // Remove connection from all game rooms
    gameRooms.forEach((connections, gameId) => {
        connections.delete(ws);
        if (connections.size === 0) {
            gameRooms.delete(gameId);
        }
    });

    // Remove from player connections
    for (const [playerId, connection] of Array.from(
        playerConnections.entries()
    )) {
        if (connection === ws) {
            playerConnections.delete(playerId);
            break;
        }
    }
}

/**
 * Send a message to the opponent in a game
 */
export function sendToOpponent(
    gameId: string,
    senderWs: WebSocket,
    message: WebSocketMessage
): boolean {
    const gameConnections = gameRooms.get(gameId);
    if (!gameConnections) {
        return false;
    }

    let sent = false;
    gameConnections.forEach((connection) => {
        if (connection !== senderWs && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(message));
            sent = true;
        }
    });

    return sent;
}
