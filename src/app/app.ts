import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UnlockPageComponent } from './unlock-page.component';
import { DashboardPageComponent } from './dashboard-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css'
})
export class App {}
