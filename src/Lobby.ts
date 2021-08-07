import { BroadcastOperator, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UserId, Message } from './types';

export class Lobby {
  public users: UserId[];
  public chatHistory: Message[];

  constructor(private socket: BroadcastOperator<DefaultEventsMap>, public id: string) {
    this.chatHistory = [];
    this.users = [];
  }

  public triggerEvent(event: string, data?: any, opts?: { except: UserId[] } | { only: UserId[] }): void {
    if (opts) {
      const { only } = opts as { only: UserId[] };
      const { except } = opts as { except: UserId[] };

      if (only) {
        this.socket.to(only).emit(event, data);
      } else if (except) {
        this.socket.except(except).emit(event, data);
      }
    } else {
      this.socket.emit(event, data);
    }
  }

  public sendMessage(message: Message): void {
    this.chatHistory.push(message);
    this.triggerEvent('message', message);
  }
}
