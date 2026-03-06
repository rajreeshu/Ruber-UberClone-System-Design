import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RideBookingComponent } from './ride-booking/ride-booking.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path:"ride-booking", component: RideBookingComponent }

];
