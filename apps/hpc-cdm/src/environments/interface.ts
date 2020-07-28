import { Session } from '@unocha/hpc-core';
import { Model } from '@unocha/hpc-data';

export interface Environment {
  session: Session;
  model: Model;
}
