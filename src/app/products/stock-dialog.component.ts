import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-stock-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatRadioModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'add' ? '➕ Przyjęcie towaru' : '➖ Wydanie towaru' }} — {{ data.productName }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ilość</mat-label>
          <input matInput type="number" formControlName="quantity" min="1">

          <mat-error *ngIf="form.get('quantity')?.hasError('required')">
            Wymagane
          </mat-error>

          <mat-error *ngIf="form.get('quantity')?.hasError('min')">
            Min. 1
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Anuluj</button>

      <button mat-raised-button
              [color]="data.mode === 'add' ? 'primary' : 'warn'"
              (click)="submit()">
        {{ data.mode === 'add' ? 'Przyjmij' : 'Wydaj' }}
      </button>
    </mat-dialog-actions>
  `
})
export class StockDialogComponent {

  form;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StockDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: 'add' | 'remove'; productName: string }
  ) {
    this.form = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value.quantity);
  }
}
