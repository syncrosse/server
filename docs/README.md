# Syncrosse

> An awesome project.

# Syncrosse Library Documentation

## Server
### UserId
Alias for string, referring to specific user in a lobby.

### ActionHandler 
Lambda function of the form `(actionData: { user: User; data: any; lobby: Lobby })  => void`.
### Message

#### Properties
| Name      | Type   | Description                                   |
|-----------|--------|-----------------------------------------------|
| `author`  | string | The name of the person who wrote the message. |
| `content` | string | The content of the message.                   |


### User

#### Properties
| Name   | Type              | Description              |
|--------|-------------------|--------------------------|
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
| Name          | Type                | Description                                                            |
|---------------|---------------------|------------------------------------------------------------------------|
| `chatHistory` | [Message](#message) | The chat history of the lobby, stored as a series of Message objects.  |

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
|-----------|------------------------------------|---------------------------------------------------------------------|
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
useSyncrosse(): { messages, syncrosse }
```
Creates a react hook for Syncrosse, and returns the syncrosse instance as well as a list of [Message](#message) objects.
