import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { UnlockPageComponent } from './unlock-page.component';
import { DashboardPageComponent } from './dashboard-page.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([
      { path: '', redirectTo: 'unlock', pathMatch: 'full' },
      { path: 'unlock', component: UnlockPageComponent },
      { path: 'dashboard', component: DashboardPageComponent }
    ])
  ]
};
