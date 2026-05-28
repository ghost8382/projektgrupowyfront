import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyConfigDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CompanyConfigService {
  private api = 'http://localhost:8080/api/company';

  constructor(private http: HttpClient) {}

  get(): Observable<CompanyConfigDTO> {
    return this.http.get<CompanyConfigDTO>(this.api);
  }

  save(dto: CompanyConfigDTO): Observable<CompanyConfigDTO> {
    return this.http.put<CompanyConfigDTO>(this.api, dto);
  }
}

