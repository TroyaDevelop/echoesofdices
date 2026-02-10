export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function toHttpError(error: unknown, fallbackStatus = 500, fallbackMessage = 'Ошибка сервера'): HttpError {
  if (error instanceof HttpError) return error;
  const message = error instanceof Error ? error.message : fallbackMessage;
  return new HttpError(fallbackStatus, message || fallbackMessage);
}
