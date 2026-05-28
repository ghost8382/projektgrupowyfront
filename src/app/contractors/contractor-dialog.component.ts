import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ContractorDTO } from '../models/models';

@Component({
  selector: 'app-contractor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.contractor ? 'Edytuj kontrahenta' : 'Dodaj kontrahenta' }}
    </h2>

    <mat-dialog-content style="min-width:420px">
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nazwa *</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="form.get('name')?.hasError('required')">
            Nazwa jest wymagana
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>NIP</mat-label>
          <input matInput formControlName="nip" placeholder="1234567890">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adres</mat-label>
          <input matInput formControlName="address" placeholder="ul. Przykładowa 1">
        </mat-form-field>

        <div style="display:flex;gap:12px">
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Kod pocztowy</mat-label>
            <input matInput formControlName="postalCode" placeholder="00-000">
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex:2">
            <mat-label>Miasto</mat-label>
            <input matInput formControlName="city">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefon</mat-label>
          <input matInput formControlName="phone">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error *ngIf="form.get('email')?.hasError('email')">
            Nieprawidłowy adres e-mail
          </mat-error>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Anuluj</button>
      <button mat-raised-button color="primary" (click)="submit()">
        {{ data.contractor ? 'Zapisz' : 'Dodaj' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }`]
})
export class ContractorDialogComponent {

  form;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ContractorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { contractor?: ContractorDTO }
  ) {
    this.form = this.fb.group({
      name:       [data.contractor?.name       || '', Validators.required],
      nip:        [data.contractor?.nip        || ''],
      address:    [data.contractor?.address    || ''],
      city:       [data.contractor?.city       || ''],
      postalCode: [data.contractor?.postalCode || ''],
      phone:      [data.contractor?.phone      || ''],
      email:      [data.contractor?.email      || '', Validators.email]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
