import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DayPilot, DayPilotModalComponent, DayPilotModule} from "daypilot-pro-angular";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CheckAvailabilityParams, EventEditParams} from "../../service/data.service";
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {DataService} from "../../service/data.service";

@Component({
  selector: 'edit-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DayPilotModule, CommonModule, RouterModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {

  @ViewChild("modal") modal!: DayPilotModalComponent;
  @Output() close = new EventEmitter();
  @Output() bookingUpdated = new EventEmitter();

  form: FormGroup;
  dateFormat = "MM/dd/yyyy h:mm tt";
  dateFormat2 = "yyyy-MM-ddTHH:mm:ss";
  resources: any[] = [];
  event!: DayPilot.Event;
  userRole: string = '';
  userId: number = 0;
  currentUser: number | null = null;
  isTimeAvailable: boolean = false;
  saveButtonVisible = false;
  originalAmount: number = 0;

  constructor(private fb: FormBuilder, private ds: DataService, private router: Router) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      start: ["", this.dateTimeValidator(this.dateFormat2)],
      end: ["", [Validators.required, this.dateTimeValidator(this.dateFormat2)]],
      resource: ["", Validators.required]
    }, {validator: this.timeRangeValidator});

    this.ds.getResources().subscribe(result => this.resources = result);
    this.ds.getUserRole().subscribe(response => {
      this.userRole = response.role;
    });

    this.ds.getCurrentUserObservable().subscribe(user => {
      if (user) {
        this.userId = user;
      }
    });

    this.ds.getCurrentUserObservable().subscribe((user: any) => {
      this.currentUser = user;
    });
  }


  ngOnInit() {
  }

  show(ev: any) {
    this.isTimeAvailable = false;
    this.event = ev;
    this.form.setValue({
      start: ev.start().toString(this.dateFormat2),
      end: ev.end().addHours(-1).toString(this.dateFormat2),
      name: ev.text(),
      resource: ev.resource(),
    });
    const originalStart = ev.start();
    const originalEnd = ev.end().addHours(-1);
    const originalDuration = (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60);
    this.originalAmount = originalDuration * 3;

    this.modal.show();
    this.saveButtonVisible = false;
  }

  checkAvailability() {
    let data = this.form.getRawValue();

    const start = DayPilot.Date.parse(data.start, this.dateFormat2);
    const end = DayPilot.Date.parse(data.end, this.dateFormat2);

    const eventData: CheckAvailabilityParams = {
      resourceId: +data.resource,
      startTime: start.toString(this.dateFormat2),
      endTime: end.toString(this.dateFormat2),
      bookingId: +this.event.id()
    };

    this.ds.checkParkingSpaceAvailability(eventData).subscribe((response: any) => {
      if (response.available) {
        alert('The new booking time is available.');
        this.saveButtonVisible = true;
      } else {
        alert('The new booking time is not available.');
        this.saveButtonVisible = false;
      }
    });
  }

  submit() {
    let data = this.form.getRawValue();

    if (this.form.invalid) {
      alert('Invalid form data');
      return;
    }

    const start = DayPilot.Date.parse(data.start, this.dateFormat2);
    const end = DayPilot.Date.parse(data.end, this.dateFormat2);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const newAmount = duration * 3;

    const eventData: EventEditParams = {
      id: this.event.id(),
      start: start.toString(this.dateFormat2),
      end: end.toString(this.dateFormat2),
      resourceId: +data.resource,
      amount: newAmount
    };

    if (newAmount > this.originalAmount) {
      if (!confirm(`The new booking amount is ${newAmount} BGN. Do you want to proceed with payment?`)) {
        return;
      }
      this.router.navigate(['/payment-edit'], {
        state: {
          bookingDetails: {
            id: this.event.id(),
            start: start.toString(this.dateFormat2),
            end: end.toString(this.dateFormat2),
            resourceId: +data.resource,
            amount: newAmount
          }
        }
      });
      return;
    } else if (newAmount < this.originalAmount) {
      alert(`The new booking amount is ${newAmount} BGN. The difference will be refunded on site.`);
    }

    this.ds.updateEvent(eventData).subscribe(result => {
      this.modal.hide(result);
      this.bookingUpdated.emit();
    }, error => {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking: ' + error.error);
      this.modal.hide();
    });
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

  timeRangeValidator = (group: FormGroup) => {
    let start = group.controls['start'].value;
    let end = group.controls['end'].value;

    if (start && end) {
      let startDate = DayPilot.Date.parse(start, this.dateFormat2);
      let endDate = DayPilot.Date.parse(end, this.dateFormat2);

      if (startDate && endDate && startDate >= endDate) {
        return {invalidTimeRange: true};
      }
    }
    return null;
  }

}
