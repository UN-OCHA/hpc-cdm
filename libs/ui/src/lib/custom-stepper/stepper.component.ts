import { ChangeDetectorRef, Input, Output, Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Directionality } from '@angular/cdk/bidi';
import { CdkStepper } from '@angular/cdk/stepper';


@Component({
  selector: 'custom-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: [ './stepper.component.scss' ],
  providers: [{ provide: CdkStepper, useExisting: CustomStepperComponent }],
})
export class CustomStepperComponent extends CdkStepper {
  @Input() allSteps;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  router: Router;

  constructor(
    dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
    router: Router) {
    super(dir, changeDetectorRef);
    this.router = router;
  }

  onClick(index: number): void {
    this.navigateTo(index);
  }

  navigateTo(index: number) {
    this.change.emit(index);
    this.selectedIndex = index;
    console.log(this.allSteps[index].route)
    this.router.navigate(this.allSteps[index].route);
  }
}
