import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoryDTO } from '../models/models';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Dodaj produkt</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nazwa</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="form.get('name')?.hasError('required')">
            Nazwa jest wymagana
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Opis</mat-label>
          <input matInput formControlName="description">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ilość</mat-label>
          <input matInput type="number" formControlName="quantity" min="0">
          <mat-error *ngIf="form.get('quantity')?.hasError('required')">
            Ilość jest wymagana
          </mat-error>
          <mat-error *ngIf="form.get('quantity')?.hasError('min')">
            Min. 0
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cena (zł)</mat-label>
          <input matInput type="number" formControlName="price" min="0" step="0.01">
          <mat-error *ngIf="form.get('price')?.hasError('required')">
            Cena jest wymagana
          </mat-error>
          <mat-error *ngIf="form.get('price')?.hasError('min')">
            Min. 0
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Kategoria</mat-label>

          <mat-select formControlName="categoryId">
            <mat-option [value]="null">Brak kategorii</mat-option>

            <mat-option *ngFor="let c of data.categories" [value]="c.id">
              {{ c.name }}
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
export class ProductFormDialogComponent {

  form;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { categories: CategoryDTO[] }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null as number | null]
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
