import { Server } from 'http';
import * as Io from 'socket.io';
import { Lobby } from './Lobby';
import { UserId, Message, ActionHandler } from './types';
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

  public triggerEvent(event: string, data?: any, opts?: { except: UserId[] } | { only: UserId[] }): void {
    if (opts) {
      const { only } = opts as { only: UserId[] };
      const { except } = opts as { except: UserId[] };

      if (only) {
        this.server.to(only).emit(event, data);
      } else if (except) {
        this.server.except(except).emit(event, data);
      }
    } else {
      this.server.emit(event, data);
    }
  }

  public onJoin(callback: ActionHandler): void {
    this.joinAction = callback;
  }

  public start() {
    this.server.on('connection', (socket) => {
      const user = new User(socket.id, 'guest', (event, data) => {
        this.triggerEvent(event, data, { only: [socket.id] });
      });

      for (const action in this.actions) {
        socket.on(action, (data) => {
          this.actions[action](user, data);
        });
      }
      this.joinAction(user);
    });
  }

  public onLeave(callback: ActionHandler): void {
    this.onAction('disconnect', callback);
  }

  public newLobby() {}

  private onMessage(message: Message) {
    this.server.emit('message', message);
  }
}
