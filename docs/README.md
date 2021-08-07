# Syncrosse

> An awesome project.

# Syncrosse Library Documentation

## Server
### UserId
Alias for string, referring to specific user in a lobby.

### ActionHandler 
Lambda function of the form `(user: User, data?: any) => void`
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
### `onAction(name: string, callback: ActionHandler): void`

Create a new action with the specified name, and handle the server’s response to the action via the callback function.
