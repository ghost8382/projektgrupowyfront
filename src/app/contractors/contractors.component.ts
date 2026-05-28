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
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ContractorService } from '../services/contractor.service';
import { ContractorDTO, LoyaltyAccountDTO, LoyaltyTransactionDTO } from '../models/models';
import { ContractorDialogComponent } from './contractor-dialog.component';
import { RedeemDialogComponent } from './redeem-dialog.component';

@Component({
  selector: 'app-contractors',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatCardModule,
    MatTooltipModule, MatProgressSpinnerModule,
    MatInputModule, MatFormFieldModule, MatTabsModule,
    MatSelectModule, MatDividerModule
  ],
  template: `
    <h2 class="page-title">Kontrahenci</h2>

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

      <!-- ===== ZAKŁADKA 2: PROGRAM LOJALNOŚCIOWY ===== -->
      <mat-tab label="Program lojalnościowy">
        <div style="padding-top:16px">

          <!-- ZASADY PROGRAMU -->
          <mat-card style="margin-bottom:16px;background:#f0f9ff;border-left:4px solid #3b82f6">
            <mat-card-content style="padding:16px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
                <mat-icon style="color:#3b82f6">info</mat-icon>
                <strong style="font-size:15px">Zasady programu lojalnościowego</strong>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">

                <div class="rule-card">
                  <div class="rule-value" style="color:#3b82f6">1 zł = 1 pkt</div>
                  <div class="rule-desc">Za każdą wydaną złotówkę naliczany jest 1 punkt</div>
                </div>

                <div class="rule-card">
                  <div class="rule-value" style="color:#f59e0b">10 pkt = 1 zł</div>
                  <div class="rule-desc">Zniżka przy kolejnych zakupach (wartość 10% zebranych)</div>
                </div>

                <div class="rule-card">
                  <div class="rule-value" style="color:#16a34a">100 pkt = 10 zł</div>
                  <div class="rule-desc">Zakupy za 100 zł → 100 pkt → 10 zł rabatu</div>
                </div>

                <div class="rule-card">
                  <div class="rule-value" style="color:#7c3aed">500 pkt = 50 zł</div>
                  <div class="rule-desc">Stały klient oszczędza więcej z każdym zamówieniem</div>
                </div>

              </div>
            </mat-card-content>
          </mat-card>

          <!-- WYBÓR KONTRAHENTA + SALDO -->
          <mat-card style="margin-bottom:16px">
            <mat-card-content>
              <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">

                <mat-form-field appearance="outline" style="width:300px;margin-bottom:-1.25em">
                  <mat-label>Wybierz kontrahenta</mat-label>
                  <mat-select [(ngModel)]="selectedContractorId" (ngModelChange)="onContractorSelect($event)">
                    <mat-option [value]="null">— wybierz —</mat-option>
                    <mat-option *ngFor="let c of allContractors" [value]="c.id">
                      {{ c.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- SALDO PUNKTÓW -->
                <div *ngIf="loyaltyAccount" class="points-badge">
                  <mat-icon style="color:#f59e0b;font-size:22px;height:22px;width:22px">stars</mat-icon>
                  <div>
                    <div style="font-weight:700;font-size:16px">{{ loyaltyAccount.totalPoints }} pkt</div>
                    <div style="font-size:12px;color:#92400e">
                      = {{ loyaltyAccount.totalPoints / 10 | number:'1.2-2' }} zł do wykorzystania
                    </div>
                  </div>
                </div>

                <button mat-raised-button color="accent"
                        *ngIf="loyaltyAccount && loyaltyAccount.totalPoints >= 10"
                        (click)="openRedeemDialog()"
                        [disabled]="redeeming">
                  <mat-icon>redeem</mat-icon>
                  {{ redeeming ? 'Realizowanie...' : 'Zrealizuj punkty' }}
                </button>

                <span *ngIf="loyaltyAccount && loyaltyAccount.totalPoints > 0 && loyaltyAccount.totalPoints < 10"
                      style="font-size:12px;color:#888;font-style:italic">
                  Minimalna realizacja: 10 pkt (1 zł)
                </span>

              </div>
            </mat-card-content>
          </mat-card>

          <!-- HISTORIA TRANSAKCJI LOJALNOŚCIOWYCH -->
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
                     *ngIf="!loyaltyLoading && selectedContractorId && loyaltyTransactions.length > 0">

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Data</th>
                  <td mat-cell *matCellDef="let t">{{ t.date | date:'dd.MM.yyyy HH:mm' }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Typ</th>
                  <td mat-cell *matCellDef="let t">
                    <span [style.color]="t.type === 'EARN' ? '#16a34a' : '#dc2626'"
                          style="display:flex;align-items:center;gap:4px">
                      <mat-icon style="font-size:17px;height:17px;width:17px">
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
                      {{ t.type === 'EARN' ? '+' : '-' }}{{ t.points }} pkt
                    </strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Zniżka zarobiona</th>
                  <td mat-cell *matCellDef="let t">
                    <span *ngIf="t.type === 'EARN'" style="color:#16a34a;font-weight:600">
                      +{{ (t.points / 10) | number:'1.2-2' }} zł
                    </span>
                    <span *ngIf="t.type !== 'EARN'" style="color:#dc2626;font-weight:600">
                      -{{ (t.points / 10) | number:'1.2-2' }} zł zniżki
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Opis</th>
                  <td mat-cell *matCellDef="let t" style="color:#666;font-size:13px">
                    <span *ngIf="t.type === 'EARN'">
                      Zakup {{ t.saleId ? '#' + t.saleId : '' }}
                    </span>
                    <span *ngIf="t.type !== 'EARN'">Realizacja zniżki</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="loyaltyCols"></tr>
                <tr mat-row *matRowDef="let row; columns: loyaltyCols" class="table-row"></tr>
              </table>

              <p *ngIf="!loyaltyLoading && selectedContractorId && loyaltyTransactions.length === 0"
                 style="text-align:center;color:#888;padding:32px">
                Brak transakcji lojalnościowych dla tego kontrahenta
              </p>
            </mat-card-content>
          </mat-card>

        </div>
      </mat-tab>

    </mat-tab-group>
  `,
  styles: [`
    .action-bar { display:flex; align-items:center; margin-bottom:16px; }
    .spacer { flex:1; }
    .table-row:hover { background:#f5f5f5; }
    mat-card { border-radius:12px !important; overflow:hidden; }
    .full-width { width:100%; }
    .points-badge {
      display:flex; align-items:center; gap:10px;
      background:#fef3c7; padding:10px 16px; border-radius:10px;
      border:1px solid #fde68a;
    }
    .rule-card {
      background:white; border-radius:8px; padding:12px;
      text-align:center; box-shadow:0 1px 4px rgba(0,0,0,0.08);
    }
    .rule-value { font-size:20px; font-weight:700; }
    .rule-desc { font-size:11px; color:#666; margin-top:6px; line-height:1.4; }
  `]
})
export class ContractorsComponent implements OnInit {
  dataSource = new MatTableDataSource<ContractorDTO>();
  cols = ['id', 'name', 'nip', 'city', 'phone', 'email', 'actions'];
  loading = false;
  searchCtrl = new FormControl('');

