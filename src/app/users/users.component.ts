import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../services/user.service';
import { UserDTO } from '../models/models';
import { UserDialogComponent } from './user-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatDialogModule,
    MatSnackBarModule, MatCardModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 class="page-title">👥 Użytkownicy</h2>
    <div class="action-bar">
      <span class="spacer"></span>
      <button mat-raised-button color="primary" (click)="openAddDialog()">
        <mat-icon>person_add</mat-icon> Dodaj użytkownika
      </button>
    </div>
    <mat-card>
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:40px">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      <table mat-table [dataSource]="dataSource" class="full-width" *ngIf="!loading">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let u">{{ u.id }}</td>
        </ng-container>
        <ng-container matColumnDef="username">
          <th mat-header-cell *matHeaderCellDef>Login</th>
          <td mat-cell *matCellDef="let u"><strong>{{ u.username }}</strong></td>
        </ng-container>
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Rola</th>
          <td mat-cell *matCellDef="let u">
            <mat-select [value]="u.role" (selectionChange)="changeRole(u.id!, $event.value)"
              style="font-size:14px;min-width:100px">
              <mat-option *ngFor="let r of roles" [value]="r">{{ r }}</mat-option>
            </mat-select>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Akcje</th>
          <td mat-cell *matCellDef="let u">
            <button mat-icon-button color="warn" matTooltip="Usuń" (click)="delete(u.id!)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols" class="table-row"></tr>
      </table>
    </mat-card>
  `,
  styles: [`.table-row:hover { background: #f5f5f5; } mat-card { border-radius: 12px !important; overflow: hidden; }`]
})
export class UsersComponent implements OnInit {
  dataSource = new MatTableDataSource<UserDTO>();
  cols = ['id', 'username', 'role', 'actions'];
  roles: string[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.userService.getRoles().subscribe(r => this.roles = r);
    this.load();
  }

  load() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => { this.dataSource.data = users; this.loading = false; },
      error: (e) => { this.snack.open(e.error?.message || 'Błąd ładowania', 'Zamknij', { duration: 3000 }); this.loading = false; }
    });
  }

  openAddDialog() {
    const ref = this.dialog.open(UserDialogComponent, { data: { roles: this.roles } });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.userService.create(result).subscribe({
        next: () => { this.snack.open('Użytkownik dodany!', 'OK', { duration: 2000 }); this.load(); },
        error: (e) => this.snack.open(e.error?.message || 'Błąd dodawania', 'Zamknij', { duration: 3000 })
      });
    });
  }

  changeRole(id: number, role: string) {
    this.userService.changeRole(id, role).subscribe({
      next: () => this.snack.open('Rola zmieniona!', 'OK', { duration: 2000 }),
      error: (e) => this.snack.open(e.error?.message || 'Błąd zmiany roli', 'Zamknij', { duration: 3000 })
    });
  }

  delete(id: number) {
    if (!confirm('Czy na pewno usunąć użytkownika?')) return;
    this.userService.delete(id).subscribe({
      next: () => { this.snack.open('Usunięto!', 'OK', { duration: 2000 }); this.load(); },
      error: (e) => this.snack.open(e.error?.message || 'Błąd usuwania', 'Zamknij', { duration: 3000 })
    });
  }
}
