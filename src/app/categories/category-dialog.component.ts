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
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.category?.id ? 'Edytuj kategorię' : 'Dodaj kategorię' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nazwa</mat-label>
          <input matInput formControlName="name" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Nazwa jest wymagana</mat-error>
        </mat-form-field>

        <ng-container *ngIf="!data.forceParent; else lockedParent">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Kategoria nadrzędna</mat-label>
            <mat-select formControlName="parentId">
              <mat-option [value]="null">Brak (kategoria główna)</mat-option>

              <mat-option
                *ngFor="let c of data.categories"
                [value]="c.id"
                [disabled]="c.id === data.category?.id"
              >
                {{ c.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </ng-container>

        <ng-template #lockedParent>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Kategoria nadrzędna</mat-label>
            <input matInput [value]="parentLabel" disabled />
            <mat-hint *ngIf="form.get('parentId')?.value == null">Tworzysz kategorię główną</mat-hint>
          </mat-form-field>
        </ng-template>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Anuluj</button>

      <button mat-raised-button color="primary" (click)="submit()">
        {{ data.category?.id ? 'Zapisz' : 'Dodaj' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
    .dialog-form { display: flex; flex-direction: column; gap: 12px; }
    .full-width { width: 100%; }
  `,
  ],
})
export class CategoryDialogComponent {
  form;
  parentLabel = 'Brak (kategoria główna)';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { category?: CategoryDTO; categories: CategoryDTO[]; forceParent?: boolean },
  ) {
    this.form = this.fb.group({
      name: [this.data?.category?.name || '', Validators.required],
      parentId: [{ value: this.data?.category?.parentId ?? null, disabled: !!this.data?.forceParent }],
    });

    const parentId = this.data?.category?.parentId ?? null;
    if (parentId != null) {
      const parent = this.data.categories.find((c) => c.id === parentId);
      if (parent) this.parentLabel = parent.name;
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
