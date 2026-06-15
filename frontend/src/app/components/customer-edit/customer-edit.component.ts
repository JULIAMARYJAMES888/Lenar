import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../models/customer.model';
import { CustomerContact } from '../../models/customer-contact.model';
import { CustomerBankDetail } from '../../models/customer-bank-detail.model';
import { CustomerService } from '../../services/customer.service';
import { CustomerContactService } from '../../services/customer-contact.service';
import { CustomerBankDetailService } from '../../services/customer-bank-detail.service';

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^[6-9]\d{9}$/.test(control.value.replace(/\s+/g, '')) ? null : { invalidPhone: true };
}

function ifscValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(control.value.toUpperCase()) ? null : { invalidIfsc: true };
}

function accountNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^\d{9,18}$/.test(control.value) ? null : { invalidAccount: true };
}

function postalCodeValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^\d{6}$/.test(control.value) ? null : { invalidPostal: true };
}

function nameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^[a-zA-Z\s'-]+$/.test(control.value) ? null : { invalidName: true };
}

function dobValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const dob = new Date(control.value);
  const today = new Date();
  if (dob >= today) return { futureDate: true };
  if (today.getFullYear() - dob.getFullYear() > 120) return { invalidDob: true };
  return null;
}

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css']
})
export class CustomerEditComponent implements OnInit {
  customerForm!: FormGroup;
  contactForm!: FormGroup;
  bankForm!: FormGroup;

  customerId!: number;
  existingContactId: number | null = null;
  existingBankId: number | null = null;

