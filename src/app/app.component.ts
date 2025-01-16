import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule} from "@angular/common";
import {HomeComponent} from "./components/home/home.component";
import {HttpClientModule} from "@angular/common/http";
import {SchedulerComponent} from "./components/scheduler/scheduler.component";
import {LoginComponent} from "./components/login/login.component";
import {RegisterComponent} from "./components/register/register.component";
import {CreateComponent} from "./components/create/create.component";
import {EditComponent} from "./components/edit/edit.component";
import {PaymentComponent} from "./components/payment/payment.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {ProfileEditComponent} from "./components/profile-edit/profile-edit.component";
import {MybookingsComponent} from "./components/mybookings/mybookings.component";
import {QuickBookingComponent} from "./components/quick-booking/quick-booking.component";
import {BookingSuccessComponent} from "./components/booking-success/booking-success.component";
import {AllbookingsComponent} from "./components/allbookings/allbookings.component";
import {AllprofilesComponent} from "./components/allprofiles/allprofiles.component";
import {ForgotpasswordComponent} from "./components/forgotpassword/forgotpassword.component";
import {ResetpasswordComponent} from "./components/resetpassword/resetpassword.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HomeComponent, RouterLink,
    RouterLinkActive, HttpClientModule, SchedulerComponent, LoginComponent,
    RegisterComponent, CreateComponent, EditComponent, PaymentComponent,
    ProfileComponent, ProfileEditComponent, MybookingsComponent, QuickBookingComponent,
    BookingSuccessComponent, AllbookingsComponent, AllprofilesComponent, ForgotpasswordComponent, ResetpasswordComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ParkWise';
}
