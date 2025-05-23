import { AxiosError } from 'axios';
import { HttpException } from './exceptions';

export type ServerActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message: string; data?: unknown };
};

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  action: T,
): (...args: Parameters<T>) => Promise<ServerActionResponse<Awaited<ReturnType<T>>>> {
  return async (...args: Parameters<T>): Promise<ServerActionResponse<Awaited<ReturnType<T>>>> => {
    try {
      const data = await action(...args);
      return { success: true, data };
    } catch (err) {
      let errObj = undefined;
      if (err instanceof HttpException) {
        errObj = err.serialize();
      } else if (err instanceof AxiosError) {
        errObj = { message: 'An unknown error occurred', data: err.message };
      } else {
        errObj = { message: 'An unknown error occurred' };
      }
      console.error(err);

      return { success: false, error: errObj };
    }
  };
}
