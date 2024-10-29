import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DataService} from "../../service/data.service";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  bookingDetails: any;
  totalPrice: number;
  isGuestUser: boolean;

  constructor(private router: Router, private ds: DataService, private fb: FormBuilder) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { bookingDetails: any, totalPrice: number };
    this.bookingDetails = state.bookingDetails;
    this.totalPrice = state.totalPrice;

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^[0-9]{16}$/)]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    });

    this.isGuestUser = !localStorage.getItem('jwtToken');
  }

  ngOnInit(): void {
  }

  onPaymentSubmit() {
    if (this.paymentForm.valid) {
      if (this.isGuestUser) {
        this.ds.quickBooking(this.bookingDetails).subscribe(
          (response) => {
            this.router.navigate(['/booking-success'], {state: {bookingDetails: this.bookingDetails}});
          },
          (error) => {
            alert('Payment failed: ' + error.message);
          }
        );
      } else {
        this.ds.createEvent(this.bookingDetails).subscribe(
          (response) => {
            this.router.navigate(['/scheduler'], {state: {bookingDetails: this.bookingDetails}});
          },
          (error) => {
            alert('Payment failed: ' + error.message);
          }
        );
      }
    }
  }
}
