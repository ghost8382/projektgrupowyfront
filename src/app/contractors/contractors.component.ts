import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ContractorService } from '../services/contractor.service';
import { ContractorDTO } from '../models/models';
import { ContractorDialogComponent } from './contractor-dialog.component';

@Component({
  selector: 'app-contractors',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatCardModule,
    MatTooltipModule, MatProgressSpinnerModule,
    MatInputModule, MatFormFieldModule
  ],
  template: `
    <h2 class="page-title">🤝 Kontrahenci</h2>

    <div class="action-bar">
      <mat-form-field appearance="outline" style="width:300px;margin-bottom:-1.25em">
        <mat-label>Szukaj po nazwie</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Wpisz nazwę...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      <span class="spacer"></span>
      <button mat-raised-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon> Dodaj kontrahenta
      </button>
    </div>

    <mat-card>
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:40px">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <table mat-table [dataSource]="dataSource" class="full-width" *ngIf="!loading">

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let c">{{ c.id }}</td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nazwa</th>
          <td mat-cell *matCellDef="let c"><strong>{{ c.name }}</strong></td>
        </ng-container>

        <ng-container matColumnDef="nip">
          <th mat-header-cell *matHeaderCellDef>NIP</th>
          <td mat-cell *matCellDef="let c">{{ c.nip || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef>Miasto</th>
          <td mat-cell *matCellDef="let c">{{ c.city || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef>Telefon</th>
          <td mat-cell *matCellDef="let c">{{ c.phone || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>E-mail</th>
          <td mat-cell *matCellDef="let c">{{ c.email || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Akcje</th>
          <td mat-cell *matCellDef="let c">
            <button mat-icon-button matTooltip="Edytuj" (click)="openDialog(c)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" matTooltip="Usuń" (click)="delete(c.id!)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols" class="table-row"></tr>
      </table>

      <p *ngIf="!loading && dataSource.data.length === 0"
         style="text-align:center;color:#888;padding:32px">
        Brak kontrahentów
      </p>
    </mat-card>
  `,
  styles: [`
    .action-bar { display:flex; align-items:center; margin-bottom:16px; }
    .spacer { flex:1; }
    .table-row:hover { background:#f5f5f5; }
    mat-card { border-radius:12px !important; overflow:hidden; }
    .full-width { width:100%; }
  `]
})
export class ContractorsComponent implements OnInit {
  dataSource = new MatTableDataSource<ContractorDTO>();
  cols = ['id', 'name', 'nip', 'city', 'phone', 'email', 'actions'];
  loading = false;
  searchCtrl = new FormControl('');

  constructor(
    private contractorService: ContractorService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => this.load(val ?? ''));
  }

  load(search = '') {
    this.loading = true;
    this.contractorService.getAll(search).subscribe({
      next: (data) => { this.dataSource.data = data; this.loading = false; },
      error: (e) => {
        this.snack.open(e.error?.message || 'Błąd ładowania', 'Zamknij', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openDialog(contractor?: ContractorDTO) {
    const ref = this.dialog.open(ContractorDialogComponent, {
      data: { contractor }
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const action$ = contractor
        ? this.contractorService.update(contractor.id!, result)
        : this.contractorService.create(result);
      action$.subscribe({
        next: () => {
          this.snack.open('Zapisano!', 'OK', { duration: 2000 });
          this.load(this.searchCtrl.value ?? '');
        },
        error: (e) => this.snack.open(e.error?.message || 'Błąd', 'Zamknij', { duration: 3000 })
      });
    });
  }

  delete(id: number) {
    if (!confirm('Czy na pewno usunąć kontrahenta?')) return;
    this.contractorService.delete(id).subscribe({
      next: () => {
        this.snack.open('Usunięto!', 'OK', { duration: 2000 });
        this.load(this.searchCtrl.value ?? '');
      },
      error: (e) => this.snack.open(e.error?.message || 'Błąd usuwania', 'Zamknij', { duration: 3000 })
    });
  }
}
