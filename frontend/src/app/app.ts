import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { NotificationsComponent } from './components/notifications.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NotificationsComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-notifications></app-notifications>
  `
})
export class App {
  protected title = 'E-Commerce App';
}
