import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'groupBy'})
export class GroupByPipe implements PipeTransform {
  transform(value: Array<any>, field: string): Array<any> {
    if (value) {
      value = value.sort((a, b) => {
        if (a.definition) {
          return a.definition.order > b.definition.order ? 1 : -1;
        }

      });

      const groupedObj = value.reduce((prev, cur) => {
        if (!prev[cur[field]]) {
          prev[cur[field]] = [cur];
        } else {
          prev[cur[field]].push(cur);
        }
        prev[cur[field]].order = cur.order || 0;
        return prev;
      }, {});

      return Object.keys(groupedObj).map(key => {
        return { key, value: groupedObj[key], order: groupedObj[key].order };
      }).sort((a, b) => {
        return a.order > b.order ? 1 : -1;
      });
    }
  }
}
