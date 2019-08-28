import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-statistic',
  templateUrl: './headerStatistic.component.html',
  styleUrls: ['./headerStatistic.component.scss']
})
export class HeaderStatisticComponent {

  @Input() public label: string;
  @Input() public value: string;

  public open: boolean;

  constructor() {
  }
}
