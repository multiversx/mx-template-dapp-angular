import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

// MultiversX SDK imports
import { getAccount } from '@multiversx/sdk-dapp/out/methods/account/getAccount';
import { getNetworkConfig } from '@multiversx/sdk-dapp/out/methods/network/getNetworkConfig';
import { getAccountProvider } from '@multiversx/sdk-dapp/out/providers/helpers/accountProvider';
import { getIsLoggedIn } from '@multiversx/sdk-dapp/out/methods/account/getIsLoggedIn';
import { Address, Transaction } from '@multiversx/sdk-core/out';
import {
  GAS_LIMIT,
  GAS_PRICE,
} from '@multiversx/sdk-dapp/out/constants/mvx.constants';

// Base classes
import { BaseStoreSubscriptionService } from './base-store-subscription.service';
import {
  GlobalErrorHandlerService,
  ErrorCategoryEnum,
  ErrorSeverityEnum,
} from './global-error-handler.service';

// Types
import { NetworkEnvironment } from '../types/common.types';

/**
 * Account information interface
 */
export interface AccountInfo {
  address: string;
  balance: string;
  nonce: number;
  shard: number;
}

/**
 * Network configuration interface
 */
export interface NetworkConfigInfo {
  chainId: string;
  environment: NetworkEnvironment;
  egldLabel: string;
  apiUrl: string;
  explorerUrl: string;
}

/**
 * Transaction creation parameters
 */
export interface TransactionParams {
  receiver: string;
  value?: string;
  data?: string;
  chainId?: string;
}

/**
 * Core MultiversX SDK integration service
 * Centralizes all MultiversX SDK operations to eliminate code duplication
 * Provides reactive patterns for account and network state
 */
@Injectable({
  providedIn: 'root',
})
export class MultiversXCoreService extends BaseStoreSubscriptionService {
  // Private state subjects
  private readonly accountInfoSubject = new BehaviorSubject<AccountInfo | null>(
    null
  );
  private readonly networkConfigSubject =
    new BehaviorSubject<NetworkConfigInfo | null>(null);
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly accountInfo$ = this.accountInfoSubject.asObservable();
  public readonly networkConfig$ = this.networkConfigSubject.asObservable();
  public readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // Derived observables
  public readonly accountAddress$ = this.accountInfo$.pipe(
    map(account => account?.address || ''),
    distinctUntilChanged()
  );

  public readonly accountBalance$ = this.accountInfo$.pipe(
    map(account => account?.balance || '0'),
    distinctUntilChanged()
  );

  public readonly chainId$ = this.networkConfig$.pipe(
    map(config => config?.chainId || ''),
    distinctUntilChanged()
  );

  public readonly egldLabel$ = this.networkConfig$.pipe(
    map(config => config?.egldLabel || 'EGLD'),
    distinctUntilChanged()
  );

  // Combined observables
  public readonly accountAndNetwork$ = combineLatest([
    this.accountInfo$,
    this.networkConfig$,
  ]).pipe(map(([account, network]) => ({ account, network })));

  constructor(private errorHandler: GlobalErrorHandlerService) {
    super();
    this.initializeData();
  }

  protected initializeData(): void {
    this.updateAccountInfo();
    this.updateNetworkConfig();
    this.updateLoginState();
  }

  protected onStoreChange(): void {
    // React to MultiversX SDK store changes
    this.updateAccountInfo();
    this.updateNetworkConfig();
    this.updateLoginState();
  }

  private updateAccountInfo(): void {
    try {
      const account = getAccount();
      if (account && account.address) {
        const accountInfo: AccountInfo = {
          address: account.address,
          balance: account.balance?.toString() || '0',
          nonce: account.nonce || 0,
          shard: account.shard || 0,
        };
        this.accountInfoSubject.next(accountInfo);
      } else {
        this.accountInfoSubject.next(null);
      }
    } catch (error) {
      this.errorHandler.handleAppError(error, {
        category: ErrorCategoryEnum.BLOCKCHAIN,
        severity: ErrorSeverityEnum.LOW,
        userMessage: 'Failed to update account information',
        operation: 'account-info-update',
      });
      this.accountInfoSubject.next(null);
    }
  }

