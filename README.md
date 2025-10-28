# Gateway Service

## Description
The **Gateway Service** is the main API gateway and entry point for the JobApp application. This service acts as a reverse proxy, routing requests to appropriate microservices, handling authentication, rate limiting, and providing real-time communication through WebSockets.

## Technologies Used / Tecnologías Utilizadas

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **Redis** - Caching and session management
- **JWT** - JSON Web Tokens for authentication
- **Axios** - HTTP client for service communication
- **Elasticsearch** - Logging and search
- **Winston** - Logging system
- **Jest** - Testing framework
- **PM2** - Process manager for production

## Main Features / Características Principales

### 🌐 API Gateway
The service routes requests to appropriate microservices:

- **Authentication Routes** - User auth operations
- **User Management** - User profile operations
- **Gig Management** - Job posting operations
- **Order Management** - Order processing
- **Review System** - User reviews and ratings
- **Chat System** - Real-time messaging
- **Health Checks** - Service health monitoring

### 🔌 Real-time Communication
- **WebSocket Support** with Socket.io
- **Redis Adapter** for horizontal scaling
- **Real-time Chat** functionality
- **Live Notifications** system

### 🔐 Authentication & Authorization
- **JWT Token Validation**
- **Request Authentication**
- **Rate Limiting**
- **CORS Management**

### 📊 Monitoring and Logging
- Integration with **Elasticsearch** for centralized logging
- Structured logging with **Winston**
- Support for **Elastic APM** for performance monitoring

## Project Structure / Estructura del Proyecto

```
gateway-service/
├── src/
│   ├── app.ts              # Application entry point
│   ├── server.ts           # Express server configuration
│   ├── config.ts           # Service configuration
│   ├── routes.ts           # Main route definitions
│   ├── elasticsearch.ts    # Elasticsearch configuration
│   ├── controllers/        # Request handlers
│   │   ├── auth/           # Authentication controllers
│   │   ├── gig/            # Gig management controllers
│   │   ├── message/        # Message controllers
│   │   ├── order/          # Order controllers
│   │   ├── review/         # Review controllers
│   │   └── users/          # User controllers
│   ├── routes/             # Route definitions
│   ├── services/           # Business logic
│   │   └── api/            # API service calls
│   ├── sockets/            # WebSocket handlers
│   └── redis/              # Redis configuration
├── coverage/              # Test coverage reports
├── Dockerfile             # Docker image for production
├── Dockerfile.dev         # Docker image for development
└── package.json           # Dependencies and scripts
```

## Environment Variables / Variables de Entorno

The service requires the following environment variables:

```env
NODE_ENV=development|production
JWT_TOKEN=<JWT_SECRET_TOKEN>
GATEWAY_JWT_TOKEN=<GATEWAY_JWT_TOKEN>
SECRET_KEY_ONE=<SECRET_KEY_1>
SECRET_KEY_TWO=<SECRET_KEY_2>
CLIENT_URL=<CLIENT_URL>
AUTH_BASE_URL=<AUTH_SERVICE_URL>
USERS_BASE_URL=<USERS_SERVICE_URL>
GIG_BASE_URL=<GIG_SERVICE_URL>
MESSAGE_BASE_URL=<MESSAGE_SERVICE_URL>
ORDER_BASE_URL=<ORDER_SERVICE_URL>
REVIEW_BASE_URL=<REVIEW_SERVICE_URL>
REDIS_HOST=<REDIS_URL>
ELASTIC_SEARCH_URL=<ELASTICSEARCH_URL>
ENABLE_APM=0|1
ELASTIC_APM_SERVER_URL=<APM_URL>
ELASTIC_APM_SECRET_TOKEN=<APM_TOKEN>
```

## Available Scripts / Scripts Disponibles

### Development / Desarrollo
```bash
npm run dev          # Start server in development mode with hot reload
npm run lint:check   # Check code with ESLint
npm run lint:fix     # Automatically fix linting errors
npm run prettier:check # Check code formatting
npm run prettier:fix   # Format code automatically
```

