import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterTarget'
})

export class FilterTargetPipe implements PipeTransform {
  transform(totals: any[]): any {
    let target = 0;
    totals.forEach(metric => {
      if ( metric.type === 'target') {
        target = metric.value;
      }
    });
    return target;
  }
}
