import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.api);
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/roles`);
  }

  create(data: { username: string; password: string; role: string }): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.api}/register`, data);
  }

  updateUsername(id: number, username: string): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.api}/${id}`, null, {
      params: new HttpParams().set('username', username)
    });
  }

  changeRole(id: number, role: string): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.api}/${id}/role`, { role });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
