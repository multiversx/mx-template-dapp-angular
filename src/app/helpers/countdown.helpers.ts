export function getCountdownSeconds(config: {
  secondsLeft: number;
  setSecondsLeft: (seconds: number) => void;
}): (() => void) | null {
  const { secondsLeft, setSecondsLeft } = config;

  if (secondsLeft) {
    let currentSeconds = secondsLeft;

    const interval = setInterval(() => {
      if (currentSeconds > 0) {
        currentSeconds = currentSeconds - 1;
        setSecondsLeft(currentSeconds);
      } else {
        clearInterval(interval);
        setSecondsLeft(0);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }

  return null;
}

// null and undefined comes when timeToPong response does not contain returnData
// it cannot be set as 0 because it will display the countdown and will disable canPing
// if it is null/undefined then action of ping can be made
export function setTimeRemaining(secondsRemaining?: null | number): {
  canPing: boolean;
  timeRemaining?: number;
} {
  switch (secondsRemaining) {
    case undefined:
    case null:
      return {
        canPing: true,
      };
    case 0:
      return {
        timeRemaining: 0,
        canPing: false,
      };
    default: {
      return {
        timeRemaining: secondsRemaining,
        canPing: false,
      };
    }
  }
}

export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}
