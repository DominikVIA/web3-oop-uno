import {createGame, Game} from '../../src/model/uno'

export interface Room {
    id: string;
    host: string;
    players: string[];
    targetScore: number;
    status: 'WAITING' | 'ONGOING' | 'WON' | 'LOST';
    gameInstance?: Game;
}

export class RoomManager {
    private rooms = new Map<string, Room>();

    createRoom(roomId: string, players: string[], targetScore = 500): Room {
        const room: Room = {
            id: roomId,
            host: players[0],
            players: [...players],
            targetScore,
            status: 'WAITING'
        };
        this.rooms.set(roomId, room);
        return room;
    }

    getRoom(roomId: string): Room {
        const room = this.rooms.get(roomId);
        if (!room) throw new Error('Game room not found');
        return room;
    }

    addPlayerToRoom(roomId: string, username: string): Room {
        const room = this.getRoom(roomId);
        if (room.status !== 'WAITING') {
            throw new Error('Game has already started');
        }
        if (room.players.includes(username)) {
            return room;
        }
        if (room.players.length >= 4) {
            throw new Error('Room is full (maximum 4 players)');
        }

        room.players.push(username);
        return room;
    }

    startRoomGame(roomId: string): Room {
        const room = this.getRoom(roomId);
        if (room.status !== 'WAITING') {
            throw new Error('Game already started');
        }
        if (room.players.length < 2) {
            throw new Error('At least 2 players are required to start');
        }

        room.gameInstance = createGame(room.players, room.targetScore);
        room.status = 'ONGOING';
        return room;
    }

    getGamesForUser(username: string, status?: 'WAITING' | 'ONGOING' | 'WON' | 'LOST'): Room[] {
        const allRooms = Array.from(this.rooms.values());

        return allRooms.filter(room => {
            const isParticipant = room.players.includes(username);
            if (!isParticipant) return false;

            // Calculate precise user status if game is active or finished
            let effectiveStatus = room.status;
            if (room.gameInstance) {
                const winnerIndex = room.gameInstance.winner();
                if (winnerIndex !== undefined) {
                    const winnerName = room.players[winnerIndex];
                    effectiveStatus = winnerName === username ? 'WON' : 'LOST';
                }
            }

            if (status && effectiveStatus !== status) return false;
            return true;
        });
    }
}