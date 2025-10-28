import express, { Express } from 'express';
import { GatewayServer } from '@gateway/server';
/* import { redisConnection } from '@gateway/redis/redis.connection';
 */
class Application {
  public async initialize(): Promise<void> {
    const app: Express = express();
    const server: GatewayServer = new GatewayServer(app);
    await server.start();  // IMPORTANTE: Esperar a que el servidor termine de inicializar
    /* redisConnection.redisConnect(); */
  }
}

const application: Application = new Application();
application.initialize();