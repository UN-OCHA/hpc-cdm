import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'unCamelCase'})
export class UnCamelCasePipe implements PipeTransform {
  transform(value: string): string {
    const valueArray = value.split(/(?=[A-Z])/);
    valueArray[0] = valueArray[0][0].toUpperCase() + valueArray[0].substr(1);
    return valueArray.join(' ');
  }
}
