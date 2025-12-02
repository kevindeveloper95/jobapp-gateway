import { authService } from '@gateway/services/api/auth.service';
import { winstonLogger } from '@kevindeveloper95/jobapp-shared';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@gateway/config';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'signupController', 'debug');

export class SignUp {
  public async create(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    log.info('SignUp request received', { body: req.body, origin: req.headers.origin });

    try {
      log.info('Calling auth-service signup...');
      const response: AxiosResponse = await authService.signUp(req.body);
      const duration = Date.now() - startTime;
      log.info(`Auth-service responded successfully in ${duration}ms`);

      req.session = { jwt: response.data.token };
      res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      log.log('error', `SignUp error after ${duration}ms:`, error);

      // Si el Auth Service devuelve un error, reenviar la respuesta al cliente
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        log.log('error', 'Auth-service error response:', { status: axiosError.response.status, data: axiosError.response.data });
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log.log('error', 'Unknown signup error:', errorMessage);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred during signup',
          error: errorMessage
        });
      }
    }
  }
}
