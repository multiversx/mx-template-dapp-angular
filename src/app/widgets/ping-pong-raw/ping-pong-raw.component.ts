import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { LabelComponent } from '../../components/label/label.component';
import { ButtonComponent } from '../../components/button/button.component';
import { contractAddress } from '../../../config';
import { getAccount } from '@multiversx/sdk-dapp/out/methods/account/getAccount';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { refreshAccount } from '@multiversx/sdk-dapp/out/utils/account/refreshAccount';
import { TransactionManager } from '@multiversx/sdk-dapp/out/managers/TransactionManager';
import { getStore } from '@multiversx/sdk-dapp/out/store/store';
import { transactionsSliceSelector } from '@multiversx/sdk-dapp/out/store/selectors/transactionsSelector';
import { getPendingTransactions } from '@multiversx/sdk-dapp/out/methods/transactions/getPendingTransactions';
import { Address, Transaction } from '@multiversx/sdk-core/out';
import { GAS_PRICE } from '@multiversx/sdk-dapp/out/constants/mvx.constants';

@Component({
  selector: 'app-ping-pong-raw',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OutputContainerComponent,
    LabelComponent,
    ButtonComponent,
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

  // Default ping amount (in wei - 1 EGLD = 10^18 wei)
  private pingAmount: string = '1000000000000000000'; // 1 EGLD

  // FontAwesome icons
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;

  private storeUnsubscribe?: () => void;
  private currentSessionId?: string;
  private countdownInterval?: any;

  ngOnInit() {
    // Initialize component state
    this.checkPingPongState();
    this.subscribeToStoreChanges();
    this.checkPendingTransactions();
  }

  ngOnDestroy() {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private subscribeToStoreChanges() {
    // Subscribe to store changes to track transaction status
    const store = getStore();
    this.storeUnsubscribe = store.subscribe(() => {
      this.checkPendingTransactions();
      if (this.currentSessionId) {
        this.checkTransactionStatus();
      }
    });
  }

  private checkPendingTransactions() {
    const pendingTransactions = getPendingTransactions();
    this.hasPendingTransactions = pendingTransactions.length > 0;

    // Update state when transactions complete
    if (!this.hasPendingTransactions && this.currentSessionId) {
      this.updateStateAfterTransaction();
    }
  }

  private checkTransactionStatus() {
    if (!this.currentSessionId) return;

    const state = transactionsSliceSelector(getStore().getState());
    const currentSession = state[this.currentSessionId];

    if (currentSession) {
      const sessionStatus = currentSession.status;

      if (String(sessionStatus) === 'successful') {
        this.hasPendingTransactions = false;
        this.updateStateAfterTransaction();
        this.currentSessionId = undefined;
      } else if (
        String(sessionStatus) === 'failed' ||
        String(sessionStatus) === 'timedOut'
      ) {
        this.hasPendingTransactions = false;
        this.currentSessionId = undefined;
        console.error('Transaction failed or timed out');
      }
    }
  }

  private updateStateAfterTransaction() {
    // In a real implementation, you would query the smart contract
    // to get the actual state. For now, we'll simulate the behavior
    this.checkPingPongState();
  }

  private checkPingPongState() {
    // Mock implementation - in real app, you'd check actual contract state
    // This simulates the ping-pong logic
    this.hasPing = true;
    this.secondsLeft = 30; // 30 seconds until pong is allowed
    this.pongAllowed = this.secondsLeft === 0;
    this.updateTimeRemaining();

    if (this.secondsLeft > 0) {
      this.startCountdown();
    }
  }

  private updateTimeRemaining() {
    const minutes = Math.floor(this.secondsLeft / 60);
    const seconds = this.secondsLeft % 60;
    this.timeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  async onSendPingTransaction() {
    try {
      console.log('Sending ping transaction...');
      await this.sendPingTransaction();
    } catch (error) {
      console.error('Error sending ping transaction:', error);
      this.hasPendingTransactions = false;
    }
  }

  async onSendPongTransaction() {
    try {
      console.log('Sending pong transaction...');
      await this.sendPongTransaction();
    } catch (error) {
      console.error('Error sending pong transaction:', error);
      this.hasPendingTransactions = false;
    }
  }

  private async sendPingTransaction() {
    const sessionId = await this.signAndSendTransactions(
      'ping',
      this.pingAmount,
      {
        processingMessage: 'Processing Ping transaction',
        errorMessage: 'An error has occurred during Ping',
        successMessage: 'Ping transaction successful',
      }
    );

    this.currentSessionId = sessionId;
    this.hasPendingTransactions = true;
  }

  private async sendPongTransaction() {
    const sessionId = await this.signAndSendTransactions('pong', '0', {
      processingMessage: 'Processing Pong transaction',
      errorMessage: 'An error has occurred during Pong',
      successMessage: 'Pong transaction successful',
    });

    this.currentSessionId = sessionId;
    this.hasPendingTransactions = true;
  }

  private async signAndSendTransactions(
    functionName: string,
    amount: string,
    transactionsDisplayInfo: {
      processingMessage: string;
      errorMessage: string;
      successMessage: string;
    }
  ): Promise<string> {
    // Get account data
    await refreshAccount(); // Get the latest nonce
    const account = getAccount();

    if (!account.address) {
      throw new Error('No account address found');
    }

    // Get network configuration - for this example, we'll use devnet values
    const chainId = 'D'; // devnet chain ID

    // Create the transaction with proper gas limits like in the React implementation
    const transaction = new Transaction({
      value: BigInt(amount),
      data: Buffer.from(functionName, 'utf8'),
      receiver: Address.newFromBech32(this.contractAddress),
      gasLimit: BigInt(6000000), // Same as React implementation
      gasPrice: BigInt(GAS_PRICE),
      chainID: chainId,
      nonce: BigInt(account.nonce),
      sender: Address.newFromBech32(account.address),
      version: 1,
    });

    // Sign the transaction
    const provider = getAccountProvider();
    const signedTransactions = await provider.signTransactions([transaction]);

    // Send and track the transaction
    const transactionManager = TransactionManager.getInstance();
    const sentTransactions = await transactionManager.send(signedTransactions);

    // Track the transaction with custom messages
    const sessionId = await transactionManager.track(sentTransactions, {
      transactionsDisplayInfo,
    });

    return sessionId;
  }

  private startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
        this.updateTimeRemaining();
      } else {
        this.pongAllowed = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}
