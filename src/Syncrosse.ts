import { Server } from 'http';
import * as Io from 'socket.io';

export class Syncrosse {
  private server: Io.Server;

  constructor(http: Server) {
    (this.server = new Io.Server(http)),
      {
        transports: ['websocket'],
      };
  }

  public onAction(action: string, callback: (data: any) => void): void {
    this.server.on(action, callback);
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
    this.server.on('connection', ({ id }) => {
      callback(id);
    });
  }

  public onLeave(callback: (user: UserId) => void): void {
    this.server.on('disconnect', callback);
  }
}

type UserId = string;
