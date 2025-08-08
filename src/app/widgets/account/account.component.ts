import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { LabelComponent } from '../../components/label/label.component';
import { getAccount } from '@multiversx/sdk-dapp/out/methods/account/getAccount';
import { FormatAmountComponent } from '../../components';
import { getNetworkConfig } from '@multiversx/sdk-dapp/out/methods/network/getNetworkConfig';
import { BaseStoreSubscriptionComponent } from '../../services/base-store-subscription.service';

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
export class AccountComponent extends BaseStoreSubscriptionComponent implements OnInit {
  address: string = '';
  balance: string = '';
  shard: number = 0;
  nonce: number = 0;
  label: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    // Initial data load is handled by base class
    this.initializeData();
  }

  protected initializeData(): void {
    this.updateAccountData();
  }

  protected onStoreChange(): void {
    // React to store changes by updating account data
    this.updateAccountData();
  }

  private updateAccountData(): void {
    const account = getAccount();
    const { network } = getNetworkConfig();

    if (account) {
      this.address = account.address;
      this.balance = account.balance.toString();
      this.shard = account.shard || 0;
      this.nonce = account.nonce || 0;
      this.label = network.egldLabel;
      this.isLoading = false;
    }
  }

  // Note: ngOnDestroy is handled by BaseStoreSubscriptionComponent
}
