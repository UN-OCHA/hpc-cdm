<<<<<<< HEAD
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, ModeService } from '@hpc/core';
=======
import { Component, OnInit, ViewChild, Renderer2} from '@angular/core';
import { AuthService } from '@hpc/core';
import { OperationService } from '@cdm/core';
import { MatMenuTrigger } from '@angular/material/menu';

>>>>>>> cdm-dev

const TITLES = {
  'add': 'New Operation',
  'edit': 'Edit Operation',
  'list': 'Operations'
}

@Component({
  selector: 'operations',
  templateUrl: './operations.component.html',
  styleUrls: [ './operations.component.scss' ],
})
<<<<<<< HEAD
export class OperationsComponent implements OnInit, OnDestroy {
  title: string;
  mode: string;
  readonly user$ = this.authService.user$;

  constructor(
    private authService: AuthService,
    private modeService: ModeService){}
=======
export class OperationsComponent implements OnInit {
  @ViewChild('clickHoverMenuTrigger',{static:false}) clickHoverMenuTrigger: MatMenuTrigger;
  title: string;
  enteredButton = false;
  isMatMenuOpen = false;
  user;

  constructor(
    private authService: AuthService,
    private operationService: OperationService,
    private ren: Renderer2){
    this.user = this.authService.user;
  }
>>>>>>> cdm-dev

  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
      this.title =  TITLES[mode];
    });
  }
<<<<<<< HEAD

  ngOnDestroy() {
    // this.modeService.mode$.unsubscribe();
=======
  // openOnMouseOver() {
  //   this.clickHoverMenuTrigger.openMenu();
  // }
  // closeOnMouseLeave() {
  //   this.clickHoverMenuTrigger.closeMenu();
  // }
  menuEnter() {
    this.isMatMenuOpen = true;
  }

  menuLeave(trigger, button) {
    setTimeout(() => {
      if (!this.enteredButton) {
        this.isMatMenuOpen = false;
        trigger.closeMenu();
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.isMatMenuOpen = false;
      }
    }, 80)
  }

  buttonEnter(trigger) {
    console.log('buttonEnter');
    setTimeout(() => {
      if (!this.isMatMenuOpen) {
        this.enteredButton = true;
        trigger.openMenu();
        this.ren.removeClass(trigger.menu.items.first['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(trigger.menu.items.first['_elementRef'].nativeElement, 'cdk-program-focused');
      }
      else {
        this.enteredButton = true;
      }
    })
  }

  buttonLeave(trigger, button) {
    setTimeout(() => {
      if (this.enteredButton && !this.isMatMenuOpen) {
        trigger.closeMenu();
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } if (!this.isMatMenuOpen) {
        trigger.closeMenu();
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(button['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.enteredButton = false;
      }
    }, 100)
>>>>>>> cdm-dev
  }
}
