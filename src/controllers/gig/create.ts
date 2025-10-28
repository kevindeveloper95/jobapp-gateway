import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gig.service';

export class Create {
  public async gig(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await gigService.createGig(req.body);
      res.status(StatusCodes.CREATED).json({ message: response.data.message, gig: response.data.gig });
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
          message: 'An error occurred creating gig',
          error: error.message 
        });
      }
    }
  }
}