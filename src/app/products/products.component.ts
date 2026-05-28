import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { ProductDTO, CategoryDTO } from '../models/models';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { StockDialogComponent } from './stock-dialog.component';
import { MovementsDialogComponent } from './movements-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';

interface CategoryNode {
  id: number;
  name: string;
  parentId?: number | null;
  children: CategoryNode[];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatSnackBarModule, MatCardModule, MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<ProductDTO>();
  columns = ['id', 'name', 'categoryName', 'quantity', 'price', 'actions'];
  categories: CategoryDTO[] = [];
  categoryTree: CategoryNode[] = [];
  parentMap = new Map<number, number | null>();
  hoveredCategoryId: number | null = null;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  nameControl = new FormControl('');
  categoryControl = new FormControl<number | null>(null);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
      this.categoryTree = this.buildTree(cats);
    });
    this.load();
    this.nameControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.pageIndex = 0; this.load(); });
    this.categoryControl.valueChanges.subscribe(() => { this.pageIndex = 0; this.load(); });
  }

  hoverCategory(categoryId: number | null) {
    this.hoveredCategoryId = categoryId;
  }

  isExpanded(node: CategoryNode): boolean {
    if (this.hoveredCategoryId === null) {
      return false;
    }
    let current: number | null = this.hoveredCategoryId;
    while (current != null) {
      if (current === node.id) {
        return true;
      }
      current = this.parentMap.get(current) ?? null;
    }
    return false;
  }

  private buildParentMap(cats: CategoryDTO[]): Map<number, number | null> {
    const map = new Map<number, number | null>();
    cats.forEach(cat => map.set(cat.id!, cat.parentId ?? null));
    return map;
  }

  private buildTree(cats: CategoryDTO[]): CategoryNode[] {
    const map = new Map<number, CategoryNode>();
    cats.forEach((c) => map.set(c.id!, { id: c.id!, name: c.name, parentId: c.parentId, children: [] }));
    this.parentMap = this.buildParentMap(cats);

    const roots: CategoryNode[] = [];
    map.forEach((node) => {
      if (node.parentId != null && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  load() {
    this.loading = true;
    this.productService.getAll({
      name: this.nameControl.value || undefined,
      categoryId: this.categoryControl.value ?? undefined,
      page: this.pageIndex,
      size: this.pageSize
    }).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (e) => {
        this.snack.open(e.error?.message || 'Błąd ładowania', 'Zamknij', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  openAddDialog() {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: { categories: this.categories }
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const { categoryId, ...product } = result;
      this.productService.add(product, categoryId).subscribe({
        next: () => { this.snack.open('Produkt dodany!', 'OK', { duration: 2000 }); this.load(); },
        error: (e) => this.snack.open(e.error?.message || 'Błąd dodawania', 'Zamknij', { duration: 3000 })
      });
    });
  }

  openStockDialog(product: ProductDTO, mode: 'add' | 'remove') {
    const ref = this.dialog.open(StockDialogComponent, {
      data: { mode, productName: product.name }
    });
    ref.afterClosed().subscribe(quantity => {
      if (!quantity) return;
      const action$ = mode === 'add'
        ? this.productService.addStock(product.id!, quantity)
        : this.productService.removeStock(product.id!, quantity);
      action$.subscribe({
        next: () => { this.snack.open('Stan zaktualizowany!', 'OK', { duration: 2000 }); this.load(); },
        error: (e) => this.snack.open(e.error?.message || 'Błąd operacji', 'Zamknij', { duration: 3000 })
      });
    });
  }

  openMovements(product: ProductDTO) {
    this.dialog.open(MovementsDialogComponent, {
      data: { productId: product.id, productName: product.name }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Czy na pewno usunąć ten produkt?')) return;
    this.productService.delete(id).subscribe({
      next: () => { this.snack.open('Usunięto!', 'OK', { duration: 2000 }); this.load(); },
      error: (e) => this.snack.open(e.error?.message || 'Błąd usuwania', 'Zamknij', { duration: 3000 })
    });
  }
}
