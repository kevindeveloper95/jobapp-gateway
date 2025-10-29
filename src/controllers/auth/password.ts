import { authService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Password {
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await authService.forgotPassword(req.body.email);
      res.status(StatusCodes.OK).json({ message: response.data.message });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred during forgot password',
          error: errorMessage
        });
      }
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { password, confirmPassword } = req.body;
      const response: AxiosResponse = await authService.resetPassword(req.params.token, password, confirmPassword);
      res.status(StatusCodes.OK).json({ message: response.data.message });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred during reset password',
          error: errorMessage
        });
      }
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const response: AxiosResponse = await authService.changePassword(currentPassword, newPassword);
      res.status(StatusCodes.OK).json({ message: response.data.message });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred during change password',
          error: errorMessage
        });
      }
    }
  }
}
