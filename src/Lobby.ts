import { UserId, Message } from './types';

export class Lobby {
  private players: UserId[];
  private chatHistory: Message[];

  constructor() {
    this.chatHistory = [];
    this.players = [];
  }
}
