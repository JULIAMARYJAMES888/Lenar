import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Customer } from '../../models/customer.model';
import { CustomerContact } from '../../models/customer-contact.model';
import { CustomerBankDetail } from '../../models/customer-bank-detail.model';
import { CustomerService } from '../../services/customer.service';
import { CustomerContactService } from '../../services/customer-contact.service';
import { CustomerBankDetailService } from '../../services/customer-bank-detail.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css']
})
export class CustomerDetailsComponent implements OnInit {
  customer?: Customer;
  contact?: CustomerContact;
  bankDetail?: CustomerBankDetail;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private contactService: CustomerContactService,
    private bankService: CustomerBankDetailService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.customerService.getCustomer(id).subscribe({
      next: (data) => {
        this.customer = data;
        this.loading = false;
        this.cdr.detectChanges();

        this.contactService.getContacts().subscribe({
          next: (contacts) => {
            this.contact = contacts.find(c => c.customerId === id);
            this.cdr.detectChanges();
          }
        });

        this.bankService.getBankDetails().subscribe({
          next: (banks) => {
            this.bankDetail = banks.find(b => b.customerId === id);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load customer.';
        this.cdr.detectChanges();
      }
    });
  }

  get initials(): string {
    if (!this.customer) return '';
    return ((this.customer.firstName?.[0] ?? '') + (this.customer.lastName?.[0] ?? '')).toUpperCase();
  }

  get fullName(): string {
    if (!this.customer) return '';
    return [this.customer.firstName, this.customer.middleName, this.customer.lastName].filter(Boolean).join(' ');
  }

  formatDate(d?: string | Date | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}