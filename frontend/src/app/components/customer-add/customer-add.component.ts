import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  if (!control.value) return { required: true };
  const dob = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dob >= today) return { futureDate: true };
  if (today.getFullYear() - dob.getFullYear() > 120) return { invalidDob: true };
  const age18Date = new Date(dob);
  age18Date.setFullYear(age18Date.getFullYear() + 18);
  if (age18Date > today) return { underage: true };
  return null;
}

@Component({
  selector: 'app-customer-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-add.component.html',
  styleUrls: ['./customer-add.component.css']
})
export class CustomerAddComponent {
  customerForm: FormGroup;
  contactForm: FormGroup;
  bankForm: FormGroup;

  submitting = false;
  errorMessage = '';
  pincodeLoading = false;
  pincodeError = '';
  bankMismatchWarning = '';

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  photoError = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private contactService: CustomerContactService,
    private bankService: CustomerBankDetailService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.customerForm = this.fb.group({
      firstName:   ['', [Validators.required, nameValidator]],
      middleName:  ['', [nameValidator]],
      lastName:    ['', [Validators.required, nameValidator]],
      dateOfBirth: ['', [Validators.required, dobValidator]],
      gender:      ['', [Validators.required]],
      occupation:  ['', [Validators.required, Validators.minLength(2)]],
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
    document.getElementById('photoInput')?.click();
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
        const postOffices = res[0].PostOffice;
        const po = postOffices[0];

        // Use the post office name as city (more specific than district)
        // Try to find a post office with a meaningful name (not just the division)
        const cityPo = postOffices.find((p: any) =>
          p.BranchType === 'Head Post Office' || p.BranchType === 'Sub Post Office'
        ) || po;

        this.contactForm.patchValue({
          city: cityPo.Name,      // actual post office / area name
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

  checkIfscBankMatch(): void {
    const ifsc = this.bankForm.get('ifscCode')?.value?.toUpperCase();
    const bank = this.bankForm.get('bankName')?.value?.toUpperCase();
    if (!ifsc || !bank || ifsc.length < 4) { this.bankMismatchWarning = ''; return; }

    const ifscPrefix = ifsc.substring(0, 4);
    const bankKeywords: { [key: string]: string[] } = {
      'SBIN': ['STATE BANK', 'SBI'],
      'HDFC': ['HDFC'],
      'ICIC': ['ICICI'],
      'UTIB': ['AXIS'],
      'PUNB': ['PUNJAB NATIONAL', 'PNB'],
      'BKID': ['BANK OF INDIA', 'BOI'],
      'BARB': ['BANK OF BARODA', 'BOB'],
      'CNRB': ['CANARA'],
      'UBIN': ['UNION BANK'],
      'IOBA': ['INDIAN OVERSEAS'],
      'SIBL': ['SOUTH INDIAN'],
      'FDRL': ['FEDERAL'],
      'KVBL': ['KARUR VYSYA', 'KVB'],
      'CBIN': ['CENTRAL BANK'],
      'IDIB': ['INDIAN BANK'],
      'ALLA': ['ALLAHABAD'],
      'YESB': ['YES BANK'],
      'KKBK': ['KOTAK'],
      'IDFC': ['IDFC'],
      'RATN': ['RBL'],
    };

    const keywords = bankKeywords[ifscPrefix];
    if (keywords) {
      const matches = keywords.some(k => bank.includes(k));
      this.bankMismatchWarning = matches ? '' :
        `IFSC prefix "${ifscPrefix}" may not match "${this.bankForm.get('bankName')?.value}". Please verify.`;
    } else {
      this.bankMismatchWarning = '';
    }
  }

  get hasContactData(): boolean {
    const v = this.contactForm.value;
    return !!(v.phoneNumber || v.email || v.addressLine1 || v.city);
  }

  get hasBankData(): boolean {
    const v = this.bankForm.value;
    return !!(v.bankName || v.accountNumber || v.ifscCode);
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
    if (c.errors['underage']) return 'Customer must be at least 18 years old.';
    if (c.errors['invalidDob']) return 'Enter a valid date of birth.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return 'Invalid value.';
  }

  submit(): void {
    this.customerForm.markAllAsTouched();
    this.contactForm.markAllAsTouched();
    this.bankForm.markAllAsTouched();

    if (this.customerForm.invalid || this.contactForm.invalid || this.bankForm.invalid) return;

    this.submitting = true;
    this.errorMessage = '';

    const customerData = this.customerForm.value;
    const bankData = {
      ...this.bankForm.value,
      ifscCode: this.bankForm.value.ifscCode?.toUpperCase()
    };

    this.customerService.createCustomer(customerData).subscribe({
      next: () => {
        this.customerService.getCustomers().subscribe({
          next: (list) => {
            const latest = list.sort((a, b) => (b.customerId ?? 0) - (a.customerId ?? 0))[0];
            this.saveRelated(latest?.customerId ?? null, bankData);
          },
          error: () => this.saveRelated(null, bankData)
        });
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.errorMessage = 'Failed to create customer. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  private saveRelated(id: number | null, bankData: any): void {
    const tasks: Promise<void>[] = [];

    if (id && this.hasContactData) {
      const contact = { ...this.contactForm.value, customerId: id };
      tasks.push(new Promise((res, rej) =>
        this.contactService.createContact(contact).subscribe({ next: () => res(), error: rej })
      ));
    }

    if (id && this.hasBankData) {
      const bank = { ...bankData, customerId: id };
      tasks.push(new Promise((res, rej) =>
        this.bankService.createBankDetail(bank).subscribe({ next: () => res(), error: rej })
      ));
    }

    if (id && this.selectedFile) {
      const fd = new FormData();
      fd.append('file', this.selectedFile);
      tasks.push(new Promise((res, rej) =>
        this.customerService.uploadPhoto(id, fd).subscribe({ next: () => res(), error: rej })
      ));
    }

    Promise.all(tasks).then(() => {
      this.submitting = false;
      this.router.navigate(['/customers']);
    }).catch((err) => {
      console.error(err);
      this.submitting = false;
      this.errorMessage = 'Customer created but some details failed to save.';
      this.cdr.detectChanges();
      setTimeout(() => this.router.navigate(['/customers']), 2500);
    });
  }
}