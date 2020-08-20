const NOT_FOUND_ERROR = 'not_found';
const CONFLICT_ERROR = 'conflict';

export class NotFoundError extends Error {
  public readonly code = NOT_FOUND_ERROR;
  public constructor() {
    super(NOT_FOUND_ERROR);
  }
}

export const isNotFoundError = (error: Error): error is NotFoundError =>
  error instanceof NotFoundError ||
  (error && (error as NotFoundError).code === NOT_FOUND_ERROR);

/**
 * An error thrown when a user tries to perform a task that fails because
 * another user has modified the same data in a conflicting way.
 */
export class ConflictError extends Error {
  public readonly code = CONFLICT_ERROR;
  public readonly timestamp: Date;
  public readonly otherUser: string;
  public constructor(
    /**
     * When did the other user perform the action that conflicted
     */
    timestamp: Date,
    /**
     * What is the name of the other person who is conflicting with what
     * this user is doing
     */
    otherUser: string
  ) {
    super(CONFLICT_ERROR);
    this.timestamp = timestamp;
    this.otherUser = otherUser;
  }
}

export const isConflictError = (error: Error): error is ConflictError =>
  error instanceof ConflictError ||
  (error && (error as ConflictError).code === CONFLICT_ERROR);
