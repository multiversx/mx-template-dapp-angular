import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { UnlockPageComponent } from './unlock-page/unlock-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { AuthRedirectGuard } from './guards/auth-redirect.guard';
import { RouteNamesEnum } from './route-names.enum';
import { GlobalErrorHandlerService } from './services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    // Global Error Handler
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    provideRouter([
      {
        path: '',
        redirectTo: RouteNamesEnum.unlock.substring(1), // Remove the leading slash
        pathMatch: 'full',
      },
      {
        path: RouteNamesEnum.unlock.substring(1), // Remove the leading slash
        component: UnlockPageComponent,
        canActivate: [AuthRedirectGuard],
      },
      {
        path: RouteNamesEnum.dashboard.substring(1), // Remove the leading slash
        component: DashboardPageComponent,
        canActivate: [AuthRedirectGuard],
        data: { requireAuth: true },
      },
      {
        path: RouteNamesEnum.disclaimer.substring(1), // Remove the leading slash
        redirectTo: RouteNamesEnum.unlock.substring(1), // For now, redirect to unlock
      },
    ]),
  ],
};
