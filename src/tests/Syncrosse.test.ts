import { Syncrosse } from '../index';
import { createServer } from 'http';
//import { Syncrosse as Client } from '@syncrosse/client';
const Client = require('socket.io-client');
import { Server, Socket } from 'socket.io';
import { Message } from '../types';

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
    const lobby = syncrosse.newLobby();
    const spy = jest.fn();

    let clientSocket: any;

    await new Promise((res) => {
      syncrosse.onAction('ping', ({ user, data, lobby: curLobby }) => {
        expect(user).toBeDefined();
        expect(curLobby.id).toBe(lobby.id);
        expect(data).toBe('Hey!');
        spy();
        res(null);
      });
      syncrosse.start();
      httpServer.listen(() => {
        //@ts-ignore
        const port = httpServer.address()!.port;
        clientSocket = new Client(`http://localhost:${port}`, { query: { lobbyId: lobby.id } });
        clientSocket.on('connect', () => {});
        clientSocket.emit('ping', 'Hey!');
      });
    });
    expect(spy).toHaveBeenCalled();
    //@ts-ignore
    syncrosse.server.close();
    clientSocket.close();
  });

  it('newLobby creates a new lobby', async () => {
    const syncrosse = new Syncrosse(httpServer);
    const lobby = syncrosse.newLobby();

    expect(lobby.id.length).toBeGreaterThan(5);
    expect(lobby.triggerEvent).toBeDefined();
  });

  it('should send messages back to clients', async () => {
    const syncrosse = new Syncrosse(httpServer);
    const lobby = syncrosse.newLobby();
    syncrosse.onJoin(() => {});
    const spy = jest.fn();

    let clientSocket: any;
    let message: Message;

    await new Promise((res) => {
      syncrosse.start();
      httpServer.listen(() => {
        //@ts-ignore
        const port = httpServer.address()!.port;
        clientSocket = new Client(`http://localhost:${port}`, { query: { lobbyId: lobby.id } });
        clientSocket.on('connect', () => {});
        clientSocket.on('message', (msg: Message) => {
          message = msg;
          spy();
          res(null);
        });
        clientSocket.emit('message', 'Hey!');
      });
    });
    expect(message!.content).toBe('Hey!');
    expect(message!.author).toBe('guest');
    expect(spy).toHaveBeenCalled();
    //@ts-ignore
    syncrosse.server.close();
    clientSocket.close();
  });
});
