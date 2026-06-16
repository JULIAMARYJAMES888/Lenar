import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerContact } from '../models/customer-contact.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerContactService {
  private readonly apiUrl = 'https://localhost:7273/api/CustomerContacts';

  constructor(private http: HttpClient) {}

  getContacts(): Observable<CustomerContact[]> {
    return this.http.get<CustomerContact[]>(this.apiUrl);
  }

  getContact(id: number): Observable<CustomerContact> {
    return this.http.get<CustomerContact>(`${this.apiUrl}/${id}`);
  }

  createContact(contact: CustomerContact): Observable<any> {
  return this.http.post(this.apiUrl, contact, { responseType: 'text' });
}

updateContact(id: number, contact: CustomerContact): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, contact, { responseType: 'text' });
}

deleteContact(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
}
}