import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = 'https://localhost:7273/api/Customers';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    console.log('Fetching customers from:', this.apiUrl);
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      tap((data) => {
        console.log('✓ Customers loaded successfully:', data);
      }),
      catchError((error) => {
        console.error('✗ Error loading customers:', error);
        return throwError(() => error);
      })
    );
  }

  getCustomer(id: number): Observable<Customer> {
    console.log('Fetching customer:', id);
    return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
      tap((data) => {
        console.log('✓ Customer loaded:', data);
      }),
      catchError((error) => {
        console.error('✗ Error loading customer:', error);
        throw error;
      })
    );
  }

  createCustomer(customer: Customer): Observable<any> {
  console.log('Creating customer:', customer);
  return this.http.post(this.apiUrl, customer, { responseType: 'text' }).pipe(
    tap((data) => {
      console.log('✓ Customer created:', data);
    }),
    catchError((error) => {
      console.error('✗ Error creating customer:', error);
      throw error;
    })
  );
}

  updateCustomer(id: number, customer: Customer): Observable<any> {
  console.log('Updating customer:', id, customer);
  return this.http.put(`${this.apiUrl}/${id}`, customer, { responseType: 'text' }).pipe(
    tap(() => {
      console.log('✓ Customer updated:', id);
    }),
    catchError((error) => {
      console.error('✗ Error updating customer:', error);
      throw error;
    })
  );
}

  deleteCustomer(id: number): Observable<void> {
    console.log('Deleting customer:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('✓ Customer deleted:', id);
      }),
      catchError((error) => {
        console.error('✗ Error deleting customer:', error);
        throw error;
      })
    );
  }

  uploadPhoto(id: number, formData: FormData): Observable<any> {
  console.log('Uploading photo for customer:', id);
  return this.http.post(`${this.apiUrl}/${id}/UploadPhoto`, formData, { responseType: 'text' }).pipe(
    tap((url) => {
      console.log('✓ Photo uploaded:', url);
    }),
    catchError((error) => {
      console.error('✗ Error uploading photo:', error);
      throw error;
    })
  );
}
}
