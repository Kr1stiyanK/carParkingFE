import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {DayPilot, DayPilotModule, DayPilotSchedulerComponent} from "daypilot-pro-angular";

import {HttpClientModule} from "@angular/common/http";
import {CheckAvailabilityParams, EventDeleteParams, EventMoveParams} from "../../service/data.service";
import {DataService} from "../../service/data.service";
import {CreateComponent} from "../create/create.component";
import {EditComponent} from "../edit/edit.component";
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";


@Component({
  selector: 'app-scheduler',
  standalone: true,
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css',
  imports: [DayPilotModule, HttpClientModule, CreateComponent, EditComponent, FormsModule, RouterModule, ReactiveFormsModule, CommonModule]
})
export class SchedulerComponent implements AfterViewInit {

  @ViewChild("scheduler")
  scheduler!: DayPilotSchedulerComponent;

  @ViewChild("create") create!: CreateComponent;

  @ViewChild("edit") edit!: EditComponent;

  // filter: any = {
  //   shortOnly: false,
  //   freeOnly: false
  // };
  events: DayPilot.EventData[] = [];
  // events:any[] = [];
  config: any = {
    timeHeaders: [
      {groupBy: 'Day', format: 'dddd, MMMM d, yyyy'},
      {groupBy: 'Hour', format: "h tt"},
    ],
    scale: 'Hour',
    // startDate: DayPilot.Date.today(),
    // days: DayPilot.Date.today().daysInYear(),
    startDate: DayPilot.Date.today().addDays(-10),
    days: 40,
    businessBeginsHour: 8,
    businessEndsHour: 21,
    cellDuration: 60,
    businessWeekends: true,
    showNonBusiness: false,
    resources: [],
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    contextMenu: new DayPilot.Menu({
      items: [
        {
          text: 'Edit',
          onClick: args => {
            const event = args.source;
            if (this.userRole === 'USER' && event.data.userId === this.currentUserId) {
              this.edit.show(event);
            } else {
              alert('This is not your booking or you do not have permission to edit.');
            }
          }
        },
      ]
    }),
    // onEventFilter: (args: any) => {
    //   const params = args.filterParam;
    //   if (params.shortOnly && args.e.duration() > DayPilot.Duration.ofHours(2)) {
    //     args.visible = false;
    //   }
    //   if (params.freeOnly && !this.isParkingSpaceFree(args.e.resource(), args.e.start(), args.e.end())) {
    //     args.visible = false;
    //   }
    // },

    onBeforeEventRender: (args: any) => {
      args.data.barColor = "#cc004c";

      if (this.userRole === 'ADMIN') {
        args.data.areas = [
          {
            right: 5,
            top: 7,
            width: 24,
            height: 24,
            symbol: "/assets/daypilot.svg#x-circle",
            fontColor: "#777777",
            toolTip: "Delete",
            onClick: (args: any) => {
              const e = args.source;
              const params: EventDeleteParams = {
                id: e.id(),
              };
              this.service.deleteEvent(params).subscribe(result => {
                this.scheduler.control.events.remove(e);
                this.scheduler.control.message("Booking deleted");
              });
            }
          },
        ];
      }
    },
    onTimeRangeSelected: (args: any) => {

      const now = DayPilot.Date.today();
      if (args.start < now) {
        this.scheduler.control.message("Cannot book in the past.");
        this.scheduler.control.clearSelection();
        return;
      }

      const start = new DayPilot.Date(args.start).getHours();
      const end = new DayPilot.Date(args.end).getHours();
      const duration = end - start;

      if (duration < 2) {
        this.scheduler.control.message("Booking must be at least 1 hour.");
        this.scheduler.control.clearSelection();
        return;
      }

      this.create.show({
        start: args.start,
        end: args.end,
        name: "",
        resource: args.resource
      });
    },
    onEventMove: (args: any) => {
      if (args.newResource !== args.e.resource()) {
        args.preventDefault();
        this.scheduler.control.message("You can only move the booking within the same resource.");
        return;
      }

      if (!this.isWithinBusinessHours(args.newStart, args.newEnd)) {
        args.preventDefault();
        this.scheduler.control.message("Booking must be within business hours (08:00 - 20:00).");
        return;
      }

      let checkParams: CheckAvailabilityParams = {
        resourceId: args.newResource,
        startTime: args.newStart.toString(),
        endTime: args.newEnd.toString(),
        bookingId: args.e.id(),
      };

      this.service.checkParkingSpaceAvailability(checkParams).subscribe((response: any) => {
        if (response.available) {
          let params: EventMoveParams = {
            bookingId: args.e.id(),
            startTime: args.newStart.toString(),
            endTime: args.newEnd.toString(),
            resourceId: args.newResource
          };
          this.service.moveEvent(params).subscribe(result => {
            this.scheduler.control.message("Booking moved");
          }, error => {
            args.preventDefault(); // Prevent the event from being moved visually
            this.scheduler.control.message("Failed to move booking: " + error.error.message);
            this.loadEvents() // Revert the event to its original position
          });
        } else {
          args.preventDefault();
          this.scheduler.control.message("The new time overlaps with an existing booking.");
          this.loadEvents(); // Revert the event to its original position
        }
      }, error => {
        args.preventDefault();
        this.scheduler.control.message("Failed to check availability: " + error.message);
        this.loadEvents();
      });
    }
  };

