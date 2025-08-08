import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../label/label.component';
import { FormatAmountComponent } from '../format-amount/format-amount.component';
import { SignedTransactionType } from '../ping-pong-output/ping-pong-output.component';
import { MultiversXCoreService } from '../../services/multiversx-core.service';
import { getExplorerLink } from '@multiversx/sdk-dapp/out/utils/transactions/getExplorerLink';

@Component({
  selector: 'app-transaction-output',
  standalone: true,
  imports: [CommonModule, LabelComponent, FormatAmountComponent],
  templateUrl: './transaction-output.component.html',
})
export class TransactionOutputComponent implements OnInit {
  @Input() transaction?: SignedTransactionType;
  label: string = '';
  explorerAddress: string = '';

  constructor(private multiversXCore: MultiversXCoreService) {}

  ngOnInit() {
    const networkConfig = this.multiversXCore.getCurrentNetworkConfig();
    if (networkConfig) {
      this.label = networkConfig.egldLabel;
      this.explorerAddress = networkConfig.explorerUrl;
    } else {
      this.label = 'EGLD';
      this.explorerAddress = '';
    }
  }

  get decodedData(): string {
    if (!this.transaction?.data) {
      return 'N/A';
    }

    try {
      return Buffer.from(this.transaction.data, 'base64').toString('ascii');
    } catch {
      return 'N/A';
    }
  }

  get hashExplorerLink(): string {
    if (!this.transaction?.hash) {
      return '';
    }

    return getExplorerLink({
      to: `/transactions/${this.transaction.hash}`,
      explorerAddress: this.explorerAddress,
    });
  }

  get receiverExplorerLink(): string {
    if (!this.transaction?.receiver) {
      return '';
    }
    return getExplorerLink({
      to: `/accounts/${this.transaction.receiver}`,
      explorerAddress: this.explorerAddress,
    });
  }
}
