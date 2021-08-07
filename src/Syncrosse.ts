import { Server } from 'http';
import { nanoid } from 'nanoid';
import * as Io from 'socket.io';
import { Lobby } from './Lobby';
import { ActionHandler, Message } from './types';
import { User } from './User';

export class Syncrosse {
  private server: Io.Server;
  private actions: { [key: string]: ActionHandler } = {};
  public lobbies: { [key: string]: Lobby } = {};
  private joinAction: ActionHandler = () => {};

  constructor(http: Server) {
    (this.server = new Io.Server(http)),
      {
        transports: ['websocket'],
      };

    this.newLobby(''); // Create the default lobby

    //set up default actions
    this.onAction('message', ({ user, data, lobby }) => {
      const message: Message = {
        author: user.name,
        content: data,
      };
      lobby.chatHistory.push(message);
      lobby.triggerEvent('message', message);
    });

    this.joinAction = ({ user, lobby }) => {
      lobby.triggerEvent('message', {
        author: 'System',
        content: `${user.name} has joined the lobby`,
      });
    };
  }

  public onAction(action: string, callback: ActionHandler): void {
    const restricted = ['connection', 'disconnect', 'message'];
    if (restricted.includes(action) && this.actions['message']) {
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

  public deleteLobby(lobbyId: string) {
    const lobby = this.lobbies[lobbyId];

    if (lobby) {
      lobby.disconnectAllSockets();

      delete this.lobbies[lobbyId];
    }
  }

  public sendGlobalMessage(message: Message) {
    this.server.emit('message', message);
  }
}
