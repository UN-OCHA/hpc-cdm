import { Component, OnInit, ViewChild, Renderer2} from '@angular/core';
import { AuthService } from '@hpc/core';
import { OperationService } from '@cdm/core';
import { MatMenuTrigger } from '@angular/material/menu';


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

  ngOnInit() {
    this.operationService.mode$.subscribe(mode => {
      this.title =  TITLES[mode];
    });
  }
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
  }
}
