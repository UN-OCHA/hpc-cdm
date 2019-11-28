import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '@hpc/core';

@Component({
  selector: 'login-link',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {
  @Input() renderType?: string;
  user: any = null;

  constructor(private auth: AuthService) {}

  ngOnInit() {}

  login() {
    this.auth.initImplicitFlow();
  }

  logout() {
    this.auth.logout();
  }
}
