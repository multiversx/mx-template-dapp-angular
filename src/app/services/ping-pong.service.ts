import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { contractAddress } from '../../config';
import { getAccount } from '@multiversx/sdk-dapp/out/methods/account/getAccount';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { refreshAccount } from '@multiversx/sdk-dapp/out/utils/account/refreshAccount';
import { TransactionManager } from '@multiversx/sdk-dapp/out/managers/TransactionManager';
import { getStore } from '@multiversx/sdk-dapp/out/store/store';
import { getPendingTransactions } from '@multiversx/sdk-dapp/out/methods/transactions/getPendingTransactions';
import { getNetworkConfig } from '@multiversx/sdk-dapp/out/methods/network/getNetworkConfig';
import { Address, Transaction } from '@multiversx/sdk-core/out';
import { GAS_PRICE } from '@multiversx/sdk-dapp/out/constants/mvx.constants';

const PING_TRANSACTION_INFO = {
  processingMessage: 'Processing Ping transaction',
  errorMessage: 'An error has occurred during Ping',
  successMessage: 'Ping transaction successful',
};

const PONG_TRANSACTION_INFO = {
  processingMessage: 'Processing Pong transaction',
  errorMessage: 'An error has occurred during Pong',
  successMessage: 'Pong transaction successful',
};

@Injectable({
  providedIn: 'root',
})
export class PingPongService {
  private pingAmountSubject = new BehaviorSubject<string>(
    '1000000000000000000'
  ); // 1 EGLD
  public pingAmount$: Observable<string> =
    this.pingAmountSubject.asObservable();

  private timeToPongSubject = new BehaviorSubject<number>(0);
  public timeToPong$: Observable<number> =
    this.timeToPongSubject.asObservable();

  private storeUnsubscribe?: () => void;

  constructor() {
    this.subscribeToStoreChanges();
  }

  private subscribeToStoreChanges() {
    const store = getStore();
    this.storeUnsubscribe = store.subscribe(() => {
      // Update time to pong when store changes
      this.updateTimeToPong();
    });
  }

  getPingAmount(): string {
    return this.pingAmountSubject.value;
  }

  getPendingTransactions() {
    return getPendingTransactions();
  }

  async getTimeToPong(): Promise<number | null> {
    try {
      await refreshAccount();
      const account = getAccount();
      const networkConfig = getNetworkConfig();
      if (!account.address) {
        throw new Error('No account address found');
      }
      const args = new Address(account.address).toHex();
      const response = await fetch(
        `${networkConfig.network.apiAddress}/vm-values/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scAddress: contractAddress,
            funcName: 'getTimeToPong',
            args: [args],
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to query smart contract');
      }
      const data = await response.json();
      // decodeTime logic
      const returnValue = data?.data?.returnData?.[0];
      if (returnValue === '') {
        return 0;
      }
      if (!returnValue) {
        return null;
      }
      const decodedHex = Buffer.from(returnValue, 'base64').toString('hex');
      return parseInt(decodedHex, 16);
    } catch (error) {
      return null;
    }
  }

  private async updateTimeToPong() {
    const timeToPong = await this.getTimeToPong();
    this.timeToPongSubject.next(timeToPong ?? 0);
  }

  async sendPingTransaction(amount?: string): Promise<string> {
    const pingAmount = amount || this.pingAmountSubject.value;

    // Get account data
    await refreshAccount();
    const account = getAccount();
    const networkConfig = getNetworkConfig();

    if (!account.address) {
      throw new Error('No account address found');
    }

    const transaction = new Transaction({
      value: BigInt(pingAmount),
      data: Buffer.from('ping'),
      receiver: new Address(contractAddress),
      gasLimit: BigInt(6000000),
      gasPrice: BigInt(GAS_PRICE),
      chainID: networkConfig.network.chainId,
      nonce: BigInt(account.nonce),
      sender: new Address(account.address),
      version: 1,
    });

    const provider = getAccountProvider();
    const signedTransactions = await provider.signTransactions([transaction]);

    const transactionManager = TransactionManager.getInstance();
    const sentTransactions = await transactionManager.send(signedTransactions);

    const sessionId = await transactionManager.track(sentTransactions, {
      transactionsDisplayInfo: PING_TRANSACTION_INFO,
    });

    return sessionId;
  }

  async sendPongTransaction(): Promise<string> {
    // Get account data
    await refreshAccount();
    const account = getAccount();
    const networkConfig = getNetworkConfig();

    if (!account.address) {
      throw new Error('No account address found');
    }

    const transaction = new Transaction({
      value: BigInt(0),
      data: Buffer.from('pong'),
      receiver: new Address(contractAddress),
      gasLimit: BigInt(6000000),
      gasPrice: BigInt(GAS_PRICE),
      chainID: networkConfig.network.chainId,
      nonce: BigInt(account.nonce),
      sender: new Address(account.address),
      version: 1,
    });

    const provider = getAccountProvider();
    const signedTransactions = await provider.signTransactions([transaction]);

    const transactionManager = TransactionManager.getInstance();
    const sentTransactions = await transactionManager.send(signedTransactions);

    const sessionId = await transactionManager.track(sentTransactions, {
      transactionsDisplayInfo: PONG_TRANSACTION_INFO,
    });

    return sessionId;
  }

  ngOnDestroy() {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }
  }
}
