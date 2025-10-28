import { authService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class SignIn {
  public async read(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await authService.signIn(req.body);
      const { message, user, token, browserName, deviceType } = response.data;
      req.session = { jwt: token };
      res.status(StatusCodes.OK).json({ message, user, browserName, deviceType });
    } catch (error: any) {
      // Si el Auth Service devuelve un error, reenviar la respuesta al cliente
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
          message: 'An error occurred during signin',
          error: error.message 
        });
      }
    }
  }
}