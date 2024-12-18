import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import { provideHttpClient} from "@angular/common/http";
import {DataService} from "./service/data.service";
import {AuthGuard} from "./AuthGuard";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(), DataService, AuthGuard]
};
