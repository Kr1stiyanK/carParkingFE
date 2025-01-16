import {Routes} from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {SchedulerComponent} from "./components/scheduler/scheduler.component";
import {RegisterComponent} from "./components/register/register.component";
import {PaymentComponent} from "./components/payment/payment.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {MybookingsComponent} from "./components/mybookings/mybookings.component";
import {AuthGuard} from "./AuthGuard";
import {ProfileEditComponent} from "./components/profile-edit/profile-edit.component";
import {QuickBookingComponent} from "./components/quick-booking/quick-booking.component";
import {BookingSuccessComponent} from "./components/booking-success/booking-success.component";
import {AllprofilesComponent} from "./components/allprofiles/allprofiles.component";
import {AllbookingsComponent} from "./components/allbookings/allbookings.component";
import {PaymentEditComponent} from "./components/payment-edit/payment-edit.component";
import {MapComponent} from "./components/map/map.component";
import {ForgotpasswordComponent} from "./components/forgotpassword/forgotpassword.component";
import {ResetpasswordComponent} from "./components/resetpassword/resetpassword.component";


export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'quick-booking', component: QuickBookingComponent},
  {path: 'booking-success', component: BookingSuccessComponent},
  {path: 'profile', component: ProfileComponent,canActivate: [AuthGuard]},
  {path: 'profile-edit', component: ProfileEditComponent, canActivate: [AuthGuard]},
  {path: 'my-bookings', component: MybookingsComponent, canActivate: [AuthGuard]},
  {path: 'scheduler', component: SchedulerComponent, canActivate: [AuthGuard]},
  {path: 'map', component:MapComponent,canActivate: [AuthGuard]},
  {path: 'all-profiles', component: AllprofilesComponent, canActivate: [AuthGuard]},
  {path: 'all-bookings', component: AllbookingsComponent, canActivate: [AuthGuard]},
  {path: 'payment', component: PaymentComponent},
  {path: 'forgot-password', component: ForgotpasswordComponent},
  {path: 'reset-password', component: ResetpasswordComponent},
  {path: 'payment-edit', component: PaymentEditComponent},
  {path: '', redirectTo: '', pathMatch: 'full'},
  {path: '**', redirectTo: ''}
];
