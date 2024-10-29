import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {DataService} from "../../service/data.service";
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {DayPilot} from "daypilot-pro-angular";

@Component({
  selector: 'app-quick-booking',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './quick-booking.component.html',
  styleUrl: './quick-booking.component.css'
})
export class QuickBookingComponent implements OnInit {
  form: FormGroup;
  totalPrice: number | null = null;
  availabilityMessage: string = '';
  hours: string[] = [];

  constructor(private fb: FormBuilder, private ds: DataService, private router: Router) {
    this.form = this.fb.group({
      date: ['', [Validators.required, this.dateValidator]],
      startHour: ['', [Validators.required]],
      endHour: ['', [Validators.required]],
      paymentMethod: ['']
    }, {validator: this.timeRangeValidator});

    for (let i = 8; i <= 20; i++) {
      this.hours.push(i < 10 ? '0' + i : '' + i);
    }
  }

  ngOnInit(): void {
  }

  dateValidator(control: FormControl): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return {'invalidDate': true};
    }
    return null;
  }

  timeRangeValidator: ValidatorFn = (group: AbstractControl): { [key: string]: boolean } | null => {
    const startHour = group.get('startHour')?.value;
    const endHour = group.get('endHour')?.value;
    if (startHour && endHour && startHour >= endHour) {
      return {'invalidTimeRange': true};
    }
    return null;
  };

  checkAvailability() {
    if (this.form.valid) {
      const {date, startHour, endHour} = this.form.value;
      const startTime = new DayPilot.Date(`${date}T${startHour}:00:00`).toString("yyyy-MM-ddTHH:mm:ss");
      const endTime = new DayPilot.Date(`${date}T${endHour}:00:00`).toString("yyyy-MM-ddTHH:mm:ss");

      this.ds.checkAvailability({startTime, endTime}).subscribe(
        (response: any) => {
          if (response.available) {
            const startHours = DayPilot.Date.parse(startTime, "yyyy-MM-ddTHH:mm:ss");
            const endHours = DayPilot.Date.parse(endTime, "yyyy-MM-ddTHH:mm:ss");
            const duration = (endHours.getHours()) - (startHours.getHours());
            this.totalPrice = duration * 3;
            this.availabilityMessage = 'Parking space is available.';
            this.form.controls['paymentMethod'].setValidators([Validators.required]);
            this.form.controls['paymentMethod'].updateValueAndValidity();
          } else {
            this.totalPrice = null;
            this.availabilityMessage = 'No parking space available for the selected time.';
            this.form.controls['paymentMethod'].clearValidators();
            this.form.controls['paymentMethod'].updateValueAndValidity();
          }
        },
        (error: any) => {
          this.totalPrice = null;
          this.availabilityMessage = 'Error checking availability.';
          this.form.controls['paymentMethod'].clearValidators();
          this.form.controls['paymentMethod'].updateValueAndValidity();
        }
      );
    }
  }

  onPaymentMethodChange(paymentMethod: string) {
    if (paymentMethod === 'cash') {
      this.submit();
    } else if (paymentMethod === 'card') {
      this.router.navigate(['/payment'], {
        state: {
          bookingDetails: {
            startTime: new DayPilot.Date(`${this.form.value.date}T${this.form.value.startHour}:00:00`).toString("yyyy-MM-ddTHH:mm:ss"),
            endTime: new DayPilot.Date(`${this.form.value.date}T${this.form.value.endHour}:00:00`).toString("yyyy-MM-ddTHH:mm:ss"),
            paymentMethod: this.form.value.paymentMethod,
            amount: this.totalPrice
          },
          totalPrice: this.totalPrice
        }
      });
    }
  }

  submit() {
    if (this.form.valid && this.totalPrice !== null) {
      const {date, startHour, endHour, paymentMethod} = this.form.value;
      const startTime = new DayPilot.Date(`${date}T${startHour}:00:00`).toString("yyyy-MM-ddTHH:mm:ss");
      const endTime = new DayPilot.Date(`${date}T${endHour}:00:00`).toString("yyyy-MM-ddTHH:mm:ss");

      const bookingData = {
        startTime,
        endTime,
        paymentMethod,
        amount: this.totalPrice
      };

      this.ds.quickBooking(bookingData).subscribe(
        (response: any) => {
          if (paymentMethod === 'card') {
            this.router.navigate(['/payment'], {state: {bookingDetails: response, totalPrice: this.totalPrice}});
          } else {
            this.router.navigate(['/booking-success']);
          }
        },
        (error: any) => {
          alert('Failed to create booking: ' + error.message);
        }
      );
    }
  }
}