  // full unfiltered list for loyalty dropdown
  allContractors: ContractorDTO[] = [];

  selectedContractorId: number | null = null;
  loyaltyAccount: LoyaltyAccountDTO | null = null;
  loyaltyTransactions: LoyaltyTransactionDTO[] = [];
  loyaltyLoading = false;
  redeeming = false;
  loyaltyCols = ['date', 'type', 'points', 'value', 'description'];

  constructor(
    private contractorService: ContractorService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
    this.loadAll();
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

  // load full list for loyalty dropdown (no search filter)
  loadAll() {
    this.contractorService.getAll().subscribe({
      next: (data) => { this.allContractors = data; },
      error: () => { this.allContractors = []; }
    });
  }

  onContractorSelect(id: number | null) {
    this.loyaltyAccount = null;
    this.loyaltyTransactions = [];
    if (!id) return;

    this.loyaltyLoading = true;

    forkJoin({
      account: this.contractorService.getLoyalty(id),
      transactions: this.contractorService.getLoyaltyTransactions(id)
    }).subscribe({
      next: ({ account, transactions }) => {
        this.loyaltyAccount = account;
        this.loyaltyTransactions = (transactions ?? []).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.loyaltyLoading = false;
      },
      error: () => {
        this.loyaltyLoading = false;
      }
    });
  }

  openRedeemDialog() {
    if (!this.loyaltyAccount) return;

    const contractorName = this.allContractors.find(c => c.id === this.selectedContractorId)?.name ?? '';

    const ref = this.dialog.open(RedeemDialogComponent, {
      data: {
        contractorName,
        points: this.loyaltyAccount.totalPoints
      },
      width: '420px'
    });

    ref.afterClosed().subscribe((pointsToRedeem: number | undefined) => {
      if (!pointsToRedeem || pointsToRedeem <= 0) return;

      const discount = (pointsToRedeem / 10).toFixed(2);
      this.redeeming = true;

      this.contractorService.redeemPoints(this.selectedContractorId!, pointsToRedeem).subscribe({
        next: () => {
          this.snack.open(
            `Zrealizowano ${pointsToRedeem} pkt — przyznano ${discount} zł zniżki!`,
            'OK',
            { duration: 4000 }
          );
          this.redeeming = false;
          this.onContractorSelect(this.selectedContractorId);
        },
        error: (e) => {
          this.snack.open(e.error?.message || 'Błąd realizacji punktów', 'Zamknij', { duration: 3000 });
          this.redeeming = false;
        }
      });
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
          this.loadAll();
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
        this.loadAll();
        if (this.selectedContractorId === id) {
          this.selectedContractorId = null;
          this.loyaltyAccount = null;
          this.loyaltyTransactions = [];
        }
      },
      error: (e) => this.snack.open(e.error?.message || 'Błąd usuwania', 'Zamknij', { duration: 3000 })
    });
  }
}
