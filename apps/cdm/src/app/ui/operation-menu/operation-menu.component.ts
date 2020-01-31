import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { AppService, OperationService } from '@cdm/core';
import { Operation, User } from '@hpc/data';
import { AuthService } from '@hpc/core';
import { MatMenuTrigger } from '@angular/material/menu';


@Component({
  selector: 'operation-menu',
  templateUrl: './operation-menu.component.html',
  styleUrls: ['./operation-menu.component.scss']
})
export class OperationMenuComponent implements OnInit {
  @ViewChild('clickHoverMenuTrigger',{static:false}) clickHoverMenuTrigger1: MatMenuTrigger;
  op: Operation;
  user: User;
  enteredButton = false;
  isMatMenuOpen = false;

  constructor(
    private auth: AuthService,
    private app: AppService,
    private operation: OperationService,
    private ren: Renderer2) {}

  ngOnInit() {
    this.operation.operation$.subscribe(op => {
      this.op = op;
      console.log(this.op);

    });
    this.auth.user$.subscribe(user => {
      this.user = user;
    })
  }
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
