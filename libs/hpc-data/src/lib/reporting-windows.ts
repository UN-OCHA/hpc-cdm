export interface ReportingWindow {
  id: number;
  name: string;
  /**
   * * `pending` - The window has not yet been opened for data entry, but can
   *   be given new assignments.
   * * `open` - The window is currently open to receive data entry.
   * * `closed` - The window is no longer open to data entry.
   */
  state: 'pending' | 'open' | 'closed';
}
