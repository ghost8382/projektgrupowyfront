import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContractorDTO, LoyaltyAccountDTO, LoyaltyTransactionDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ContractorService {
  private api = 'http://localhost:8080/api/contractors';

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<ContractorDTO[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ContractorDTO[]>(this.api, { params });
  }

  getById(id: number): Observable<ContractorDTO> {
    return this.http.get<ContractorDTO>(`${this.api}/${id}`);
  }

  create(dto: ContractorDTO): Observable<ContractorDTO> {
    return this.http.post<ContractorDTO>(this.api, dto);
  }

  update(id: number, dto: ContractorDTO): Observable<ContractorDTO> {
    return this.http.put<ContractorDTO>(`${this.api}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getLoyalty(contractorId: number): Observable<LoyaltyAccountDTO> {
    return this.http.get<LoyaltyAccountDTO>(`${this.api}/${contractorId}/loyalty`);
  }

  getLoyaltyTransactions(contractorId: number): Observable<LoyaltyTransactionDTO[]> {
    return this.http.get<LoyaltyTransactionDTO[]>(`${this.api}/${contractorId}/loyalty/transactions`);
  }

  redeemPoints(contractorId: number, points: number): Observable<any> {
    return this.http.post(`${this.api}/${contractorId}/loyalty/redeem`, { points });
  }
}
