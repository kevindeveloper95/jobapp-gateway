import { config } from '@gateway/config';
import { GatewayCache } from '@gateway/redis/gateway.cache';
import { IMessageDocument, IOrderDocument, IOrderNotifcation, winstonLogger } from '@kevindeveloper95/jobapp-shared';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');
let chatSocketClient: SocketClient;
let orderSocketClient: SocketClient;

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  constructor(io: Server) {
    this.io = io;
    this.gatewayCache = new GatewayCache();
    this.chatSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();
  }

  public listen(): void {
    this.chatSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();
    this.io.on('connection', async (socket: Socket) => {
      socket.on('getLoggedInUsers', async () => {
        const response: string[] = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
        this.io.emit('online', response);
      });

      socket.on('loggedInUsers', async (username: string | { username?: string; id?: string } | unknown) => {
        // Asegurar que username sea un string
        const usernameStr =
          typeof username === 'string'
            ? username
            : typeof username === 'object' && username !== null && ('username' in username || 'id' in username)
              ? (username as { username?: string; id?: string }).username || (username as { username?: string; id?: string }).id || ''
              : String(username || '');
        if (!usernameStr || usernameStr === '') {
          log.log('error', 'loggedInUsers: Invalid username provided', username);
          return;
        }
        const response: string[] = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', usernameStr);
        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string | { username?: string; id?: string } | unknown) => {
        // Asegurar que username sea un string
        const usernameStr =
          typeof username === 'string'
            ? username
            : typeof username === 'object' && username !== null && ('username' in username || 'id' in username)
              ? (username as { username?: string; id?: string }).username || (username as { username?: string; id?: string }).id || ''
              : String(username || '');
        if (!usernameStr || usernameStr === '') {
          log.log('error', 'removeLoggedInUser: Invalid username provided', username);
          return;
        }
        const response: string[] = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', usernameStr);
        this.io.emit('online', response);
      });

      socket.on(
        'category',
        async (
          category: string | { username?: string; id?: string } | unknown,
          username: string | { username?: string; id?: string } | unknown
        ) => {
          // Asegurar que category y username sean strings
          const categoryStr = typeof category === 'string' ? category : String(category || '');
          const usernameStr =
            typeof username === 'string'
              ? username
              : typeof username === 'object' && username !== null && ('username' in username || 'id' in username)
                ? (username as { username?: string; id?: string }).username || (username as { username?: string; id?: string }).id || ''
                : String(username || '');
          if (!categoryStr || !usernameStr) {
            log.log('error', 'category: Invalid category or username provided', { category, username });
            return;
          }
          await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${usernameStr}`, categoryStr);
        }
      );
    });
  }

  private chatSocketServiceIOConnections(): void {
    chatSocketClient = io(`${config.MESSAGE_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    chatSocketClient.on('connect', () => {
      log.info('ChatService socket connected');
    });

    chatSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      log.log('error', 'ChatSocket disconnect reason:', reason);
      chatSocketClient.connect();
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      log.log('error', 'ChatService socket connection error:', error);
      chatSocketClient.connect();
    });

    // custom events
    chatSocketClient.on('message received', (data: IMessageDocument) => {
      this.io.emit('message received', data);
    });

    chatSocketClient.on('message updated', (data: IMessageDocument) => {
      this.io.emit('message updated', data);
    });
  }

  private orderSocketServiceIOConnections(): void {
    orderSocketClient = io(`${config.ORDER_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    orderSocketClient.on('connect', () => {
      log.info('OrderService socket connected');
    });

    orderSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      log.log('error', 'OrderSocket disconnect reason:', reason);
      orderSocketClient.connect();
    });

    orderSocketClient.on('connect_error', (error: Error) => {
      log.log('error', 'OrderService socket connection error:', error);
      orderSocketClient.connect();
    });

    // custom event
    orderSocketClient.on('order notification', (order: IOrderDocument, notification: IOrderNotifcation) => {
      this.io.emit('order notification', order, notification);
    });
  }
}
