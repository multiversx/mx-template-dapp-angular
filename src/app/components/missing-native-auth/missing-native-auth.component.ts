import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutputContainerComponent } from '../output-container/output-container.component';

@Component({
  selector: 'app-missing-native-auth-error',
  standalone: true,
  imports: [CommonModule, OutputContainerComponent],
  template: `
    <app-output-container>
      <div class="flex items-center gap-2 text-red-600">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span>Native Auth token is missing. Please connect your wallet.</span>
      </div>
    </app-output-container>
  `,
  styles: []
})
export class MissingNativeAuthErrorComponent {}