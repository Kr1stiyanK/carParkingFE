import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {DayPilot} from 'daypilot-pro-angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";

const BASE_URL = 'http://localhost:8081/';

@Injectable()
export class DataService {

  constructor(private http: HttpClient, private router: Router) {
  }

  private static createAuthorizationHeader(): HttpHeaders {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwtToken
      });
    } else {
      console.log("JWT token not found in local storage");
      return new HttpHeaders();
    }
  }

  register(signRequest: any): Observable<any> {
    return this.http.post(BASE_URL + 'register', signRequest)
  }

  login(loginRequest: any): Observable<any> {
    return this.http.post(BASE_URL + 'login', loginRequest)
  }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<any[]> {
    const headers = DataService.createAuthorizationHeader();
    const fromIso = from.toString();
    const toIso = to.toString();
    return this.http.get<any[]>(BASE_URL + `api/bookings?from=${fromIso}&to=${toIso}`, {headers});
  }

  getResources(): Observable<any[]> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.get<any[]>(BASE_URL + 'api/parkingspaces', {headers});
  }

  createEvent(data: EventCreateParams): Observable<any> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.post<any>(BASE_URL + 'api/parkingspaces/create', data, {headers});
  }

  updateEvent(data: EventEditParams): Observable<any> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.post<any>(BASE_URL + 'api/parkingspaces/edit', data, {headers});
  }

  moveEvent(data: EventMoveParams): Observable<any> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.post<any>(BASE_URL + 'api/parkingspaces/move', data, {headers});
  }

  deleteEvent(data: EventDeleteParams): Observable<any> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.post<any>(BASE_URL + 'api/parkingspaces/delete', data, {headers});
  }

  checkParkingSpaceAvailability(data: CheckAvailabilityParams): Observable<{ available: boolean }> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.post<{ available: boolean }>(BASE_URL + 'api/parkingspaces/check-availability', data, {headers});
  }

  getUserRole(): Observable<{ role: string }> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.get<{ role: string }>(BASE_URL + 'api/role', {headers});
  }

  isLoggedIn(): boolean {
    const jwtToken = localStorage.getItem('jwtToken');
    return !!jwtToken;
  }

  getCurrentUser(): string | null {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const payload = JSON.parse(atob(token!.split('.')[1]));
      return payload.sub;
    }
    return null;
  }

  getCurrentUserObservable(): Observable<number | null> {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return of(payload.userId);
    }
    return of(null);
  }


  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('expires_at');
    this.deleteCookie('JSESSIONID');
    this.deleteCookie('jwtToken');

    this.http.post(BASE_URL + 'api/logout', {})
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        }
      });
  }


  deleteCookie(name: string) {
    document.cookie = `${name}=; Path=/; Max-Age=0;`;
  }

  changeEmail(updateEmailRequest: any): Observable<any> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.put(BASE_URL + 'api/update-email', updateEmailRequest, {headers}).pipe(
      catchError(error => {
        console.error('Update email error:', error);
        return throwError(error);
      })
    );
  }

  changePassword(passwordData: { email: string, currentPassword: string, newPassword: string }): any {
    const headers = DataService.createAuthorizationHeader();
    return this.http.put(BASE_URL + 'api/change-password', passwordData, {headers});
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(BASE_URL + 'api/forgotten-password', email);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(BASE_URL + 'api/reset-password', {token, newPassword}, { responseType: 'text' });
  }

  getMyBookings(email: string): Observable<any[]> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.get<any[]>(`${BASE_URL}api/my-bookings?email=${email}`, {headers});
  }

  checkAvailability(data: { startTime: string, endTime: string }): Observable<any> {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(BASE_URL + 'api/guest/check-availability', data, {headers});
  }

  quickBooking(bookingData: any): Observable<any> {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(BASE_URL + 'api/guest/quick-booking', bookingData, {headers});
  }

  getAllProfiles(): Observable<any[]> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.get<any[]>(BASE_URL + 'api/all-profiles', {headers});
  }

  getAllBookings(): Observable<any[]> {
    const headers = DataService.createAuthorizationHeader();
    return this.http.get<any[]>(BASE_URL + 'api/all-bookings', {headers});
  }

}

export interface EventCreateParams {
  start: string;
  end: string;
  text: string;
  resource: string | number;
  userId: string | number;
  amount: number;
}

export interface EventMoveParams {
  resourceId: number;
  startTime: string;
  endTime: string;
  bookingId: number;
}

export interface EventDeleteParams {
  id: string | number;
}

export interface EventData {
  id: string | number;
  start: string;
  end: string;
  text: string;
  resource: string | number;
}

export interface EventEditParams {
  id: string | number;
  start: string;
  end: string;
  resourceId: string | number;
  amount: number
}

export interface CheckAvailabilityParams {
  resourceId: number | null;
  startTime: string;
  endTime: string;
  bookingId: number | null;
}

