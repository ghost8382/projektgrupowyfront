import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ContractorService } from '../services/contractor.service';
import { ContractorDTO, LoyaltyAccountDTO, LoyaltyTransactionDTO } from '../models/models';
import { ContractorDialogComponent } from './contractor-dialog.component';

@Component({
  selector: 'app-contractors',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatCardModule,
    MatTooltipModule, MatProgressSpinnerModule,
    MatInputModule, MatFormFieldModule, MatTabsModule,
    MatSelectModule, MatDividerModule, MatChipsModule
  ],
  template: `
    <h2 class="page-title">🤝 Kontrahenci</h2>

    <mat-tab-group animationDuration="200ms">

      <!-- ===== ZAKŁADKA 1: LISTA ===== -->
      <mat-tab label="Lista kontrahentów">
        <div style="padding-top:16px">

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
        </div>
      </mat-tab>

      <!-- ===== ZAKŁADKA 2: LOJALNOŚĆ + HISTORIA TRANSAKCJI ===== -->
      <mat-tab label="Program lojalnościowy">
        <div style="padding-top:16px">

          <!-- INFO O ZASADACH -->
          <mat-card style="margin-bottom:16px;background:#f0f9ff;border-left:4px solid #3b82f6">
            <mat-card-content style="padding:16px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <mat-icon style="color:#3b82f6">info</mat-icon>
                <strong style="font-size:15px">Zasady programu lojalnościowego</strong>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:8px">
                <div style="background:white;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
                  <div style="font-size:24px;font-weight:700;color:#3b82f6">1 zł</div>
                  <div style="font-size:12px;color:#666;margin-top:4px">= 1 punkt za każdą wydaną złotówkę</div>
                </div>
                <div style="background:white;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
                  <div style="font-size:24px;font-weight:700;color:#f59e0b">100 pkt</div>
                  <div style="font-size:12px;color:#666;margin-top:4px">= 100 zł zniżki na kolejne zakupy</div>
                </div>
                <div style="background:white;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
                  <div style="font-size:24px;font-weight:700;color:#16a34a">500 pkt</div>
                  <div style="font-size:12px;color:#666;margin-top:4px">= 500 zł zniżki — premia za lojalność</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card style="margin-bottom:16px">
            <mat-card-content>
              <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                <mat-form-field appearance="outline" style="width:300px;margin-bottom:-1.25em">
                  <mat-label>Wybierz kontrahenta</mat-label>
                  <mat-select [(ngModel)]="selectedContractorId" (ngModelChange)="onContractorSelect($event)">
                    <mat-option [value]="null">— wybierz —</mat-option>
                    <mat-option *ngFor="let c of dataSource.data" [value]="c.id">
                      {{ c.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <div *ngIf="loyaltyAccount" class="points-badge">
                  <mat-icon style="color:#f59e0b">star</mat-icon>
                  <span><strong>{{ loyaltyAccount.points }}</strong> punktów lojalnościowych</span>
                </div>

                <button mat-raised-button color="accent"
                        *ngIf="loyaltyAccount && loyaltyAccount.points > 0"
                        (click)="openRedeemDialog()"
                        [disabled]="redeeming">
                  <mat-icon>redeem</mat-icon>
                  {{ redeeming ? 'Realizowanie...' : 'Zrealizuj punkty' }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Historia transakcji lojalnościowych -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Historia transakcji lojalnościowych</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="loyaltyLoading" style="display:flex;justify-content:center;padding:40px">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <p *ngIf="!loyaltyLoading && !selectedContractorId"
                 style="text-align:center;color:#888;padding:32px">
                Wybierz kontrahenta aby zobaczyć historię transakcji
              </p>

              <table mat-table [dataSource]="loyaltyTransactions" class="full-width"
                     *ngIf="!loyaltyLoading && selectedContractorId">

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Data</th>
                  <td mat-cell *matCellDef="let t">{{ t.date | date:'dd.MM.yyyy HH:mm' }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Typ</th>
                  <td mat-cell *matCellDef="let t">
                    <span [style.color]="t.type === 'EARN' ? '#16a34a' : '#dc2626'">
                      <mat-icon style="font-size:16px;vertical-align:middle">
                        {{ t.type === 'EARN' ? 'add_circle' : 'remove_circle' }}
                      </mat-icon>
                      {{ t.type === 'EARN' ? 'Naliczenie' : 'Realizacja' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="points">
                  <th mat-header-cell *matHeaderCellDef>Punkty</th>
                  <td mat-cell *matCellDef="let t">
                    <strong [style.color]="t.type === 'EARN' ? '#16a34a' : '#dc2626'">
                      {{ t.type === 'EARN' ? '+' : '-' }}{{ t.points }}
                    </strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Opis</th>
                  <td mat-cell *matCellDef="let t">{{ t.description || '—' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="loyaltyCols"></tr>
                <tr mat-row *matRowDef="let row; columns: loyaltyCols" class="table-row"></tr>
              </table>

              <p *ngIf="!loyaltyLoading && selectedContractorId && loyaltyTransactions.length === 0"
                 style="text-align:center;color:#888;padding:32px">
                Brak transakcji lojalnościowych
              </p>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

    </mat-tab-group>

    <!-- Dialog realizacji punktów -->
    <ng-template #redeemTpl>
      <p>Wpisz liczbę punktów do realizacji:</p>
    </ng-template>
  `,
  styles: [`
    .action-bar { display:flex; align-items:center; margin-bottom:16px; }
    .spacer { flex:1; }
    .table-row:hover { background:#f5f5f5; }
    mat-card { border-radius:12px !important; overflow:hidden; }
    .full-width { width:100%; }
    .points-badge { display:flex; align-items:center; gap:8px; font-size:16px;
      background:#fef3c7; padding:8px 16px; border-radius:8px; }
  `]
})
export class ContractorsComponent implements OnInit {
  dataSource = new MatTableDataSource<ContractorDTO>();
  cols = ['id', 'name', 'nip', 'city', 'phone', 'email', 'actions'];
  loading = false;
  searchCtrl = new FormControl('');

