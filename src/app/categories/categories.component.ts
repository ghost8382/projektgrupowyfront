import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CategoryService } from '../services/category.service';
import { CategoryDTO } from '../models/models';
import { CategoryDialogComponent } from './category-dialog.component';

interface CategoryNode {
  id: number;
  name: string;
  parentId?: number | null;
  children: CategoryNode[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-header">
      <div class="page-title-row">
        <mat-icon class="page-icon">account_tree</mat-icon>
        <h2 class="page-title">Drzewo kategorii</h2>
        <span class="category-count" *ngIf="!loading">{{ allCategories.length }} kategorii</span>
      </div>

      <button mat-flat-button color="primary" class="add-btn" (click)="openDialogRoot()">
        <mat-icon>add</mat-icon>
        Dodaj kategorię główną
      </button>
    </div>

    <div class="tree-container">
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="44"></mat-spinner>
      </div>

      <div *ngIf="!loading && treeDataSource.data.length === 0" class="empty-state">
        <mat-icon>category</mat-icon>
        <p>Brak kategorii</p>
        <button mat-stroked-button color="primary" (click)="openDialogRoot()">Dodaj pierwszą kategorię</button>
      </div>

      <mat-tree
        [dataSource]="treeDataSource"
        [treeControl]="treeControl"
        *ngIf="!loading && treeDataSource.data.length > 0"
        class="category-tree"
      >
        <!-- Węzeł bez dzieci (liść) -->
        <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding matTreeNodePaddingIndent="28">
          <div class="tree-row leaf-row">
            <div class="row-left">
              <span class="toggle-placeholder"></span>
              <mat-icon class="leaf-icon">sell</mat-icon>
              <span class="node-label">{{ node.name }}</span>

              <div class="subcats" matTooltip="Podkategorie">
                <span class="subcats-label">podkategorie</span>
                <span class="badge">{{ node.children.length }}</span>
                <button
                  mat-icon-button
                  class="subcats-add"
                  matTooltip="Dodaj podkategorię"
                  (click)="openDialogChild(node)"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <div class="row-actions">
              <button mat-icon-button class="action-btn edit-btn" matTooltip="Edytuj" (click)="openDialog(node)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="action-btn delete-btn" matTooltip="Usuń" (click)="delete(node)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
        </mat-tree-node>

        <!-- Węzeł z dziećmi (folder) -->
        <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChildren">
          <div class="tree-row parent-row" [class.expanded]="treeControl.isExpanded(node)">
            <div class="row-left">
              <button mat-icon-button matTreeNodeToggle class="toggle-btn" [attr.aria-label]="'toggle ' + node.name">
                <mat-icon class="toggle-icon">
                  {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                </mat-icon>
              </button>

              <mat-icon class="folder-icon">
                {{ treeControl.isExpanded(node) ? 'folder_open' : 'folder' }}
              </mat-icon>

              <span class="node-label parent-label">{{ node.name }}</span>

              <div class="subcats" matTooltip="Podkategorie">
                <span class="subcats-label">podkategorie</span>
                <span class="badge">{{ node.children.length }}</span>
                <button
                  mat-icon-button
                  class="subcats-add"
                  matTooltip="Dodaj podkategorię"
                  (click)="openDialogChild(node)"
                >
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <div class="row-actions">
              <button mat-icon-button class="action-btn edit-btn" matTooltip="Edytuj" (click)="openDialog(node)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="action-btn delete-btn" matTooltip="Usuń" (click)="delete(node)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>

          <div [class.hidden]="!treeControl.isExpanded(node)" role="group" class="children-group">
            <ng-container matTreeNodeOutlet></ng-container>
          </div>
        </mat-nested-tree-node>
      </mat-tree>
    </div>
  `,
  styles: [
    `
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .page-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-icon {
      color: var(--mat-sys-primary);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .page-title {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .category-count {
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface-variant);
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 12px;
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .add-btn mat-icon { margin-right: 6px; }

    .tree-container {
      background: var(--mat-sys-surface-container-low);
      border-radius: 14px;
      padding: 16px;
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .loading-center { display: flex; justify-content: center; padding: 60px 0; }

    .empty-state {
      text-align: center;
      padding: 40px 10px;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-state mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--mat-sys-outline);
      opacity: 0.8;
      margin-bottom: 8px;
    }

    .category-tree {
      padding: 8px 0;
      background: transparent;
    }

    .tree-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 10px;
      border-radius: 10px;
      margin: 4px 0;
      transition: background 0.15s, border-left-color 0.15s;
      border-left: 3px solid transparent;
    }

    .tree-row:hover {
      background: var(--mat-sys-surface-container-high);
    }

    .parent-row {
      background: var(--mat-sys-surface-container);
      border-left-color: var(--mat-sys-primary);
    }

    .parent-row.expanded {
      background: var(--mat-sys-surface-container-high);
      border-left-color: var(--mat-sys-primary);
    }

    .leaf-row {
      background: var(--mat-sys-surface);
      border-left-color: var(--mat-sys-outline-variant);
    }

    .row-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;
      min-width: 260px;
    }

    .toggle-btn { color: var(--mat-sys-primary); flex-shrink: 0; }
    .toggle-placeholder { width: 40px; flex-shrink: 0; }
    .toggle-icon { font-size: 20px; }

    .folder-icon { color: var(--mat-sys-tertiary); font-size: 22px; width: 22px; height: 22px; flex-shrink: 0; }
    .leaf-icon { color: var(--mat-sys-on-surface-variant); font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }

    .node-label {
      font-size: 14px;
      color: var(--mat-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 420px;
    }

    .parent-label { font-weight: 700; font-size: 15px; }

    .subcats {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 10px;
      padding-left: 10px;
      border-left: 1px solid var(--mat-sys-outline-variant);
      flex-shrink: 0;
    }

    .subcats-label {
      font-size: 11px;
      letter-spacing: 0.3px;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
    }

    .badge {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      font-size: 11px;
      font-weight: 800;
      padding: 1px 8px;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .subcats-add { width: 32px; height: 32px; line-height: 32px; }
    .subcats-add mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .row-actions {
      display: flex;
      gap: 0;
      opacity: 1;
      flex-shrink: 0;
    }

    .action-btn { width: 36px; height: 36px; line-height: 36px; }
    .action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .edit-btn { color: var(--mat-sys-primary); }
    .delete-btn { color: var(--mat-sys-error); }

    .children-group { border-left: 1px dashed var(--mat-sys-outline-variant); margin-left: 32px; }
    .hidden { display: none; }
  `,
  ],
})
export class CategoriesComponent implements OnInit {
  treeControl = new NestedTreeControl<CategoryNode>((node) => node.children);
  treeDataSource = new MatTreeNestedDataSource<CategoryNode>();
  loading = false;
  allCategories: CategoryDTO[] = [];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
  }

  hasChildren = (_: number, node: CategoryNode) => node.children.length > 0;

  load() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.allCategories = cats;
        this.treeDataSource.data = this.buildTree(cats);
        this.treeControl.dataNodes = this.treeDataSource.data;
        this.treeControl.expandAll();
        this.loading = false;
      },
      error: (e) => {
        this.snack.open(e.error?.message || 'Błąd ładowania', 'Zamknij', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  private buildTree(cats: CategoryDTO[]): CategoryNode[] {
    const map = new Map<number, CategoryNode>();
    cats.forEach((c) => map.set(c.id!, { id: c.id!, name: c.name, parentId: c.parentId, children: [] }));

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

  openDialogRoot() {
    const ref = this.dialog.open(CategoryDialogComponent, {
      data: {
        category: { name: '', parentId: null },
        categories: this.allCategories,
        forceParent: true,
      },
      width: '420px',
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.categoryService.create(result.name, null).subscribe({
        next: () => {
          this.snack.open('Dodano kategorię główną!', 'OK', { duration: 2000 });
          this.load();
        },
        error: (e) => this.snack.open(e.error?.message || 'Błąd', 'Zamknij', { duration: 3000 }),
      });
    });
  }

  openDialog(node?: CategoryNode) {
    const dto: CategoryDTO | undefined = node ? { id: node.id, name: node.name, parentId: node.parentId } : undefined;

    const ref = this.dialog.open(CategoryDialogComponent, {
      data: { category: dto, categories: this.allCategories },
      width: '420px',
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;

      const action$ = dto
        ? this.categoryService.update(dto.id!, result.name, result.parentId)
        : this.categoryService.create(result.name, result.parentId);

      action$.subscribe({
        next: () => {
          this.snack.open('Zapisano!', 'OK', { duration: 2000 });
          this.load();
        },
        error: (e) => this.snack.open(e.error?.message || 'Błąd', 'Zamknij', { duration: 3000 }),
      });
    });
  }

  openDialogChild(parentNode: CategoryNode) {
    const ref = this.dialog.open(CategoryDialogComponent, {
      data: {
        category: { name: '', parentId: parentNode.id },
        categories: this.allCategories,
        forceParent: true,
      },
      width: '420px',
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;

      this.categoryService.create(result.name, parentNode.id).subscribe({
        next: () => {
          this.snack.open('Dodano podkategorię!', 'OK', { duration: 2000 });
          this.load();
        },
        error: (e) => this.snack.open(e.error?.message || 'Błąd', 'Zamknij', { duration: 3000 }),
      });
    });
  }

  delete(node: CategoryNode) {
    const msg =
      node.children.length > 0
        ? `Usunąć kategorię "${node.name}" wraz z ${node.children.length} podkategoriami?`
        : `Usunąć kategorię "${node.name}"?`;

    if (!confirm(msg)) return;

    this.categoryService.delete(node.id).subscribe({
      next: () => {
        this.snack.open('Usunięto!', 'OK', { duration: 2000 });
        this.load();
      },
      error: (e) => this.snack.open(e.error?.message || 'Błąd usuwania', 'Zamknij', { duration: 3000 }),
    });
  }
}
