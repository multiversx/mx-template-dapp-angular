import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { ButtonComponent } from '../../components/button/button.component';
import {
  PingPongOutputComponent,
  SignedTransactionType,
} from '../../components/ping-pong-output/ping-pong-output.component';
import { contractAddress } from '../../../config';
import { PingPongService } from '../../services/ping-pong.service';
import {
  formatTimeRemaining,
  getCountdownSeconds,
  setTimeRemaining,
} from '../../helpers/countdown.helpers';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ping-pong-raw',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OutputContainerComponent,
    ButtonComponent,
    PingPongOutputComponent,
  ],
  templateUrl: './ping-pong-raw.component.html',
  styleUrls: ['./ping-pong-raw.component.css'],
})
export class PingPongRawComponent implements OnInit, OnDestroy {
  contractAddress = contractAddress;
  hasPing: boolean = true;
  secondsLeft: number = 0;
  pongAllowed: boolean = false;
  hasPendingTransactions: boolean = false;
  timeRemaining: string = '00:00';
  transactions: SignedTransactionType[] = [];
  pingAmount: string = '';

  // FontAwesome icons
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;

  private subscriptions: Subscription[] = [];
  private countdownCleanup?: (() => void) | null;

  constructor(private pingPongService: PingPongService) {}

  ngOnInit() {
    this.pingAmount = this.pingPongService.getPingAmount();
    this.checkPendingTransactions();
    this.setSecondsRemaining();
    this.subscribeToServices();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.countdownCleanup) {
      this.countdownCleanup();
    }
  }

  private subscribeToServices() {
    // Subscribe to ping amount changes
    const pingAmountSub = this.pingPongService.pingAmount$.subscribe(amount => {
      this.pingAmount = amount;
    });
    this.subscriptions.push(pingAmountSub);

    // Subscribe to time to pong changes
    const timeToPongSub = this.pingPongService.timeToPong$.subscribe(
      timeToPong => {
        const { canPing, timeRemaining } = setTimeRemaining(timeToPong);
        this.hasPing = canPing;

        if (timeRemaining !== undefined) {
          this.secondsLeft = timeRemaining;
          this.updateTimeRemaining();
          this.pongAllowed = timeRemaining === 0;

          if (timeRemaining > 0) {
            this.startCountdown();
          }
        } else {
          // When timeRemaining is undefined (null/undefined case)
          this.secondsLeft = 0;
          this.timeRemaining = '00:00';
          this.pongAllowed = false;
        }
      }
    );
    this.subscriptions.push(timeToPongSub);
  }

  private checkPendingTransactions() {
    const pendingTransactions = this.pingPongService.getPendingTransactions();
    this.hasPendingTransactions = pendingTransactions.length > 0;

    // Convert to our SignedTransactionType format
    this.transactions = pendingTransactions.map(tx => ({
      hash: tx.hash || '',
      receiver: tx.receiver || '',
      value: tx.value || '0',
      gasPrice: tx.gasPrice?.toString() || '0',
      gasLimit: tx.gasLimit?.toString() || '0',
      data: tx.data || '',
    }));
  }

  private async setSecondsRemaining() {
    const secondsRemaining = await this.pingPongService.getTimeToPong();
    const { canPing, timeRemaining } = setTimeRemaining(secondsRemaining);

    this.hasPing = canPing;

    if (timeRemaining !== undefined) {
      this.secondsLeft = timeRemaining;
      this.updateTimeRemaining();
      this.pongAllowed = timeRemaining === 0;

      if (timeRemaining > 0) {
        this.startCountdown();
      }
    } else {
      // When timeRemaining is undefined (null/undefined case)
      this.secondsLeft = 0;
      this.timeRemaining = '00:00';
      this.pongAllowed = false;
    }
  }

  private updateTimeRemaining() {
    this.timeRemaining = formatTimeRemaining(this.secondsLeft);
  }

  private startCountdown() {
    if (this.countdownCleanup) {
      this.countdownCleanup();
    }

    this.countdownCleanup = getCountdownSeconds({
      secondsLeft: this.secondsLeft,
      setSecondsLeft: (seconds: number) => {
        this.secondsLeft = seconds;
        this.updateTimeRemaining();
        this.pongAllowed = seconds === 0;
      },
    });
  }

  async onSendPingTransaction() {
    try {
      console.log('Sending ping transaction...');
      await this.pingPongService.sendPingTransaction(this.pingAmount);
      this.hasPendingTransactions = true;
      this.checkPendingTransactions();
    } catch (error) {
      console.error('Error sending ping transaction:', error);
      this.hasPendingTransactions = false;
    }
  }

  async onSendPongTransaction() {
    try {
      console.log('Sending pong transaction...');
      await this.pingPongService.sendPongTransaction();
      this.hasPendingTransactions = true;
      this.checkPendingTransactions();
    } catch (error) {
      console.error('Error sending pong transaction:', error);
      this.hasPendingTransactions = false;
    }
  }
}
