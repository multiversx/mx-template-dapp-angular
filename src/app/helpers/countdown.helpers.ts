import { timer, Observable, Subject } from 'rxjs';
import { map, takeWhile, finalize, switchMap, retry } from 'rxjs/operators';

export interface CountdownConfig {
  initialSeconds: number;
  onTick?: (secondsLeft: number) => void;
  onComplete?: () => void;
}

/**
 * Creates a countdown observable that emits remaining seconds
 * This replaces the problematic setInterval approach with RxJS
 */
export function createCountdown(config: CountdownConfig): Observable<number> {
  const { initialSeconds, onTick, onComplete } = config;

  if (initialSeconds <= 0) {
    return new Observable(subscriber => {
      subscriber.next(0);
      subscriber.complete();
      if (onComplete) onComplete();
    });
  }

  return timer(0, 1000).pipe(
    map(tick => Math.max(0, initialSeconds - tick)),
    map(secondsLeft => {
      if (onTick) onTick(secondsLeft);
      return secondsLeft;
    }),
    takeWhile(secondsLeft => secondsLeft >= 0, true), // Include the final 0 emission
    finalize(() => {
      if (onComplete) onComplete();
    })
  );
}

/**
 * Determines ping/pong state based on time remaining
 * Handles null/undefined cases properly
 */
export function calculatePingPongState(secondsRemaining?: number | null): {
  canPing: boolean;
  canPong: boolean;
  timeRemaining?: number;
} {
  switch (secondsRemaining) {
    case undefined:
    case null:
      return {
        canPing: true,
        canPong: false,
      };
    case 0:
      return {
        timeRemaining: 0,
        canPing: false,
        canPong: true,
      };
    default: {
      return {
        timeRemaining: secondsRemaining,
        canPing: false,
        canPong: false,
      };
    }
  }
}

/**
 * Formats seconds into MM:SS format
 */
export function formatTimeRemaining(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '00:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Creates a safe polling observable that can be easily cancelled
 */
export function createPollingObservable<T>(
  pollingFunction: () => Observable<T>,
  intervalMs: number = 5000
): Observable<T> {
  return timer(0, intervalMs).pipe(
    switchMap(() => pollingFunction()),
    retry({ delay: 1000, count: 3 }) // Retry failed requests with delay
  );
}

/**
 * Angular-specific utility for managing subscription cleanup
 * Alternative to the manual subscription tracking
 */
export class SubscriptionManager {
  private destroy$ = new Subject<void>();

  /**
   * Get the destroy subject for use with takeUntil
   */
  get untilDestroyed$(): Observable<void> {
    return this.destroy$.asObservable();
  }

  /**
   * Call this in ngOnDestroy to clean up all subscriptions
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
