import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.api}/login`, { username, password }).pipe(
      tap(user => localStorage.setItem('user', JSON.stringify(user)))
    );
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  getCurrentUser(): UserDTO | null {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser()?.username;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }
}
