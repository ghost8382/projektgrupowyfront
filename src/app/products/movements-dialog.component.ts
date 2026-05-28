import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ProductService } from '../services/product.service';
import { StockMovementDTO } from '../models/models';

@Component({
  selector: 'app-movements-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>📋 Historia ruchów — {{ data.productName }}</h2>
    <mat-dialog-content style="min-width:480px">
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:24px">
        <mat-spinner diameter="36"></mat-spinner>
      </div>
      <table mat-table [dataSource]="movements" *ngIf="!loading" class="full-width">
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Typ</th>
          <td mat-cell *matCellDef="let m">
            <span class="badge" [class.in]="m.type==='IN'" [class.out]="m.type==='OUT'">
              {{ m.type === 'IN' ? '⬆ Przyjęcie' : '⬇ Wydanie' }}
            </span>
          </td>
        </ng-container>
        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Ilość</th>
          <td mat-cell *matCellDef="let m">{{ m.quantity }}</td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Data</th>
          <td mat-cell *matCellDef="let m">{{ m.date | date:'dd.MM.yyyy HH:mm' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
      <p *ngIf="!loading && movements.length === 0" style="text-align:center;padding:16px;color:#888">
        Brak historii ruchów
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Zamknij</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .in { background: #e8f5e9; color: #2e7d32; }
    .out { background: #fce4ec; color: #c62828; }
  `]
})
export class MovementsDialogComponent implements OnInit {
  movements: StockMovementDTO[] = [];
  loading = true;
  cols = ['type', 'quantity', 'date'];

  constructor(
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: { productId: number; productName: string }
  ) {}

  ngOnInit() {
    this.productService.getMovements(this.data.productId).subscribe({
      next: (m) => { this.movements = m; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
