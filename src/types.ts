import { Lobby, User } from '.';
export type UserId = string;

export interface Message {
  userId: UserId;
  text: string;
  time: Date;
}

export type ActionHandler = (actionData: { user: User; data: any; lobby: Lobby }) => void;
