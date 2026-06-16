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
  filterStatus = 'active'; // default: show only active
  sortPreset = '';

  sortColumn: keyof Customer | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  loading = false;
  errorMessage = '';

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadCustomers(); }

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

  get totalCount():    number { return this.customers.filter(c => c.isActive).length; }
  get activeCount():   number { return this.customers.filter(c => c.isActive).length; }
  get inactiveCount(): number { return this.customers.filter(c => !c.isActive).length; }

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

    // Default: show only active unless filter says otherwise
    if (this.filterStatus === 'active')   result = result.filter(c => c.isActive);
    if (this.filterStatus === 'inactive') result = result.filter(c => !c.isActive);
    if (this.filterStatus === 'all')      { /* show all */ }
    if (this.filterStatus === 'male')     result = result.filter(c => c.isActive && c.gender?.toLowerCase() === 'male');
    if (this.filterStatus === 'female')   result = result.filter(c => c.isActive && c.gender?.toLowerCase() === 'female');
    if (this.filterStatus === 'other')    result = result.filter(c => c.isActive && c.gender?.toLowerCase() === 'other');
    if (this.filterStatus === '')         result = result.filter(c => c.isActive);

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

  applyPresetSort(): void {
    switch (this.sortPreset) {
      case 'name-asc':  this.sortColumn = 'firstName';  this.sortDirection = 'asc';  break;
      case 'name-desc': this.sortColumn = 'firstName';  this.sortDirection = 'desc'; break;
      case 'id-asc':    this.sortColumn = 'customerId'; this.sortDirection = 'asc';  break;
      case 'id-desc':   this.sortColumn = 'customerId'; this.sortDirection = 'desc'; break;
      default:          this.sortColumn = '';            this.sortDirection = 'asc';
    }
    this.applyFilter();
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
    this.filterStatus = 'active';
    this.sortPreset = '';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.applyFilter();
  }

  get hasFilters(): boolean {
    return !!(this.searchTerm || (this.filterStatus && this.filterStatus !== 'active'));
  }

  initials(c: Customer): string {
    return ((c.firstName?.[0] ?? '') + (c.lastName?.[0] ?? '')).toUpperCase();
  }

  viewCustomer(id: number): void { this.router.navigate(['/customers', id]); }
  editCustomer(id: number): void { this.router.navigate(['/customers/edit', id]); }

  // Soft delete — set isActive to false instead of deleting
  deleteCustomer(id: number): void {
  if (!confirm('Deactivate this customer? They will be hidden from the directory.')) return;

  // First fetch the full customer object, then update
  this.customerService.getCustomer(id).subscribe({
    next: (customer) => {
      const updated = {
        ...customer,
        isActive: false,
        imageUrl: customer.imageUrl ?? ''
      };

      this.customerService.updateCustomer(id, updated).subscribe({
        next: () => {
          const idx = this.customers.findIndex(c => c.customerId === id);
          if (idx !== -1) this.customers[idx] = { ...this.customers[idx], isActive: false };
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to deactivate customer.';
          this.cdr.detectChanges();
        }
      });
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Failed to fetch customer details.';
      this.cdr.detectChanges();
    }
  });
}
}