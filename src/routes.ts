import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health';
import { authRoutes } from '@gateway/routes/auth';
import { currentUserRoutes } from '@gateway/routes/current-user';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { searchRoutes } from '@gateway/routes/search';
import { buyerRoutes } from '@gateway/routes/buyer';
import { sellerRoutes } from '@gateway/routes/seller';
import { gigRoutes } from '@gateway/routes/gig';
import { messageRoutes } from '@gateway/routes/message';
import { orderRoutes } from '@gateway/routes/order';
import { reviewRoutes } from '@gateway/routes/review';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  try {
    console.log('[ROUTES] Registering health routes at root');
    app.use('', healthRoutes.routes());
    console.log('[ROUTES] Registering auth routes at', BASE_PATH);
    app.use(BASE_PATH, authRoutes.routes());
    console.log('[ROUTES] Registering search routes at', BASE_PATH);
    app.use(BASE_PATH, searchRoutes.routes());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, buyerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, sellerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, gigRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, messageRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, orderRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reviewRoutes.routes());
    console.log('[ROUTES] All routes registered successfully');
  } catch (error) {
    console.error('[ROUTES] Error registering routes:', error);
    throw error;
  }
};
