import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface RedeemDialogData {
  contractorName: string;
  points: number;
}

@Component({
  selector: 'app-redeem-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px">
      <mat-icon style="color:#f59e0b">redeem</mat-icon>
      Realizacja punktów lojalnościowych
    </h2>

    <mat-dialog-content style="min-width:340px">
      <p style="margin-bottom:12px;color:#555">
        Kontrahent: <strong>{{ data.contractorName }}</strong>
      </p>

      <div style="background:#fef3c7;border-radius:8px;padding:12px;margin-bottom:20px;
                  display:flex;align-items:center;gap:10px">
        <mat-icon style="color:#f59e0b;font-size:28px;height:28px;width:28px">stars</mat-icon>
        <div>
          <div style="font-size:18px;font-weight:700;color:#b45309">
            {{ data.points }} pkt
          </div>
          <div style="font-size:13px;color:#92400e">
            Dostępna zniżka: do <strong>{{ maxDiscount | number:'1.2-2' }} zł</strong>
          </div>
        </div>
      </div>

      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Kwota zniżki do realizacji</mat-label>
        <input matInput type="number"
               [(ngModel)]="discountPln"
               min="1" [max]="maxDiscount" step="1"
               placeholder="np. 10">
        <span matSuffix>zł</span>
        <mat-hint>Min: 1 zł &nbsp;|&nbsp; Maks: {{ maxDiscount }} zł</mat-hint>
      </mat-form-field>

      <div *ngIf="discountPln >= 1"
           style="margin-top:14px;padding:10px 14px;background:#f0fdf4;
                  border-radius:8px;border-left:3px solid #16a34a;font-size:13px;color:#166534">
        <mat-icon style="font-size:16px;vertical-align:middle;margin-right:4px">info</mat-icon>
        Zostanie pobrane <strong>{{ discountPln * 10 }} pkt</strong> —
        pozostanie <strong>{{ data.points - discountPln * 10 }}</strong> pkt
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" style="padding:12px 24px">
      <button mat-button mat-dialog-close>Anuluj</button>
      <button mat-raised-button color="accent"
              [disabled]="!isValid()"
              (click)="confirm()">
        <mat-icon>check_circle</mat-icon>
        Zrealizuj {{ discountPln >= 1 ? (discountPln | number:'1.0-0') + ' zł zniżki' : '' }}
      </button>
    </mat-dialog-actions>
  `
})
export class RedeemDialogComponent {
  discountPln = 1;
  maxDiscount: number;

  constructor(
    public dialogRef: MatDialogRef<RedeemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RedeemDialogData
  ) {
    this.maxDiscount = Math.floor(data.points / 10);
  }

  isValid(): boolean {
    const v = Math.floor(this.discountPln);
    return v >= 1 && v <= this.maxDiscount;
  }

  confirm() {
    if (!this.isValid()) return;
    // return number of points to redeem
    this.dialogRef.close(Math.floor(this.discountPln) * 10);
  }
}
