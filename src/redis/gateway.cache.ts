import { config } from '@gateway/config';
import { winstonLogger } from '@kevindeveloper95/jobapp-shared';
import { Logger } from 'winston';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayCache', 'debug');

export class GatewayCache {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: `${config.REDIS_HOST}` });
  }

  public async saveUserSelectedCategory(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.SET(key, value);
    } catch (error) {
      log.log('error', 'GatewayService Cache saveUserSelectedCategory() method error:', error);
    }
  }

  public async saveLoggedInUserToCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const index: number | null = await this.client.LPOS(key, value);
      if (index === null) {
        await this.client.LPUSH(key, value);
        log.info(`User ${value} added`);
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayService Cache saveLoggedInUserToCache() method error:', error);
      return [];
    }
  }

  public async getLoggedInUsersFromCache(key: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayService Cache getLoggedInUsersFromCache() method error:', error);
      return [];
    }
  }

  public async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // Asegurar que value sea un string válido
      const valueStr = typeof value === 'string' ? value : String(value || '');
      if (!valueStr || valueStr === '') {
        log.log('error', 'removeLoggedInUserFromCache: Invalid value provided', { key, value });
        return await this.client.LRANGE(key, 0, -1);
      }
      await this.client.LREM(key, 1, valueStr);
      log.info(`User ${valueStr} removed`);
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayService Cache removeLoggedInUserFromCache() method error:', error);
      return [];
    }
  }
}
