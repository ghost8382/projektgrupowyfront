import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = 'http://localhost:8080/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.api}/dictionary`);
  }

  getFlat(): Observable<Record<number, string>> {
    return this.http.get<Record<number, string>>(`${this.api}/flat`);
  }

  create(name: string, parentId?: number | null): Observable<CategoryDTO> {
    let params = new HttpParams().set('name', name);
    if (parentId != null) params = params.set('parentId', parentId);
    return this.http.post<CategoryDTO>(this.api, null, { params });
  }

  update(id: number, name: string, parentId?: number | null): Observable<CategoryDTO> {
    let params = new HttpParams().set('name', name);
    if (parentId != null) params = params.set('parentId', parentId);
    else params = params.delete('parentId');
    return this.http.put<CategoryDTO>(`${this.api}/${id}`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
