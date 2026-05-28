import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleService } from '../services/sale.service';
import { SaleDTO, ContractorDTO } from '../models/models';

@Component({
  selector: 'app-contractor-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatDialogModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule,
    MatDividerModule, MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px">
      <mat-icon style="color:#3b82f6">history</mat-icon>
      Historia zakupów — {{ data.name }}
    </h2>

    <mat-dialog-content style="min-width:600px;max-width:800px;max-height:70vh">

      <div *ngIf="loading" style="display:flex;justify-content:center;padding:40px">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading && sales.length === 0"
           style="text-align:center;color:#888;padding:40px">
        <mat-icon style="font-size:48px;height:48px;width:48px;color:#ddd">receipt_long</mat-icon>
        <p>Brak transakcji dla tego kontrahenta</p>
      </div>

      <div *ngIf="!loading && sales.length > 0">

        <!-- PODSUMOWANIE -->
        <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
          <div style="background:#eff6ff;border-radius:8px;padding:12px 20px;flex:1;text-align:center">
            <div style="font-size:22px;font-weight:700;color:#3b82f6">{{ sales.length }}</div>
            <div style="font-size:12px;color:#666">Transakcji</div>
          </div>
          <div style="background:#f0fdf4;border-radius:8px;padding:12px 20px;flex:1;text-align:center">
            <div style="font-size:22px;font-weight:700;color:#16a34a">{{ totalSpent | number:'1.2-2' }} zł</div>
            <div style="font-size:12px;color:#666">Łącznie wydano</div>
          </div>
          <div style="background:#fef9c3;border-radius:8px;padding:12px 20px;flex:1;text-align:center">
            <div style="font-size:22px;font-weight:700;color:#d97706">{{ avgOrder | number:'1.2-2' }} zł</div>
            <div style="font-size:12px;color:#666">Śr. wartość zamówienia</div>
          </div>
        </div>

        <mat-divider style="margin-bottom:16px"></mat-divider>

        <!-- TABELA -->
        <table mat-table [dataSource]="sales" style="width:100%">

          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let s">{{ s.id }}</td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Data</th>
            <td mat-cell *matCellDef="let s">{{ s.date | date:'dd.MM.yyyy HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Sprzedawca</th>
            <td mat-cell *matCellDef="let s">{{ s.username }}</td>
          </ng-container>

          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef>Pozycji</th>
            <td mat-cell *matCellDef="let s">{{ s.items.length }}</td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Suma</th>
            <td mat-cell *matCellDef="let s">
              <strong style="color:#16a34a">{{ s.totalAmount | number:'1.2-2' }} zł</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="products">
            <th mat-header-cell *matHeaderCellDef>Produkty</th>
            <td mat-cell *matCellDef="let s" style="font-size:12px;color:#666;max-width:200px">
              {{ s.items.map((i: any) => i.productName).join(', ') }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"
              style="cursor:default"
              [style.background]="'transparent'"></tr>
        </table>
      </div>

    </mat-dialog-content>

    <mat-dialog-actions align="end" style="padding:12px 24px">
      <button mat-button mat-dialog-close>Zamknij</button>
    </mat-dialog-actions>
  `,
  styles: [`
    tr.mat-mdc-row:hover { background: #f5f5f5 !important; }
    th.mat-mdc-header-cell { font-weight: 600; color: #333; }
  `]
})
export class ContractorHistoryDialogComponent implements OnInit {
  sales: SaleDTO[] = [];
  loading = true;
  cols = ['id', 'date', 'username', 'items', 'total', 'products'];

  get totalSpent(): number {
    return this.sales.reduce((sum, s) => sum + s.totalAmount, 0);
  }

  get avgOrder(): number {
    return this.sales.length ? this.totalSpent / this.sales.length : 0;
  }

  constructor(
    public dialogRef: MatDialogRef<ContractorHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContractorDTO,
    private saleService: SaleService
  ) {}

  ngOnInit() {
    this.saleService.getByContractor(this.data.id!).subscribe({
      next: (sales) => {
        this.sales = (sales ?? []).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.loading = false;
      },
      error: () => { this.sales = []; this.loading = false; }
    });
  }
}
