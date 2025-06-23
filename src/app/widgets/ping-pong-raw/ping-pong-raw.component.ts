import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { LabelComponent } from '../../components/label/label.component';
import { ButtonComponent } from '../../components/button/button.component';
import { contractAddress } from '../../../config';

@Component({
  selector: 'app-ping-pong-raw',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, OutputContainerComponent, LabelComponent, ButtonComponent],
  templateUrl: './ping-pong-raw.component.html',
  styleUrls: ['./ping-pong-raw.component.css']
})
export class PingPongRawComponent implements OnInit {
  contractAddress = contractAddress;
  hasPing: boolean = true;
  secondsLeft: number = 0;
  pongAllowed: boolean = false;
  hasPendingTransactions: boolean = false;
  timeRemaining: string = '00:00';
  
  // FontAwesome icons
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;

  ngOnInit() {
    // Initialize component state
    this.checkPingPongState();
  }

  private checkPingPongState() {
    // Mock implementation - in real app, you'd check actual contract state
    this.hasPing = true;
    this.secondsLeft = 30;
    this.pongAllowed = this.secondsLeft === 0;
    this.updateTimeRemaining();
  }

  private updateTimeRemaining() {
    const minutes = Math.floor(this.secondsLeft / 60);
    const seconds = this.secondsLeft % 60;
    this.timeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async onSendPingTransaction() {
    console.log('Sending ping transaction...');
    // Implement ping transaction logic
    this.hasPendingTransactions = true;
    
    // Mock transaction completion
    setTimeout(() => {
      this.hasPendingTransactions = false;
      this.hasPing = false;
      this.secondsLeft = 30;
      this.startCountdown();
    }, 2000);
  }

  async onSendPongTransaction() {
    console.log('Sending pong transaction...');
    // Implement pong transaction logic
    this.hasPendingTransactions = true;
    
    // Mock transaction completion
    setTimeout(() => {
      this.hasPendingTransactions = false;
      this.hasPing = true;
      this.secondsLeft = 0;
      this.pongAllowed = false;
    }, 2000);
  }

  private startCountdown() {
    const interval = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
        this.updateTimeRemaining();
      } else {
        this.pongAllowed = true;
        clearInterval(interval);
      }
    }, 1000);
  }
} 