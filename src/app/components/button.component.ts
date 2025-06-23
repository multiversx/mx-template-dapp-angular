import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [id]="id"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      [class]="className"
      [type]="type"
      [attr.data-testid]="dataTestId"
      [attr.data-cy]="dataCy"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() id?: string;
  @Input() className = 'inline-block rounded-lg px-3 py-2 text-center hover:no-underline my-0 bg-blue-600 text-white hover:bg-blue-700 mr-0 disabled:bg-gray-200 disabled:text-black disabled:cursor-not-allowed';
  @Input() dataTestId?: string;
  @Input() dataCy?: string;
  @Output() onClick = new EventEmitter<MouseEvent>();
} 