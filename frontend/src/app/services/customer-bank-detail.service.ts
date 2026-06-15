import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerBankDetail } from '../models/customer-bank-detail.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerBankDetailService {
  private readonly apiUrl = 'https://localhost:7273/api/CustomerBankDetails';

  constructor(private http: HttpClient) {}

  getBankDetails(): Observable<CustomerBankDetail[]> {
    return this.http.get<CustomerBankDetail[]>(this.apiUrl);
  }

  getBankDetail(id: number): Observable<CustomerBankDetail> {
    return this.http.get<CustomerBankDetail>(`${this.apiUrl}/${id}`);
  }

  createBankDetail(bank: CustomerBankDetail): Observable<any> {
    return this.http.post(this.apiUrl, bank);
  }

  updateBankDetail(id: number, bank: CustomerBankDetail): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, bank);
  }

  deleteBankDetail(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}