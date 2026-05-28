import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CompanyConfigDTO } from '../models/models';

@Component({
  selector: 'app-company-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>Dane sprzedawcy (firma)</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nazwa firmy</mat-label>
          <input matInput formControlName="name" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Wymagane</mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>NIP</mat-label>
            <input matInput formControlName="nip" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Nr konta</mat-label>
            <input matInput formControlName="bankAccount" />
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Adres</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Kod pocztowy</mat-label>
            <input matInput formControlName="postalCode" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Miasto</mat-label>
            <input matInput formControlName="city" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="half">
            <mat-label>Telefon</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="half">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" />
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Anuluj</button>
      <button mat-raised-button color="primary" (click)="save()">
        <mat-icon>save</mat-icon>
        Zapisz
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 560px;
        max-width: 760px;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .full {
        width: 100%;
      }
      .half {
        width: 100%;
      }
      @media (max-width: 680px) {
        .form {
          min-width: auto;
        }
        .row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CompanyConfigDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CompanyConfigDTO,
  ) {
    this.form = this.fb.group({
      name: [this.data?.name ?? '', Validators.required],
      nip: [this.data?.nip ?? ''],
      address: [this.data?.address ?? ''],
      city: [this.data?.city ?? ''],
      postalCode: [this.data?.postalCode ?? ''],
      phone: [this.data?.phone ?? ''],
      email: [this.data?.email ?? ''],
      bankAccount: [this.data?.bankAccount ?? ''],
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value as CompanyConfigDTO);
  }
}

