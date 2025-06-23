import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications-button',
  standalone: true,
  template: `
    <button class="p-2 text-gray-600 hover:bg-slate-100 rounded-lg">
      <!-- You can add a notification icon here -->
      🔔
    </button>
  `
})
export class NotificationsButtonComponent {
} 