### Production / Producción
```bash
npm run build        # Compile TypeScript
npm start           # Start service with PM2 (5 instances)

npm stop            # Stop all PM2 instances
npm run delete      # Delete all PM2 instances
```

### Testing / Testing
```bash
npm test            # Run all tests with coverage
```

## Deployment / Despliegue

### Docker
The service includes Docker configuration:

- **Dockerfile**: For production
- **Dockerfile.dev**: For development

### PM2
In production, the service runs with PM2 in cluster mode (5 instances) for high availability.

## Integration with Other Services / Integración con Otros Servicios

This microservice integrates with:

- **Auth Service**: For authentication and user management
- **Users Service**: For user profile operations
- **Gig Service**: For job posting management
- **Order Service**: For order processing
- **Review Service**: For user reviews
- **Chat Service**: For real-time messaging
- **Redis**: For caching and session management
- **Elasticsearch**: For centralized logging and search
- **Shared Library** (`@kevindeveloper95/jobapp-shared`): Shared utilities

## Workflow / Flujo de Trabajo

1. **Request Reception**: Incoming HTTP requests are received
2. **Authentication**: JWT tokens are validated
3. **Routing**: Requests are routed to appropriate microservices
4. **Response Aggregation**: Responses from microservices are aggregated
5. **Real-time Communication**: WebSocket connections are managed
6. **Logging**: All activities are logged in Elasticsearch

## Development / Desarrollo

To contribute to service development:

1. Install dependencies: `npm install`
2. Configure environment variables
3. Run in development mode: `npm run dev`
4. Run tests: `npm test`
5. Check linting: `npm run lint:check`

## Versioning / Versionado

Current version: **1.0.0**

The service uses semantic versioning for release control.

---

# Servicio de Gateway

## Descripción
El **Servicio de Gateway** es el punto de entrada principal y gateway de API para la aplicación JobApp. Este servicio actúa como un proxy inverso, enrutando solicitudes a los microservicios apropiados, manejando autenticación, limitación de velocidad y proporcionando comunicación en tiempo real a través de WebSockets.

## Características Principales

### 🌐 Gateway de API
El servicio enruta las solicitudes a los microservicios apropiados:

- **Rutas de Autenticación** - Operaciones de autenticación de usuarios
- **Gestión de Usuarios** - Operaciones de perfil de usuario
- **Gestión de Gigs** - Operaciones de publicación de trabajos
- **Gestión de Órdenes** - Procesamiento de órdenes
- **Sistema de Reseñas** - Reseñas y calificaciones de usuarios
- **Sistema de Chat** - Mensajería en tiempo real
- **Verificaciones de Salud** - Monitoreo de salud del servicio

### 🔌 Comunicación en Tiempo Real
- **Soporte WebSocket** con Socket.io
- **Adaptador Redis** para escalado horizontal
- **Chat en Tiempo Real** funcionalidad
- **Sistema de Notificaciones** en vivo

### 🔐 Autenticación y Autorización
- **Validación de Tokens JWT**
- **Autenticación de Solicitudes**
- **Limitación de Velocidad**
- **Gestión CORS**

### 📊 Monitoreo y Logging
- Integración con **Elasticsearch** para centralización de logs
- Logging estructurado con **Winston**
- Soporte para **Elastic APM** para monitoreo de rendimiento

## Flujo de Trabajo

1. **Recepción de Solicitudes**: Las solicitudes HTTP entrantes son recibidas
2. **Autenticación**: Los tokens JWT son validados
3. **Enrutamiento**: Las solicitudes son enrutadas a los microservicios apropiados
4. **Agregación de Respuestas**: Las respuestas de los microservicios son agregadas
5. **Comunicación en Tiempo Real**: Las conexiones WebSocket son gestionadas
6. **Logging**: Todas las actividades son registradas en Elasticsearch 