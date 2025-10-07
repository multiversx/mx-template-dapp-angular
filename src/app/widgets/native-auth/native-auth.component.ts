import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { LabelComponent } from '../../components/label/label.component';
import { FormatAmountComponent } from '../../components/format-amount/format-amount.component';

import {
  MultiversXCoreService,
  AccountInfo,
  NetworkConfigInfo,
} from '../../services/multiversx-core.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-native-auth',
  standalone: true,
  imports: [
    CommonModule,
    OutputContainerComponent,
    LabelComponent,
    FormatAmountComponent,
  ],
  templateUrl: './native-auth.component.html',
})
export class NativeAuthComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private multiversXCore = inject(MultiversXCoreService);
  private authService = inject(AuthService);

  isLoading: boolean = true;
  isLoggedIn: boolean = false;
  account: AccountInfo | null = null;
  network: NetworkConfigInfo | null = null;

  ngOnInit() {
    this.initializeSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions(): void {
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        this.isLoading = false;
      });

    this.multiversXCore.accountInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account = account;
      });

    this.multiversXCore.networkConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(network => {
        this.network = network;
      });
  }

  getAddressExplorerUrl(): string {
    if (!this.account?.address || !this.network?.explorerUrl) {
      return '';
    }
    return `${this.network.explorerUrl}/accounts/${this.account.address}`;
  }

  getExplorerLinkText(): string {
    return this.account?.address || 'N/A';
  }

  get showMissingNativeAuthError(): boolean {
    return !this.isLoggedIn;
  }

  get showProfileError(): boolean {
    return this.isLoggedIn && !this.account;
  }
}
