import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">

        <div class="sidenav-header">
          <mat-icon class="logo-icon">inventory_2</mat-icon>
          <span class="logo-text">StockUi</span>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <a mat-list-item routerLink="/products" routerLinkActive="active-link">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Produkty</span>
          </a>

          <a mat-list-item routerLink="/categories" routerLinkActive="active-link">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Kategorie</span>
          </a>

          <a mat-list-item routerLink="/users" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Użytkownicy</span>
          </a>

          <a mat-list-item routerLink="/contractors" routerLinkActive="active-link">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Kontrahenci</span>
          </a>

          <a mat-list-item routerLink="/sales" routerLinkActive="active-link">
            <mat-icon matListItemIcon>point_of_sale</mat-icon>
            <span matListItemTitle>Sprzedaż</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info">
            <mat-icon style="font-size:16px;width:16px;height:16px">person</mat-icon>
            <span>{{ user?.username }}</span>
            <span class="role-badge">{{ user?.role }}</span>
          </div>

          <button mat-icon-button (click)="logout()" matTooltip="Wyloguj się" color="warn">
            <mat-icon>logout</mat-icon>
          </button>
        </div>

      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <span>System Zarządzania Magazynem</span>
        </mat-toolbar>

        <div class="content-area">
          <router-outlet />
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 230px;
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 14px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .logo-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: var(--mat-sys-primary);
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    mat-nav-list { flex: 1; padding-top: 8px; }

    mat-nav-list a {
      color: var(--mat-sys-on-surface-variant) !important;
      border-radius: 8px;
      margin: 2px 8px;
      height: 48px;
    }

    mat-nav-list a:hover {
      background: var(--mat-sys-surface-container-highest) !important;
    }

    .active-link {
      background: var(--mat-sys-primary-container) !important;
      color: var(--mat-sys-on-primary-container) !important;
      font-weight: 600;
    }

    .sidenav-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
    }

    .role-badge {
      background: var(--mat-sys-secondary-container);
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 10px;
      text-transform: uppercase;
      color: var(--mat-sys-on-secondary-container);
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .content-area {
      padding: 24px;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class ShellComponent {

  user: any = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.user = this.auth.getCurrentUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

