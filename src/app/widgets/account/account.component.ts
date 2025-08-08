import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { LabelComponent } from '../../components/label/label.component';
import { FormatAmountComponent } from '../../components';
import {
  MultiversXCoreService,
  AccountInfo,
  NetworkConfigInfo,
} from '../../services/multiversx-core.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    OutputContainerComponent,
    LabelComponent,
    FormatAmountComponent,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  address: string = '';
  balance: string = '';
  shard: number = 0;
  nonce: number = 0;
  label: string = '';
  isLoading: boolean = true;

  constructor(private multiversXCore: MultiversXCoreService) {}

  ngOnInit() {
    this.multiversXCore.accountAndNetwork$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ account, network }) => {
        this.updateAccountData(account, network);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateAccountData(
    account: AccountInfo | null,
    network: NetworkConfigInfo | null
  ): void {
    if (account) {
      this.address = account.address;
      this.balance = account.balance;
      this.shard = account.shard;
      this.nonce = account.nonce;
      this.label = network?.egldLabel || 'EGLD';
      this.isLoading = false;
    } else {
      this.address = '';
      this.balance = '';
      this.shard = 0;
      this.nonce = 0;
      this.label = 'EGLD';
      this.isLoading = true;
    }
  }
}
