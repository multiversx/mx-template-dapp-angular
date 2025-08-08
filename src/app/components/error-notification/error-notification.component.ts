import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faExclamationTriangle,
  faExclamationCircle,
  faInfoCircle,
  faTimes,
  faRedo,
  faWallet,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  GlobalErrorHandlerService,
  ErrorNotification,
  ErrorSeverityEnum,
  ErrorCategoryEnum,
} from '../../services/global-error-handler.service';

@Component({
  selector: 'app-error-notification',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.css'],
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  errorNotifications: ErrorNotification[] = [];
  isVisible = false;

  // FontAwesome icons
  faExclamationTriangle = faExclamationTriangle;
  faExclamationCircle = faExclamationCircle;
  faInfoCircle = faInfoCircle;
  faTimes = faTimes;
  faRedo = faRedo;
  faWallet = faWallet;
  faDollarSign = faDollarSign;

  // Expose enums to template
  ErrorSeverity = ErrorSeverityEnum;
  ErrorCategory = ErrorCategoryEnum;

  constructor(private errorHandler: GlobalErrorHandlerService) {}

  ngOnInit() {
    // Subscribe to error notifications
    this.errorHandler.errorNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.errorNotifications = notifications.filter(n => !n.dismissed);
      });

    this.errorHandler.isShowingError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isVisible => {
        this.isVisible = isVisible;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get appropriate icon for error severity and category
   */
  getErrorIcon(error: ErrorNotification) {
    switch (error.error.category) {
      case ErrorCategoryEnum.AUTHENTICATION:
        return this.faWallet;
      case ErrorCategoryEnum.INSUFFICIENT_FUNDS:
        return this.faDollarSign;
      case ErrorCategoryEnum.NETWORK:
        return this.faExclamationCircle;
      default:
        switch (error.error.severity) {
          case ErrorSeverityEnum.CRITICAL:
          case ErrorSeverityEnum.HIGH:
            return this.faExclamationTriangle;
          case ErrorSeverityEnum.MEDIUM:
            return this.faExclamationCircle;
          case ErrorSeverityEnum.LOW:
            return this.faInfoCircle;
          default:
            return this.faExclamationCircle;
        }
    }
  }

  /**
   * Get CSS classes for error severity
   */
  getErrorClasses(error: ErrorNotification): string {
    const baseClasses =
      'error-notification p-4 mb-3 rounded-lg shadow-md border-l-4 flex items-start space-x-3';

    switch (error.error.severity) {
      case ErrorSeverityEnum.CRITICAL:
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case ErrorSeverityEnum.HIGH:
        return `${baseClasses} bg-red-50 border-red-400 text-red-700`;
      case ErrorSeverityEnum.MEDIUM:
        return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case ErrorSeverityEnum.LOW:
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-400 text-gray-800`;
    }
  }

  /**
   * Get icon color classes
   */
  getIconClasses(error: ErrorNotification): string {
    switch (error.error.severity) {
      case ErrorSeverityEnum.CRITICAL:
        return 'text-red-600';
      case ErrorSeverityEnum.HIGH:
        return 'text-red-500';
      case ErrorSeverityEnum.MEDIUM:
        return 'text-yellow-600';
      case ErrorSeverityEnum.LOW:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Dismiss specific error
   */
  dismissError(errorId: string) {
    this.errorHandler.dismissError(errorId);
  }

  /**
   * Clear all errors
   */
  clearAllErrors() {
    this.errorHandler.clearAllErrors();
  }

  /**
   * Handle actionable error action
   */
  handleAction(error: ErrorNotification) {
    if (!error.error.actionable) {
      return;
    }

    // Dismiss error after action
    this.dismissError(error.id);
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString();
  }

  /**
   * Get severity display name
   */
  getSeverityDisplayName(severity: ErrorSeverityEnum): string {
    switch (severity) {
      case ErrorSeverityEnum.CRITICAL:
        return 'Critical';
      case ErrorSeverityEnum.HIGH:
        return 'Error';
      case ErrorSeverityEnum.MEDIUM:
        return 'Warning';
      case ErrorSeverityEnum.LOW:
        return 'Info';
      default:
        return 'Unknown';
    }
  }

  /**
   * TrackBy function for error notifications
   */
  trackByErrorId(index: number, item: ErrorNotification): string {
    return item.id;
  }
}
