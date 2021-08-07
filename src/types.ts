import { User } from './User';

export type UserId = string;

export interface Message {
  userId: UserId;
  text: string;
  time: Date;
}

export type ActionHandler = (user: User, data?: any) => void;
