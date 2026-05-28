import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, ProductDTO, StockMovementDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  getAll(filters: { categoryId?: number | null; name?: string; page?: number; size?: number } = {}): Observable<PageResponse<ProductDTO>> {
    let params = new HttpParams();
    if (filters.categoryId != null) params = params.set('categoryId', filters.categoryId);
    if (filters.name) params = params.set('name', filters.name);
    if (filters.page != null) params = params.set('page', filters.page);
    if (filters.size != null) params = params.set('size', filters.size);
    return this.http.get<PageResponse<ProductDTO>>(this.api, { params });
  }

  add(product: Partial<ProductDTO>, categoryId?: number | null): Observable<ProductDTO> {
    let params = new HttpParams();
    if (categoryId != null) params = params.set('categoryId', categoryId);
    return this.http.post<ProductDTO>(this.api, product, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  addStock(id: number, quantity: number): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(`${this.api}/${id}/add-stock`, null, {
      params: new HttpParams().set('quantity', quantity)
    });
  }

  removeStock(id: number, quantity: number): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(`${this.api}/${id}/remove-stock`, null, {
      params: new HttpParams().set('quantity', quantity)
    });
  }

  getMovements(id: number): Observable<StockMovementDTO[]> {
    return this.http.get<StockMovementDTO[]>(`${this.api}/${id}/movements`);
  }
}
