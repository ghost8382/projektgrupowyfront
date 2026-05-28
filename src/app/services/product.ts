import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  categoryName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = 'http://localhost:8080/products';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }

  add(product: Product): Observable<Product> {
    return this.http.post<Product>(this.api, product);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
