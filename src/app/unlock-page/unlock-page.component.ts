import { Component } from '@angular/core';
import { ConnectButtonComponent } from '../components/connect-button.component';

@Component({
  selector: 'app-unlock-page',
  standalone: true,
  imports: [ConnectButtonComponent],
  templateUrl: './unlock-page.component.html',
  styleUrls: ['./unlock-page.component.css']
})
export class UnlockPageComponent {
} 