import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContractorDTO } from '../models/models';

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
}
