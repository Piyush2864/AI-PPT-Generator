import { Response } from 'express';

interface SuccessPayload<T> {
  success: true;
  message: string;
  data?: T;
}


export const sendSuccess = <T>(res: Response, statusCode: number, message: string, data?: T) => {
  const payload: SuccessPayload<T> = { success: true, message, data };
  return res.status(statusCode).json(payload);
};
