export interface SessionUser {
  name: string;
}

/**
 * An interface that encapsulates the current session.
 */
export interface Session {
  /**
   * Get the currently logged-in user.
   *
   * This value will never change once established.
   */
  getUser(): null | SessionUser;
  /**
   * Do whatever is neccesary to log the user in to the system. Usually this
   * would be a redirect to HID, but in the case of e.g. the dummy
   * implementation, this may simply refresh the page after performing an action.
   */
  logIn(): void;
  /**
   * Log the user out of the system.
   */
  logOut(): void;
}
