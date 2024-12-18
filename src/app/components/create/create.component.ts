import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {DayPilot, DayPilotModalComponent, DayPilotModule} from "daypilot-pro-angular";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EventCreateParams} from "../../service/data.service";
import {CommonModule} from "@angular/common";
import {Router, RouterLink, RouterLinkActive, RouterModule} from "@angular/router";
import {DataService} from "../../service/data.service";

@Component({
  selector: 'create-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DayPilotModule, CommonModule, RouterLinkActive, RouterModule, RouterLink],
  templateUrl: 'create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {

  @ViewChild("modal") modal!: DayPilotModalComponent;
  @Output() close = new EventEmitter();

  form: FormGroup;
  dateFormat = "yyyy-MM-ddTHH:mm:ss";
  resources: any[] = [];
  totalPrice: number = 0;
  pricePerHour: number = 3;

  constructor(private fb: FormBuilder, private ds: DataService, private router: Router) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      start: ["", this.dateTimeValidator(this.dateFormat)],
      end: [""
        , [Validators.required, this.dateTimeValidator(this.dateFormat)]
      ],
      resource: [{value: "", disabled: true}, Validators.required],
      paymentMethod: ["", Validators.required],
      userId: "",
      amount: 0
    });

    this.ds.getResources().subscribe(result => this.resources = result);
  }

  show(args: any) {
    const formattedStart = args.start.toString(this.dateFormat);
    const formattedEnd = args.end.addHours(-1).toString(this.dateFormat);

    this.form.setValue({
      start: formattedStart,
      end: formattedEnd,
      name: args.name || "",
      resource: args.resource,
      paymentMethod: "",
      userId: "",
      amount: 0
    });
    this.calculatePrice(formattedStart, formattedEnd);
    this.modal.show();
  }

  submit() {
    if (this.form.valid && this.totalPrice !== null) {
      let data = this.form.getRawValue();
      let start = DayPilot.Date.parse(data.start, this.dateFormat).toString(this.dateFormat);
      let end = DayPilot.Date.parse(data.end, this.dateFormat).addHours(1).toString(this.dateFormat);

      let params: EventCreateParams = {
        start: start,
        end: end,
        text: data.name,
        resource: this.form.get('resource')?.value,
        userId: data.userId,
        amount: this.totalPrice
      };

      if (this.ds.isLoggedIn()) {
        this.submitForLoggedInUser(params, data);
      } else {
        this.submitForGuestUser(data);
      }
    }
  }


  submitForLoggedInUser(bookingData: any, data: any) {
    if (data.paymentMethod === 'cash') {
      this.ds.createEvent(bookingData).subscribe(
        result => {
          this.modal.hide(result);
        },
        error => {
          alert('Failed to create booking: ' + error.message);
        }
      );
    } else if (data.paymentMethod === 'card') {
      this.modal.hide();
      this.router.navigate(['/payment'], {state: {bookingDetails: bookingData, totalPrice: this.totalPrice}});
    }
  }

  submitForGuestUser(data: any) {
    const {start, end, paymentMethod} = this.form.value;

    const bookingData = {
      start,
      end,
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


  calculatePrice(start: string, end: string) {
    let startHours = DayPilot.Date.parse(start, this.dateFormat);
    let endHours = DayPilot.Date.parse(end, this.dateFormat);
    const duration = (endHours.getHours()) - (startHours.getHours());
    this.totalPrice = duration * this.pricePerHour;
  }

  cancel() {
    this.modal.hide();
  }

  closed(args: any) {
    this.close.emit(args);
  }


  dateTimeValidator(format: string) {
    return function (c: FormControl) {
      let valid = !!DayPilot.Date.parse(c.value, format);
      return valid ? null : {badDateTimeFormat: true};
    };
  }

}