  private updateNetworkConfig(): void {
    try {
      const config = getNetworkConfig();
      if (config && config.network) {
        const networkInfo: NetworkConfigInfo = {
          chainId: config.network.chainId || '',
          environment: this.mapEnvironment(config.network.chainId),
          egldLabel: config.network.egldLabel || 'EGLD',
          apiUrl: config.network.apiAddress || '',
          explorerUrl: config.network.explorerAddress || '',
        };
        this.networkConfigSubject.next(networkInfo);
      } else {
        this.networkConfigSubject.next(null);
      }
    } catch (error) {
      this.errorHandler.handleAppError(error, {
        category: ErrorCategoryEnum.NETWORK,
        severity: ErrorSeverityEnum.LOW,
        userMessage: 'Failed to update network configuration',
        operation: 'network-config-update',
      });
      this.networkConfigSubject.next(null);
    }
  }

  private updateLoginState(): void {
    try {
      const isLoggedIn = getIsLoggedIn();
      this.isLoggedInSubject.next(isLoggedIn);
    } catch (error) {
      this.errorHandler.handleAppError(error, {
        category: ErrorCategoryEnum.AUTHENTICATION,
        severity: ErrorSeverityEnum.MEDIUM,
        userMessage: 'Failed to update authentication state',
        operation: 'auth-state-update',
      });
      this.isLoggedInSubject.next(false);
    }
  }

  private mapEnvironment(chainId: string): NetworkEnvironment {
    switch (chainId) {
      case 'D':
        return 'devnet';
      case 'T':
        return 'testnet';
      case '1':
        return 'mainnet';
      default:
        return 'devnet';
    }
  }

  // Synchronous getters for immediate access
  public getCurrentAccount(): AccountInfo | null {
    return this.accountInfoSubject.value;
  }

  public getCurrentNetworkConfig(): NetworkConfigInfo | null {
    return this.networkConfigSubject.value;
  }

  public getCurrentLoginState(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Helper methods
  public getCurrentAccountAddress(): string {
    return this.getCurrentAccount()?.address || '';
  }

  public getCurrentBalance(): string {
    return this.getCurrentAccount()?.balance || '0';
  }

  public getCurrentChainId(): string {
    return this.getCurrentNetworkConfig()?.chainId || '';
  }

  public getCurrentEgldLabel(): string {
    return this.getCurrentNetworkConfig()?.egldLabel || 'EGLD';
  }

  /**
   * Get account provider for transactions and signing
   */
  public async getProvider() {
    try {
      return getAccountProvider();
    } catch (error) {
      this.errorHandler.handleAuthError(error, 'get-account-provider');
      throw new Error('Failed to get account provider');
    }
  }

  /**
   * Create a transaction with current network config
   */
  public createTransaction(params: TransactionParams): Transaction {
    const account = this.getCurrentAccount();
    const networkConfig = this.getCurrentNetworkConfig();

    if (!account) {
      throw new Error('No account available for transaction');
    }

    if (!networkConfig) {
      throw new Error('No network configuration available');
    }

    const transaction = new Transaction({
      sender: Address.newFromBech32(account.address),
      receiver: Address.newFromBech32(params.receiver),
      value: BigInt(params.value || '0'),
      gasLimit: BigInt(GAS_LIMIT * 2),
      gasPrice: BigInt(GAS_PRICE),
      chainID: params.chainId || networkConfig.chainId,
      nonce: BigInt(account.nonce),
      data: params.data ? Buffer.from(params.data) : undefined,
    });

    return transaction;
  }

  /**
   * Validate if user is logged in and has account
   */
  public validateUserSession(): { isValid: boolean; error?: string } {
    const isLoggedIn = this.getCurrentLoginState();
    const account = this.getCurrentAccount();

    if (!isLoggedIn) {
      return { isValid: false, error: 'User not logged in' };
    }

    if (!account || !account.address) {
      return { isValid: false, error: 'No account address available' };
    }

    return { isValid: true };
  }

  /**
   * Get explorer transaction URL
   */
  public getTransactionExplorerUrl(txHash: string): string {
    const networkConfig = this.getCurrentNetworkConfig();
    if (!networkConfig?.explorerUrl) {
      return '';
    }

    return `${networkConfig.explorerUrl}/transactions/${txHash}`;
  }

  /**
   * Get explorer address URL
   */
  public getAddressExplorerUrl(address: string): string {
    const networkConfig = this.getCurrentNetworkConfig();
    if (!networkConfig?.explorerUrl) {
      return '';
    }

    return `${networkConfig.explorerUrl}/accounts/${address}`;
  }
}
