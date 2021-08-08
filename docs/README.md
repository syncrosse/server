# Getting Started

## Introduction

Syncrosse is perfect for multiplayer games, real time applications, chat applications, and more. Users can send to actions to the server, and the server will be able to act on the actions by producing events for the users (clients). Clients can be divided into lobbies, where the actions and events are localized. Each lobby also comes with their own built in chat.

![syncrose](syncrose.png ':size=40%x40%')

## Server Code

To use Syncrosse, you will need to run both a server and a client at the same time. Start with the server.

A simple server can be written in under 15 lines of code (!!). Here's is a simple example using express:

`index.js`

```typescript
const { Syncrosse } = require('@syncrosse/server');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const syncrosse = new Syncrosse(server);

syncrosse.onAction('ping', ({ user, data, lobby }) => {
  lobby.triggerEvent('pong', data);
});

syncrosse.start();

server.listen(5000, () => {
  console.log('listening on *:5000');
});
```

To start your server, simply run `node index.js`.

## Front-end

To connect to your server from the front-end, use the following code:

```typescript
import { Syncrosse } from './Syncrosse';

const syncrosse = new Syncrosse("User1", lobbyId);

syncrosse.onEvent('pong', () => {
  // Prints pong when we receive a pong event
  console.log("pong!");
})

// Sends a ping action to the server
syncrosse.performAction('ping');

// Receives any chat messages
syncrosse.onMessage(({author, content}) => {
  console.log(`MESSAGE: ${author}: ${content}`));
})

// Send a chat message
syncrosse.sendMessage("Hello world!")
```

We also provide an easy-to-use React hook that handles everything related to Syncrosse. Here is a chat client, written in under 20 lines of code with React.

```typescript
import './App.css';
import { useSyncrosse } from '@syncrosse/client';
import { useRef } from 'react';

function App() {
  const { syncrosse, messages } = useSyncrosse();
  const inputRef = useRef(null);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {messages.map((msg, index) => (
            <p key={index}>
              {msg.author} {msg.content}
            </p>
          ))}
          <input ref={inputRef}></input>
          <button onClick={() => syncrosse.sendMessage(inputRef.current.value)}>Send</button>
        </div>
      </header>
    </div>
  );
}

export default App;
```

Note that if you are using create-react-app or webpack to serve your development environment, you will need to set a proxy so that Syncrosse can connect to the backend server. To do this, first eject your app (`npm run eject`), then edit the file `webpackDevServer.config.js` and change the following line:

Change `proxy,` on line 103, to:

```js
proxy: {
  '/socket.io/**/': {
    target: 'http://localhost:5000',
    ws: true,
  }
},
```

# API Documentation

## Server

### UserId

Alias for string, referring to specific user in a lobby.

### ActionHandler

Lambda function of the form `(actionData: { user: User; data: any; lobby: Lobby }) => void`.

### Message

#### Properties

| Name      | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| `author`  | string | The name of the person who wrote the message. |
| `content` | string | The content of the message.                   |

### User

#### Properties

| Name   | Type              | Description              |
| ------ | ----------------- | ------------------------ |
| `id`   | [UserId](#userid) | The user's unique ID.    |
| `name` | string            | The user's display name. |

#### Methods

##### User.triggerEvent

```typescript
triggerEvent(event: string, data?: any): void
```

Trigger an event to only the user on whom this method was called.

### Lobby

#### Properties

| Name          | Type                | Description                                                           |
| ------------- | ------------------- | --------------------------------------------------------------------- |
| `chatHistory` | [Message](#message) | The chat history of the lobby, stored as a series of Message objects. |

#### Methods

##### Lobby.triggerEvent

```typescript
triggerEvent(event: string, data?: any, opts?: { except: UserId[] } | { only: UserId[] }): void
```

Trigger an event in the lobby. Specific users can be excluded or excluded by passing a list of [UserId](#userid)s `except` or `only` to the `opts` parameter.

##### Lobby.sendMessage

```typescript
sendMessage(message: Message): void
```

Send a [Message](#message) to all users in the lobby.

### Syncrosse

#### Properties

| Name      | Type                               | Description                                                         |
| --------- | ---------------------------------- | ------------------------------------------------------------------- |
| `lobbies` | { [key: string]: [Lobby](#lobby) } | A dictionary containing all currently active lobbies on the server. |

#### Methods

##### Syncrosse.onAction

```typescript
onAction(name: string, callback: ActionHandler): void
```

Create a new action with the specified name, and handle the server’s response to the action via the callback function.

##### Syncrosse.start

```typescript
start(): void
```

Starts the server, finalizing all actions declared. Actions won't be triggerable until this function is called.

##### Syncrosse.onJoin

```typescript
onJoin(callback: ActionHandler): void
```

Sets a callback to run when a user joins a lobby.

##### Syncrosse.onLeave

```typescript
onLeave(callback: ActionHandler): void
```

Sets a callback to run when a user leaves a lobby.

##### Syncrosse.newLobby

```typescript
newLobby(lobbyId?: string): Lobby
```

Creates a new [Lobby](#lobby) with lobbyId if specified, otherwise with a random id.

##### Syncrosse.deleteLobby

```typescript
deleteLobby(lobbyId: string): void
```

Deletes the lobby with the specified id.

## Client

### sendMessages

```typescript
sendMessage(message: string): void
```

Sends a message from the user to everyone else on the site.

### onMessage

```typescript
onMessage(callback: (message: Message) => void): void
```

Set a callback to run when the client recieves a new message.

### onEvent

```typescript
onEvent(event: string, callback: (data?: any) => void): void
```

Handle the client's response to a specific event trigger from the server via a callback function.

### performAction

```typescript
performAction(action: string, data?: any): void
```

Send a specific action to the server with the provided data.

### useSyncrosse

```typescript
useSyncrosse(lobbyId?: string): { messages, syncrosse }
```

Creates a react hook for Syncrosse, and returns the syncrosse instance as well as a list of [Message](#message) objects. Connects to lobby specified by lobbyid, or default lobby if none is specified.
