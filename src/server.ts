import http from 'http';

 import 'express-async-errors'; 
import { CustomError, IErrorResponse, winstonLogger } from '@kevindeveloper95/jobapp-shared';
import { Application, Request, Response, json, urlencoded, NextFunction } from 'express';
import { Logger } from 'winston';
import cookieSession from 'cookie-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { config } from '@gateway/config';
import { elasticSearch } from '@gateway/elasticsearch';
import { appRoutes } from '@gateway/routes';
 import { axiosAuthInstance } from '@gateway/services/api/auth.service';
 import { axiosBuyerInstance } from '@gateway/services/api/buyer.service';
import { axiosSellerInstance } from '@gateway/services/api/seller.service';
import { axiosGigInstance } from '@gateway/services/api/gig.service';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOAppHandler } from '@gateway/sockets/socket';
import { axiosMessageInstance } from '@gateway/services/api/message.service';
import { axiosOrderInstance } from '@gateway/services/api/order.service';
import { axiosReviewInstance } from '@gateway/services/api/review.service';  
import { isAxiosError } from 'axios'; 

const SERVER_PORT = 4000;
 const DEFAULT_ERROR_CODE = 500; 
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug');
export let socketIO: Server; 

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  // Método principal que inicializa todo el servidor con middlewares, rutas, errores y conexión
  public async start(): Promise<void> {
    this.securityMiddleware(this.app);     // Seguridad y configuración de sesiones
    this.standardMiddleware(this.app);     // Configuración estándar de Express (compresión, body parsers)
    this.routesMiddleware(this.app);       // Rutas principales de la aplicación
    this.startElasticSearch();             // Verificación de conexión a Elasticsearch
    await this.startServer(this.app);      // Inicializa el servidor HTTP y WebSocket - DEBE ESPERAR
    this.errorHandler(this.app);           // Manejo global de errores - SE REGISTRA AL FINAL
  }

  // Configura middlewares de seguridad y sesión
  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}                                                                                                                               `],
        maxAge: 24 * 7 * 3600000, // Una semana                     
        secure: config.NODE_ENV !== 'development',
        ...(config.NODE_ENV !== 'development' && {
          sameSite: 'none'
        })
      })
    );       
    app.use(hpp());       // Previene ataques de parameter pollution
    app.use(helmet());    // Protege cabeceras HTTP
    app.use(cors({       // Configura CORS con el cliente frontend
      origin: config.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));

    // Si existe un JWT en sesión, lo inyecta en todos los headers de axios para autenticación
      app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
         axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
         axiosBuyerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosSellerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosGigInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosMessageInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosOrderInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosReviewInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;  
      }
      next();
    }); 
  } 

  // Middlewares comunes: compresión, JSON y formularios grandes
  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  // Carga las rutas definidas en el proyecto
  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  // Verifica si Elasticsearch está disponible
  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }


  private errorHandler(app: Application): void {
    
    app.use(/.*/, (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `${fullUrl} endpoint does not exist.`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.' });
      next();
    });

    // Errores personalizados definidos por el desarrollador
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (error instanceof CustomError) {
        log.log('error', `GatewayService ${error.comingFrom}:`, error);
        res.status(error.statusCode).json(error.serializeErrors());
      }

      // Errores provenientes de Axios al consumir otros servicios
       if (isAxiosError(error)) {
        log.log('error', `GatewayService Axios Error - ${error?.response?.data?.comingFrom}:`, error);
        res.status(error?.response?.data?.statusCode ?? DEFAULT_ERROR_CODE).json({
          message: error?.response?.data?.message ?? 'Error occurred.'
        });
      } 

      next();
    });
  }

  // Inicia el servidor HTTP y configura Socket.IO
   private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
     const socketIO: Server = await this.createSocketIO(httpServer);   // Crea instancia de Socket.IO
      this.startHttpServer(httpServer);       // Levanta el servidor HTTP
      this.socketIOConnections(socketIO);       // Inicia la lógica de conexiones WebSocket
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method:', error);
    }
  } 

  // Crea instancia de Socket.IO con Redis como adaptador
   private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: `${config.CLIENT_URL}`,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient)); // Configura Redis como adaptador de WebSocket
    socketIO = io;
    return io;
  } 

  // Inicia el servidor HTTP en el puerto definido
  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      log.info(`Gateway server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  // Activa los listeners de eventos WebSocket
   private socketIOConnections(io: Server): void {
    const socketIoApp = new SocketIOAppHandler(io);
    socketIoApp.listen();
  }  
}
