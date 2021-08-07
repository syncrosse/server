import { Syncrosse } from '../index';
import { createServer } from 'http';
//import { Syncrosse as Client } from '@syncrosse/client';
const Client = require('socket.io-client');
import { Server, Socket } from 'socket.io';

describe('Syncrosse', () => {
  const httpServer = createServer();

  it('should not return null', () => {
    const syncrosse = new Syncrosse(httpServer);
    expect(syncrosse).not.toBeNull();
  });

  it('should be able to create actions', () => {
    const syncrosse = new Syncrosse(httpServer);
    syncrosse.onAction('ping', () => {});

    //@ts-ignore
    expect(syncrosse.actions.ping).not.toBeNull();
  });

  it('should trigger events when called', async () => {
    const syncrosse = new Syncrosse(httpServer);
    const spy = jest.fn();

    let clientSocket: any;

    await new Promise((res) => {
      syncrosse.onAction('ping', () => {
        console.log('pong');
        spy();
        res(null);
      });
      syncrosse.onJoin(() => {});
      httpServer.listen(() => {
        //@ts-ignore
        const port = httpServer.address()!.port;
        clientSocket = new Client(`http://localhost:${port}`);
        clientSocket.on('connect', () => {});
        clientSocket.emit('ping');
      });
    });
    expect(spy).toHaveBeenCalled();
    //@ts-ignore
    syncrosse.server.close();
    clientSocket.close();
  });
});
