import { UserId } from './types';

export class User {
  constructor(public id: UserId, public name: string, public triggerEvent: (event: string, data: any) => void) {}
}
