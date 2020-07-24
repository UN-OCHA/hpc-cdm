const NOT_FOUND_ERROR = 'not_found';

export class NotFoundError extends Error {
  public readonly code = NOT_FOUND_ERROR;
  public constructor() {
    super(NOT_FOUND_ERROR);
  }
}

export const isNotFoundError = (error: Error): error is NotFoundError =>
  error instanceof NotFoundError ||
  (error && (error as NotFoundError).code === NOT_FOUND_ERROR);
