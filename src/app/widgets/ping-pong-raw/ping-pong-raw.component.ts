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
import { Address, Transaction } from '@multiversx/sdk-core/out';
import {
  GAS_PRICE,
  GAS_LIMIT,
} from '@multiversx/sdk-dapp/out/constants/mvx.constants';

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
      if (this.currentSessionId) {
        this.checkTransactionStatus();
      }
    });
  }

  private checkTransactionStatus() {
    if (!this.currentSessionId) return;

    const state = transactionsSliceSelector(getStore().getState());
    const currentSession = state[this.currentSessionId];

    if (currentSession) {
      const sessionStatus = currentSession.status;

      if (String(sessionStatus) === 'successful') {
        this.hasPendingTransactions = false;
        this.currentSessionId = undefined;
        // Update state based on the transaction type
        // You would need to implement logic to determine if it was ping or pong
        // For now, we'll toggle the state
        this.hasPing = !this.hasPing;
        if (!this.hasPing) {
          this.secondsLeft = 30;
          this.startCountdown();
        } else {
          this.secondsLeft = 0;
          this.pongAllowed = false;
        }
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
    this.timeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  async onSendPingTransaction() {
    try {
      console.log('Sending ping transaction...');
      await this.sendTransaction('ping');
    } catch (error) {
      console.error('Error sending ping transaction:', error);
      this.hasPendingTransactions = false;
    }
  }

  async onSendPongTransaction() {
    try {
      console.log('Sending pong transaction...');
      await this.sendTransaction('pong');
    } catch (error) {
      console.error('Error sending pong transaction:', error);
      this.hasPendingTransactions = false;
    }
  }

  private async sendTransaction(functionName: string) {
    this.hasPendingTransactions = true;

    // Get account data
    await refreshAccount(); // Get the latest nonce
    const account = getAccount();

    if (!account.address) {
      throw new Error('No account address found');
    }

    // Get network configuration - for this example, we'll use devnet values
    const chainId = 'D'; // devnet chain ID

    // Create the transaction
    const transaction = new Transaction({
      value: BigInt(0),
      data: Buffer.from(functionName, 'utf8'),
      receiver: Address.newFromBech32(this.contractAddress),
      gasLimit: BigInt(GAS_LIMIT),
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
      transactionsDisplayInfo: {
        processingMessage: `Processing ${functionName} transaction`,
        errorMessage: `An error has occurred during ${functionName} transaction`,
        successMessage: `${functionName} transaction successful`,
      },
    });

    this.currentSessionId = sessionId;
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
