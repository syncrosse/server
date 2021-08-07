import { Syncrosse } from '../index';
import { Server } from 'http';

describe('Syncrosse', () => {
  it('should not return null', () => {
    const http = new Server();
    const client = new Syncrosse(http);
    expect(client).not.toBeNull();
  });
});
