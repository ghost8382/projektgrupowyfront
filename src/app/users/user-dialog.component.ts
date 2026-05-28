import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Dodaj użytkownika</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Login</mat-label>
          <input matInput formControlName="username">

          <mat-error *ngIf="form.get('username')?.hasError('required')">
            Wymagany
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Hasło</mat-label>
          <input matInput type="password" formControlName="password">

          <mat-error *ngIf="form.get('password')?.hasError('required')">
            Wymagane
          </mat-error>

          <mat-error *ngIf="form.get('password')?.hasError('minlength')">
            Min. 4 znaki
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rola</mat-label>
          <mat-select formControlName="role">
            <mat-option *ngFor="let r of data.roles" [value]="r">
              {{ r }}
            </mat-option>
          </mat-select>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Anuluj</button>
      <button mat-raised-button color="primary" (click)="submit()">
        Dodaj
      </button>
    </mat-dialog-actions>
  `
})
export class UserDialogComponent {

  form;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { roles: string[] }
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['USER', Validators.required]
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