  userRole: string = '';
  currentUserId: number | null = null;

  constructor(private service: DataService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.service.getUserRole().subscribe(response => {
      this.userRole = response.role;
      if (this.userRole === 'ADMIN') {
        this.config.eventMoveHandling = "Update";
      }
    });

    this.service.getCurrentUserObservable().subscribe(user => {
      this.currentUserId = user;
    });

    this.service.getResources().subscribe(result => {
      this.config.resources = result
    });
    var from = this.scheduler.control.visibleStart();
    var to = this.scheduler.control.visibleEnd();
    this.service.getEvents(from, to).subscribe((result) => {
      this.events = result.map(event => ({
          id: event.id,
          text: event.text,
          start: event.start,
          end: event.end,
          resource: event.resource,
          userId: event.userId
        }
      ));

      this.scheduler.control.update();
      this.scheduler.control.scrollTo(DayPilot.Date.today());

    });
  }

  createClosed(args: any) {
    if (args.result) {
      this.events.push(args.result);
      this.scheduler.control.message("Created");
    }
    this.scheduler.control.clearSelection();
  }

  editClosed(args: any) {
    if (args.result) {
      this.loadEvents();
      this.scheduler.control.message("Updated");
    }
  }

  loadEvents(): void {
    const from = this.scheduler.control.visibleStart();
    const to = this.scheduler.control.visibleEnd();

    this.service.getEvents(from, to).subscribe(result => {
      this.events = result.map(event => ({
        id: event.id,
        text: event.text,
        start: event.start,
        end: event.end,
        resource: event.resource,
        userId: event.userId
      }));
      this.scheduler.control.update({events: this.events});
      this.scheduler.control.scrollTo(DayPilot.Date.today());
    });
  }

  isParkingSpaceFree(resource: any, start: DayPilot.Date, end: DayPilot.Date): boolean {
    return !this.events.some(event => event.resource === resource && event.start < end && event.end > start);
  }

  isWithinBusinessHours(start: DayPilot.Date, end: DayPilot.Date): boolean {
    const businessStart = new DayPilot.Date(start.getDatePart()).addHours(8);
    const businessEnd = new DayPilot.Date(start.getDatePart()).addHours(20);
    return start >= businessStart && end <= businessEnd;
  }

  // changeFree(val: string) {
  //   this.filter.freeOnly = val;
  //   this.applyFilter();
  // }
  //
  // changeShort(val: string) {
  //   this.filter.shortOnly = val;
  //   this.applyFilter();
  // }
  //
  // applyFilter() {
  //   this.scheduler.control.events.filter(this.filter);
  // }


  logout() {
    this.service.logout();
    this.router.navigate(['/home']);
  }

}
