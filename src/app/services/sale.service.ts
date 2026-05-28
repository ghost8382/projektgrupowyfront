import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSaleRequest, SaleDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private api = 'http://localhost:8080/api/sales';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SaleDTO[]> {
    return this.http.get<SaleDTO[]>(this.api);
  }

  getById(id: number): Observable<SaleDTO> {
    return this.http.get<SaleDTO>(`${this.api}/${id}`);
  }

  getByUser(userId: number): Observable<SaleDTO[]> {
    return this.http.get<SaleDTO[]>(`${this.api}/user/${userId}`);
  }

  getByContractor(contractorId: number): Observable<SaleDTO[]> {
    return this.http.get<SaleDTO[]>(`${this.api}/contractor/${contractorId}`);
  }

  create(request: CreateSaleRequest): Observable<SaleDTO> {
    return this.http.post<SaleDTO>(this.api, request);
  }

  downloadReceipt(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/pdf/receipt`, { responseType: 'blob' });
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/pdf/invoice`, { responseType: 'blob' });
  }
}
