import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  get environment(): string {
    // You can customize this based on your actual environment detection logic
    return 'mainnet'; // or 'testnet', 'devnet' etc.
  }
} 