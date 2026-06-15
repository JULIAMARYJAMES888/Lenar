import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];

  searchTerm = '';
  filterGender = '';
  filterStatus = '';

  sortColumn: keyof Customer | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  loading = false;
  errorMessage = '';

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load customers.';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    let result = [...this.customers];

    if (term) {
      result = result.filter(c =>
        c.customerId?.toString().includes(term) ||
        c.firstName?.toLowerCase().includes(term) ||
        c.lastName?.toLowerCase().includes(term) ||
        c.occupation?.toLowerCase().includes(term) ||
        c.gender?.toLowerCase().includes(term)
      );
    }

    if (this.filterGender) {
      result = result.filter(c => c.gender === this.filterGender);
    }

    if (this.filterStatus !== '') {
      const isActive = this.filterStatus === 'active';
      result = result.filter(c => c.isActive === isActive);
    }

    if (this.sortColumn) {
      result.sort((a, b) => {
        const valA = a[this.sortColumn as keyof Customer];
        const valB = b[this.sortColumn as keyof Customer];
        if (valA == null) return 1;
        if (valB == null) return -1;
        const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    this.filteredCustomers = result;
  }

  setSort(col: keyof Customer): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }

  sortIcon(col: string): string {
    if (this.sortColumn !== col) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterGender = '';
    this.filterStatus = '';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.applyFilter();
  }

  get hasFilters(): boolean {
    return !!(this.searchTerm || this.filterGender || this.filterStatus);
  }

  initials(c: Customer): string {
    return ((c.firstName?.[0] ?? '') + (c.lastName?.[0] ?? '')).toUpperCase();
  }

  viewCustomer(id: number): void { this.router.navigate(['/customers', id]); }
  editCustomer(id: number): void { this.router.navigate(['/customers/edit', id]); }

  deleteCustomer(id: number): void {
    if (!confirm('Delete this customer? This cannot be undone.')) return;
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.customerId !== id);
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to delete customer.';
        this.cdr.detectChanges();
      }
    });
  }
}