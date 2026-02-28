# /code:socket - Socket.io 이벤트 핸들러 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

Socket.io 기반 실시간 기능의 이벤트 핸들러와 클라이언트 훅을 생성합니다.

## 사용법

```
/code:socket chat message,typing,read
/code:socket notification order-status,delivery-update
/code:socket auction bid,countdown
```

## 생성 파일

```
src/features/{name}/
├── types/
│   └── socket.ts       # 이벤트 타입 정의
├── hooks/
│   └── use-{name}-socket.ts  # 클라이언트 훅
└── handlers/
    └── {name}-handlers.ts    # 서버 핸들러 (선택)
```

## 타입 정의 템플릿

```tsx
// src/features/chat/types/socket.ts

// 서버 → 클라이언트 이벤트
export interface ServerToClientEvents {
  message: (data: MessagePayload) => void;
  typing: (data: TypingPayload) => void;
  read: (data: ReadPayload) => void;
}

// 클라이언트 → 서버 이벤트
export interface ClientToServerEvents {
  message: (data: SendMessagePayload) => void;
  typing: (data: TypingPayload) => void;
  read: (data: ReadPayload) => void;
}

// Payload 타입
export interface MessagePayload {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

export interface TypingPayload {
  userId: string;
  roomId: string;
  isTyping: boolean;
}

export interface ReadPayload {
  messageId: string;
  userId: string;
}
```

## 클라이언트 훅 템플릿

```tsx
// src/features/chat/hooks/use-chat-socket.ts
'use client';

import { useCallback, useEffect } from 'react';

import { io, type Socket } from 'socket.io-client';

import {
  type ClientToServerEvents,
  type MessagePayload,
  type ServerToClientEvents,
} from '../types/socket';

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

const getSocket = (): ChatSocket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      autoConnect: false,
    });
  }
  return socket;
};

export const useChatSocket = (roomId: string) => {
  const socket = getSocket();

  useEffect(() => {
    socket.connect();
    socket.emit('join', { roomId });

    return () => {
      socket.emit('leave', { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (content: string) => {
      socket.emit('message', { content, roomId });
    },
    [roomId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      socket.emit('typing', { roomId, isTyping });
    },
    [roomId],
  );

  const onMessage = useCallback((handler: (data: MessagePayload) => void) => {
    socket.on('message', handler);
    return () => socket.off('message', handler);
  }, []);

  return {
    sendMessage,
    sendTyping,
    onMessage,
    socket,
  };
};
```

## 규칙

1. 이벤트명: kebab-case
2. 타입은 features/{name}/types/에 정의
3. 훅은 features/{name}/hooks/에 정의
4. Socket 인스턴스는 싱글톤으로 관리
5. cleanup 시 반드시 disconnect
