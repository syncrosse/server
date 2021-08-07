import { Lobby, User } from '.';
export type UserId = string;

export interface Message {
  author: string;
  content: string;
}

export type ActionHandler = (actionData: { user: User; data: any; lobby: Lobby }) => void;
