import { Injectable } from '@nestjs/common';
import { Operation } from '@hpc/data';

@Injectable()
export class AppService {
  operations: Operation[] = [{}, {}];

  get operations: Operation[] {
    return this.operations;
  }
}
