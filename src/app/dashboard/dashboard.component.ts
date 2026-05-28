import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { UserService } from '../services/user.service';
import { SaleService } from '../services/sale.service';
import { ContractorService } from '../services/contractor.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 class="page-title">Dashboard</h2>
    <div class="cards-grid" *ngIf="!loading; else spinner">
      <mat-card class="stat-card" *ngFor="let s of statCards">
        <mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon>
        <div class="stat-value" [style.color]="s.color">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </mat-card>
    </div>
    <ng-template #spinner>
      <div style="display:flex;justify-content:center;padding:60px">
        <mat-spinner></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .stat-card {
      padding: 32px 20px;
      text-align: center;
      cursor: default;
      transition: transform .2s, box-shadow .2s;
      border-radius: 12px !important;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.15) !important;
    }
    mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .stat-value { font-size: 44px; font-weight: 700; line-height: 1; }
    .stat-label {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  statCards: { icon: string; color: string; value: number; label: string }[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private userService: UserService,
    private saleService: SaleService,
    private contractorService: ContractorService
  ) {}

  ngOnInit() {
    forkJoin({
      products: this.productService.getAll({ size: 1 }),
      categories: this.categoryService.getAll(),
      users: this.userService.getAll(),
      sales: this.saleService.getAll(),
      contractors: this.contractorService.getAll()
    }).subscribe({
      next: (data) => {
        const today = new Date().toDateString();
        const salesToday = data.sales.filter(s => new Date(s.date).toDateString() === today).length;
        this.statCards = [
          { icon: 'inventory', color: 'var(--mat-sys-primary)', value: data.products.totalElements, label: 'Produktów' },
          { icon: 'category', color: 'var(--mat-sys-tertiary)', value: data.categories.length, label: 'Kategorii' },
          { icon: 'people', color: 'var(--mat-sys-secondary)', value: data.users.length, label: 'Użytkowników' },
          { icon: 'business', color: '#795548', value: data.contractors.length, label: 'Kontrahentów' },
          { icon: 'point_of_sale', color: 'var(--mat-sys-error)', value: salesToday, label: 'Sprzedaży dzisiaj' }
        ];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}

