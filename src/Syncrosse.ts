import { Server } from 'http';
import { nanoid } from 'nanoid';
import * as Io from 'socket.io';
import { Lobby } from './Lobby';
import { Message, ActionHandler } from './types';
import { User } from './User';

export class Syncrosse {
  private server: Io.Server;
  private actions: { [key: string]: ActionHandler } = {};
  private lobbies: { [key: string]: Lobby } = {};
  private joinAction: ActionHandler = () => {};

  constructor(http: Server) {
    (this.server = new Io.Server(http)),
      {
        transports: ['websocket'],
      };
  }

  public onAction(action: string, callback: ActionHandler): void {
    const restricted = ['connection', 'disconnect', 'message'];
    if (restricted.includes(action)) {
      throw new Error(`${action} is a reserved action`);
    }
    this.actions[action] = callback;
  }

  public onJoin(callback: ActionHandler): void {
    this.joinAction = callback;
  }

  public start() {
    this.server.on('connection', (userSocket) => {
      const { lobbyId } = userSocket.handshake.query as {
        lobbyId: string;
      };

      const lobby = this.lobbies[lobbyId];
      if (!lobby) userSocket.disconnect();

      userSocket.join(lobbyId);

      const user = new User(userSocket.id, 'guest', (event, data) => {
        userSocket.emit(event, data);
      });

      for (const action in this.actions) {
        userSocket.on(action, (data) => {
          this.actions[action]({ user, data, lobby });
        });
      }

      this.joinAction({ user, lobby, data: null });
    });
  }

  public onLeave(callback: ActionHandler): void {
    this.onAction('disconnect', callback);
  }

  public newLobby(lobbyId?: string) {
    const id = lobbyId ?? nanoid();
    this.lobbies[id] = new Lobby(this.server.in(id), id);

    return this.lobbies[id];
  }

  private onMessage(message: Message) {
    this.server.emit('message', message);
  }
}
