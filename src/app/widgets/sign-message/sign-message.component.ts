import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPen,
  faBroom,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { OutputContainerComponent } from '../../components/output-container/output-container.component';
import { LabelComponent } from '../../components/label/label.component';
import { ButtonComponent } from '../../components/button/button.component';
import { MultiversXCoreService } from '../../services/multiversx-core.service';
import { Message } from '@multiversx/sdk-core/out';
import { ComponentState } from '../../types/common.types';
import { BaseReactiveStateComponent } from '../../services/base-reactive-state.service';

/**
 * Interface for signed message response from MultiversX SDK
 */
interface SignedMessageResponse {
  /** The signature as Uint8Array (optional from provider) */
  signature?: Uint8Array;
  /** The message data as Uint8Array */
  data: Uint8Array;
}

@Component({
  selector: 'app-sign-message',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    OutputContainerComponent,
    LabelComponent,
    ButtonComponent,
  ],
  templateUrl: './sign-message.component.html',
  styleUrls: ['./sign-message.component.css'],
})
export class SignMessageComponent extends BaseReactiveStateComponent {
  // Reactive state
  private readonly messageState = this.createState<string>('');
  private readonly signedMessageState = this.createState<SignedMessageResponse | null>(null);
  private readonly signatureState = this.createState<string>('');
  private readonly addressState = this.createState<string>('');

  // Public observables for template
  public readonly message$ = this.messageState.observable;
  public readonly signedMessage$ = this.signedMessageState.observable;
  public readonly signature$ = this.signatureState.observable;
  public readonly address$ = this.addressState.observable;

  // For backward compatibility and template binding
  get message(): string {
    return this.messageState.get();
  }

  set message(value: string) {
    this.messageState.set(value);
  }

  get signedMessage(): SignedMessageResponse | null {
    return this.signedMessageState.get();
  }

  get state(): ComponentState {
    return this.currentComponentState;
  }

  get signature(): string {
    return this.signatureState.get();
  }

  get address(): string {
    return this.addressState.get();
  }

  // FontAwesome icons
  readonly faPen = faPen;
  readonly faBroom = faBroom;
  readonly faRotateRight = faRotateRight;

  constructor(private multiversXCore: MultiversXCoreService) {
    super();
  }

  async handleSubmit() {
    const result = await this.executeWithState(
      async () => {
        const validation = this.multiversXCore.validateUserSession();
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid session');
        }

        const accountAddress = this.multiversXCore.getCurrentAccountAddress();
        this.addressState.set(accountAddress);

        const currentMessage = this.messageState.get();

        // Create a Message object from the message
        const messageToSign = new Message({
          data: Buffer.from(currentMessage, 'utf8'),
        });

        // Get the account provider and sign the message
        const provider = await this.multiversXCore.getProvider();
        const signedMessage = await provider.signMessage(messageToSign);

        if (!signedMessage) {
          throw new Error('No signed message returned from provider');
        }

        // Extract the signature from the signed message
        const signature = signedMessage.signature
          ? Buffer.from(signedMessage.signature).toString('hex')
          : '';
        
        this.signatureState.set(signature);
        this.signedMessageState.set(signedMessage);
        this.messageState.set(''); // Clear input after successful signing

        return signedMessage;
      },
      'Signing message...',
      'message-signing'
    );

    // Result will be null if there was an error (handled by base class)
    return result;
  }

  handleClear(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Clear all reactive state
    this.signatureState.set('');
    this.signedMessageState.set(null);
    this.messageState.set('');
    this.clearError(); // This also resets to pending state
  }

  get encodedMessage(): string {
    const signedMessage = this.signedMessageState.get();
    if (!signedMessage) return '';
    return (
      '0x' +
      Array.from(signedMessage.data, (byte: number) =>
        byte.toString(16).padStart(2, '0')
      ).join('')
    );
  }

  get decodedMessage(): string {
    const signedMessage = this.signedMessageState.get();
    if (!signedMessage) return '';
    return new TextDecoder().decode(signedMessage.data);
  }
}
