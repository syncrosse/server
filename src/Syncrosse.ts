import { Server } from 'http';
import * as Io from 'socket.io';

export class Syncrosse {
  private server: Io.Server;
  private actions: { [key: string]: (data: any) => void } = {};

  constructor(http: Server) {
    (this.server = new Io.Server(http)),
      {
        transports: ['websocket'],
      };
  }

  public onAction(action: string, callback: (data: any) => void): void {
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

  public onJoin(callback: (user: UserId) => void): void {
    this.server.on('connection', (socket) => {
      console.log('Added actions on connection');
      for (const action in this.actions) {
        socket.on(action, this.actions[action]);
      }
      callback(socket.id);
    });
  }

  public onLeave(callback: (user: UserId) => void): void {
    this.onAction('disconnect', callback);
  }
}

type UserId = string;
