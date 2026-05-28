import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { SaleService } from '../services/sale.service';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { ContractorService } from '../services/contractor.service';
import { CompanyConfigService } from '../services/company-config.service';
import { LoyaltyVoucherService, LoyaltyVoucher } from '../services/loyalty-voucher.service';
import { SaleDTO, UserDTO, ProductDTO, ContractorDTO } from '../models/models';
import { SaleDetailDialogComponent } from './sale-detail-dialog.component';
import { CompanyConfigDialogComponent } from '../company/company-config-dialog.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSortModule
  ],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<SaleDTO>();
  cols = ['id', 'date', 'username', 'contractorName', 'totalAmount', 'products', 'actions'];

  users: UserDTO[] = [];
  products: ProductDTO[] = [];
  contractors: ContractorDTO[] = [];
  allSales: SaleDTO[] = [];

  filterContractorId: number | '' = '';

  activeVoucher: LoyaltyVoucher | null = null;
  voucherUsed = false;

  loading = false;
  submitting = false;

  form: any;

  constructor(
    private saleService: SaleService,
    private userService: UserService,
    private productService: ProductService,
    private contractorService: ContractorService,
    private companyConfigService: CompanyConfigService,
    private voucherService: LoyaltyVoucherService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      userId:       [null as number | null, Validators.required],
      contractorId: [null as number | null],
      items:        this.fb.array([this.createItem()])
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: SaleDTO, prop: string) => {
      switch (prop) {
        case 'date': return new Date(item.date).getTime();
        case 'totalAmount': return item.totalAmount;
        case 'itemsCount': return item.items.length;
        default: return (item as any)[prop] ?? '';
      }
    };
  }

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (u) => this.users = u ?? [],
      error: () => this.users = []
    });

    this.productService.getAll({ size: 1000 }).subscribe({
      next: (p) => this.products = p?.content ?? [],
      error: () => this.products = []
    });

    this.contractorService.getAll().subscribe({
      next: (c) => this.contractors = c ?? [],
      error: () => this.contractors = []
    });

    this.load();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  load() {
    this.loading = true;
    this.saleService.getAll().subscribe({
      next: (sales) => {
        this.allSales = (sales ?? []).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.allSales = [];
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let data = [...this.allSales];
    if (this.filterContractorId !== '') {
      data = data.filter(s => s.contractorId === this.filterContractorId);
    }
    this.dataSource.data = data;
  }

  createItem() {
    return this.fb.group({
      product:   [null as ProductDTO | null, [Validators.required, this.productSelectionValidator]],
      quantity:  [1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(i: number) {
    if (this.items.length > 1) {
      this.items.removeAt(i);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const val = this.form.value;

    this.saleService.create({
      userId:       val.userId,
      contractorId: val.contractorId ?? null,
      items: (val.items ?? []).map((i: any) => ({
        productId: i.product?.id,
        quantity:  i.quantity
      }))
    }).subscribe({
      next: () => {
        // jeśli bon był użyty — usuń go
        if (this.voucherUsed && val.contractorId) {
          this.voucherService.clear(val.contractorId);
        }
        this.snack.open('Sprzedaż zapisana!', 'OK', { duration: 2000 });
        this.form.reset({ userId: null, contractorId: null });
        this.items.clear();
        this.items.push(this.createItem());
        this.activeVoucher = null;
        this.voucherUsed = false;
        this.submitting = false;
        this.load();
      },
      error: (e) => {
        this.snack.open(e.error?.message || 'Błąd zapisu', 'Zamknij', { duration: 4000 });
        this.submitting = false;
      }
    });
  }

getProductNames(sale: SaleDTO): string {
    return (sale.items ?? []).map(i => i.productName).join(', ');
  }

  onContractorChange(contractorId: number | null) {
    this.activeVoucher = null;
    this.voucherUsed = false;
    if (!contractorId) return;
    this.activeVoucher = this.voucherService.get(contractorId);
  }

  applyVoucher() {
    if (!this.activeVoucher) return;
    this.voucherUsed = true;
    this.snack.open(
      `Bon ${this.activeVoucher.amount.toFixed(2)} zł zostanie zastosowany — pamiętaj odjąć od sumy!`,
      'OK', { duration: 5000 }
    );
  }

  skipVoucher() {
    this.activeVoucher = null;
    this.voucherUsed = false;
  }

  productDisplay = (p: ProductDTO | null): string => p?.name ?? '';

  private productSelectionValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as ProductDTO | string | null;
    if (value == null) return { required: true };
    if (typeof value === 'string') return { productNotSelected: true };
    if (value.id == null) return { productNotSelected: true };
    return null;
  };

  filteredProductsFor(itemIndex: number): ProductDTO[] {
    const ctrl = this.items.at(itemIndex)?.get('product');
    const value = ctrl?.value as ProductDTO | string | null;
    const query = (typeof value === 'string' ? value : value?.name ?? '').trim().toLowerCase();

    if (!query) return this.products.slice(0, 50);
    return this.products
      .filter(p => (p.name ?? '').toLowerCase().includes(query))
      .slice(0, 50);
  }

  openCompanyConfig() {
    this.companyConfigService.get().subscribe({
      next: (cfg) => {
        const ref = this.dialog.open(CompanyConfigDialogComponent, {
          data: cfg ?? {},
        });
        ref.afterClosed().subscribe((result) => {
          if (!result) return;
          this.companyConfigService.save(result).subscribe({
            next: () => this.snack.open('Zapisano dane sprzedawcy.', 'OK', { duration: 2000 }),
            error: (e) => this.snack.open(e.error?.message || 'Błąd zapisu danych sprzedawcy', 'Zamknij', { duration: 4000 }),
          });
        });
      },
      error: () => {
        const ref = this.dialog.open(CompanyConfigDialogComponent, { data: {} });
        ref.afterClosed().subscribe((result) => {
          if (!result) return;
          this.companyConfigService.save(result).subscribe({
            next: () => this.snack.open('Zapisano dane sprzedawcy.', 'OK', { duration: 2000 }),
            error: (e) => this.snack.open(e.error?.message || 'Błąd zapisu danych sprzedawcy', 'Zamknij', { duration: 4000 }),
          });
        });
      },
    });
  }

  openDetail(sale: SaleDTO) {
    this.dialog.open(SaleDetailDialogComponent, { data: sale });
  }
}
