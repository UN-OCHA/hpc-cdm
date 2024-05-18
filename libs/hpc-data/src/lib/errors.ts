const NOT_FOUND_ERROR = 'not_found';
const ABORT_ERROR = 'abort_error';
const CONFLICT_ERROR = 'conflict';
const DUPLICATE_ERROR = 'duplicate';
const USER_ERROR = 'user_error';
const CONSISTENCY_ERROR = 'consistency';

export const USER_ERROR_KEYS = [
  'access.userAlreadyInvited',
  'access.userAlreadyAdded',
  'assignment.alreadyFinalized',
] as const;

export type UserErrorKey = (typeof USER_ERROR_KEYS)[number];

export class NotFoundError extends Error {
  public readonly code = NOT_FOUND_ERROR;
  public constructor() {
    super(NOT_FOUND_ERROR);
  }
}

export class AbortError extends Error {
  public readonly code = ABORT_ERROR;
  public constructor() {
    super(ABORT_ERROR);
  }
}
export const isNotFoundError = (error: Error): error is NotFoundError =>
  error instanceof NotFoundError ||
  (error && (error as NotFoundError).code === NOT_FOUND_ERROR);

export const isUserAbortError = (error: Error): error is AbortError =>
  error instanceof AbortError ||
  (error && (error as AbortError).name === 'AbortError');

export class UserError extends Error {
  public readonly code = USER_ERROR;
  public readonly key: UserErrorKey;
  public constructor(key: UserErrorKey) {
    super(key);
    this.key = key;
  }
}

export const isUserError = (error: Error): error is UserError =>
  error instanceof UserError ||
  (error && (error as UserError).code === USER_ERROR);

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

/**
 * An error thrown when the user creates a new Entity with a
 * duplicated primary key of an already existing one
 */
export class DuplicateError extends Error {
  public readonly code = DUPLICATE_ERROR;
  public readonly details: string;
  public readonly table: string;
  public readonly key: string;
  public readonly value: string;
  public constructor(
    /**
     * Details where we can get the field and key that is conflicting
     */
    details: string,
    /**
     * Table where conflicts appear
     */
    table: string
  ) {
    super(DUPLICATE_ERROR);
    this.details = details;
    this.table = table;
    const match = /^Key \(([.]+)\)=\((.+)\) already exists\.$/.exec(details);
    if (match) {
      const [, key, value] = match;
      this.key = key;
      this.value = value;
    } else {
      this.key = 'ERROR WHILE APPLYING REGEX';
      this.value = 'ERROR WHILE APPLYING REGEX';
    }
  }
}

export const isDuplicateError = (error: Error): error is DuplicateError =>
  error instanceof DuplicateError ||
  (error && (error as DuplicateError).code === DUPLICATE_ERROR);

export class ConsistencyError extends Error {
  public readonly code = CONSISTENCY_ERROR;
  public readonly reason: any[];
  public readonly message: string;
  public constructor(reason: any[], message: string) {
    super(CONFLICT_ERROR);
    this.reason = reason;
    this.message = message;
  }
}