  selectedContractorId: number | null = null;
  loyaltyAccount: LoyaltyAccountDTO | null = null;
  loyaltyTransactions: LoyaltyTransactionDTO[] = [];
  loyaltyLoading = false;
  redeeming = false;
  loyaltyCols = ['date', 'type', 'points', 'description'];

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

  onContractorSelect(id: number | null) {
    this.loyaltyAccount = null;
    this.loyaltyTransactions = [];
    if (!id) return;

    this.loyaltyLoading = true;
    this.contractorService.getLoyalty(id).subscribe({
      next: (acc) => { this.loyaltyAccount = acc; },
      error: () => { this.loyaltyAccount = null; }
    });

    this.contractorService.getLoyaltyTransactions(id).subscribe({
      next: (txs) => {
        this.loyaltyTransactions = (txs ?? []).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.loyaltyLoading = false;
      },
      error: () => {
        this.loyaltyTransactions = [];
        this.loyaltyLoading = false;
      }
    });
  }

  openRedeemDialog() {
    const pointsStr = prompt(
      `Kontrahent ma ${this.loyaltyAccount!.points} pkt. Ile punktów zrealizować?`
    );
    if (!pointsStr) return;
    const points = parseInt(pointsStr, 10);
    if (isNaN(points) || points <= 0) {
      this.snack.open('Podaj prawidłową liczbę punktów', 'Zamknij', { duration: 3000 });
      return;
    }
    if (points > this.loyaltyAccount!.points) {
      this.snack.open('Niewystarczająca liczba punktów', 'Zamknij', { duration: 3000 });
      return;
    }

    this.redeeming = true;
    this.contractorService.redeemPoints(this.selectedContractorId!, points).subscribe({
      next: () => {
        this.snack.open(`Zrealizowano ${points} punktów!`, 'OK', { duration: 3000 });
        this.redeeming = false;
        this.onContractorSelect(this.selectedContractorId);
      },
      error: (e) => {
        this.snack.open(e.error?.message || 'Błąd realizacji punktów', 'Zamknij', { duration: 3000 });
        this.redeeming = false;
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
