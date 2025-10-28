import { authService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class SignUp {
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await authService.signUp(req.body);
      req.session = { jwt: response.data.token };
      res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
    } catch (error: any) {
      // Si el Auth Service devuelve un error, reenviar la respuesta al cliente
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
          message: 'An error occurred during signup',
          error: error.message 
        });
      }
    }
  }
}