  loading = true;
  submitting = false;
  errorMessage = '';
  pincodeLoading = false;
  pincodeError = '';

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  existingImageUrl: string | null = null;
  photoError = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private contactService: CustomerContactService,
    private bankService: CustomerBankDetailService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));

    this.customerForm = this.fb.group({
      firstName:   ['', [Validators.required, nameValidator]],
      middleName:  ['', [nameValidator]],
      lastName:    ['', [Validators.required, nameValidator]],
      dateOfBirth: ['', [dobValidator]],
      gender:      [''],
      occupation:  ['', [Validators.minLength(2)]],
      isActive:    [true],
      imageUrl:    ['']
    });

    this.contactForm = this.fb.group({
      phoneNumber:  ['', [phoneValidator]],
      email:        ['', [Validators.email]],
      addressLine1: ['', [Validators.minLength(5)]],
      city:         ['', [nameValidator]],
      state:        ['', [nameValidator]],
      country:      ['', [nameValidator]],
      postalCode:   ['', [postalCodeValidator]]
    });

    this.bankForm = this.fb.group({
      bankName:      ['', [Validators.minLength(3)]],
      accountNumber: ['', [accountNumberValidator]],
      ifscCode:      ['', [ifscValidator]],
      branchName:    ['', [Validators.minLength(3)]]
    });

    this.loadData();
  }

  private loadData(): void {
    this.customerService.getCustomer(this.customerId).subscribe({
      next: (customer: Customer) => {
        const dob = customer.dateOfBirth
          ? new Date(customer.dateOfBirth).toISOString().split('T')[0]
          : '';
        this.customerForm.patchValue({ ...customer, dateOfBirth: dob });
        this.existingImageUrl = customer.imageUrl ?? null;

        this.contactService.getContacts().subscribe({
          next: (contacts) => {
            const c = contacts.find(x => x.customerId === this.customerId);
            if (c) {
              this.existingContactId = c.contactId ?? null;
              this.contactForm.patchValue(c);
            }
            this.cdr.detectChanges();
          }
        });

        this.bankService.getBankDetails().subscribe({
          next: (banks) => {
            const b = banks.find(x => x.customerId === this.customerId);
            if (b) {
              this.existingBankId = b.bankDetailId ?? null;
              this.bankForm.patchValue(b);
            }
            this.cdr.detectChanges();
          }
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Failed to load customer data.';
        this.cdr.detectChanges();
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoError = '';
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) {
        this.photoError = 'Only JPG or PNG files are allowed.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = 'File size must be under 5 MB.';
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    document.getElementById('editPhotoInput')?.click();
  }

  get currentPhoto(): string | null {
    if (this.previewUrl) return this.previewUrl;
    if (this.existingImageUrl) return 'https://localhost:7273' + this.existingImageUrl;
    return null;
  }

  onPincodeChange(): void {
    const pincode = this.contactForm.get('postalCode')?.value;
    if (!/^\d{6}$/.test(pincode)) return;

    this.pincodeLoading = true;
    this.pincodeError = '';

    this.http.get<any[]>(`https://api.postalpincode.in/pincode/${pincode}`).subscribe({
      next: (res) => {
        this.pincodeLoading = false;
        if (res[0]?.Status === 'Success') {
          const po = res[0].PostOffice[0];
          this.contactForm.patchValue({
            city: po.District,
            state: po.State,
            country: 'India'
          });
        } else {
          this.pincodeError = 'Pincode not found.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.pincodeLoading = false;
        this.pincodeError = 'Could not fetch pincode details.';
        this.cdr.detectChanges();
      }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  getError(form: FormGroup, field: string): string {
    const c = form.get(field);
    if (!c || !c.errors || !c.touched) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['invalidName']) return 'Only letters, spaces, hyphens and apostrophes allowed.';
    if (c.errors['invalidPhone']) return 'Enter a valid 10-digit Indian mobile number.';
    if (c.errors['email']) return 'Enter a valid email address.';
    if (c.errors['invalidIfsc']) return 'Enter a valid IFSC code (e.g. SBIN0001234).';
    if (c.errors['invalidAccount']) return 'Account number must be 9–18 digits.';
    if (c.errors['invalidPostal']) return 'Enter a valid 6-digit pincode.';
    if (c.errors['futureDate']) return 'Date of birth cannot be in the future.';
    if (c.errors['invalidDob']) return 'Enter a valid date of birth.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return 'Invalid value.';
  }

  submit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.customerService.updateCustomer(this.customerId, this.customerForm.value).subscribe({
      next: () => {
        const tasks: Promise<void>[] = [];

        const cv = this.contactForm.value;
        const hasContact = !!(cv.phoneNumber || cv.email || cv.addressLine1);
        if (hasContact) {
          const contact = { ...cv, customerId: this.customerId };
          if (this.existingContactId) {
            tasks.push(new Promise((res, rej) =>
              this.contactService.updateContact(this.existingContactId!, contact).subscribe({ next: () => res(), error: rej })
            ));
          } else {
            tasks.push(new Promise((res, rej) =>
              this.contactService.createContact(contact).subscribe({ next: () => res(), error: rej })
            ));
          }
        }

        const bv = this.bankForm.value;
        const hasBank = !!(bv.bankName || bv.accountNumber || bv.ifscCode);
        if (hasBank) {
          const bank = { ...bv, customerId: this.customerId };
          if (this.existingBankId) {
            tasks.push(new Promise((res, rej) =>
              this.bankService.updateBankDetail(this.existingBankId!, bank).subscribe({ next: () => res(), error: rej })
            ));
          } else {
            tasks.push(new Promise((res, rej) =>
              this.bankService.createBankDetail(bank).subscribe({ next: () => res(), error: rej })
            ));
          }
        }

        if (this.selectedFile) {
          const fd = new FormData();
          fd.append('file', this.selectedFile);
          tasks.push(new Promise((res, rej) =>
            this.customerService.uploadPhoto(this.customerId, fd).subscribe({ next: () => res(), error: rej })
          ));
        }

        Promise.all(tasks).then(() => {
          this.submitting = false;
          this.router.navigate(['/customers', this.customerId]);
        }).catch((err) => {
          console.error(err);
          this.submitting = false;
          this.errorMessage = 'Customer updated but some details failed to save.';
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.errorMessage = 'Failed to update customer.';
        this.cdr.detectChanges();
      }
    });
  }
}