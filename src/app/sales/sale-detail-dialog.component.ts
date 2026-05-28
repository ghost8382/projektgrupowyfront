import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleDTO } from '../models/models';
import { SaleService } from '../services/sale.service';

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <h2 mat-dialog-title>🧾 Szczegóły sprzedaży #{{ data.id }}</h2>

    <mat-dialog-content style="min-width:540px">
      <p><strong>Data:</strong> {{ data.date | date:'dd.MM.yyyy HH:mm' }}</p>
      <p><strong>Sprzedawca:</strong> {{ data.username }}</p>
      <p *ngIf="data.contractorName"><strong>Kontrahent:</strong> {{ data.contractorName }}</p>
      <p *ngIf="!data.contractorName" style="color:#999"><strong>Kontrahent:</strong> — (paragon kasowy)</p>
      <p><strong>Suma:</strong> {{ data.totalAmount | number:'1.2-2' }} zł</p>

      <br>

      <table mat-table [dataSource]="data.items" class="full-width">
        <ng-container matColumnDef="productName">
          <th mat-header-cell *matHeaderCellDef>Produkt</th>
          <td mat-cell *matCellDef="let i">{{ i.productName }}</td>
        </ng-container>
        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Ilość</th>
          <td mat-cell *matCellDef="let i">{{ i.quantity }}</td>
        </ng-container>
        <ng-container matColumnDef="priceAtSale">
          <th mat-header-cell *matHeaderCellDef>Cena jedn.</th>
          <td mat-cell *matCellDef="let i">{{ i.priceAtSale | number:'1.2-2' }} zł</td>
        </ng-container>
        <ng-container matColumnDef="subtotal">
          <th mat-header-cell *matHeaderCellDef>Wartość</th>
          <td mat-cell *matCellDef="let i">{{ i.subtotal | number:'1.2-2' }} zł</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
    </mat-dialog-content>

    <mat-dialog-actions style="display:flex;justify-content:space-between;padding:12px 24px">
      <div style="display:flex;gap:8px">
        <button mat-stroked-button color="primary"
                matTooltip="Pobierz paragon PDF"
                (click)="downloadReceipt()">
          <mat-icon>receipt</mat-icon> Paragon
        </button>
        <button mat-stroked-button color="accent"
                matTooltip="Pobierz fakturę PDF (wymaga kontrahenta)"
                (click)="downloadInvoice()">
          <mat-icon>description</mat-icon> Faktura
        </button>
      </div>
      <button mat-button mat-dialog-close>Zamknij</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; }`]
})
export class SaleDetailDialogComponent {
  cols = ['productName', 'quantity', 'priceAtSale', 'subtotal'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SaleDTO,
    private saleService: SaleService
  ) {}

  downloadReceipt() {
    this.saleService.downloadReceipt(this.data.id!).subscribe(blob => {
      this.saveBlob(blob, `paragon_${this.data.id}.pdf`);
    });
  }

  downloadInvoice() {
    this.saleService.downloadInvoice(this.data.id!).subscribe(blob => {
      this.saveBlob(blob, `faktura_${this.data.id}.pdf`);
    });
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
