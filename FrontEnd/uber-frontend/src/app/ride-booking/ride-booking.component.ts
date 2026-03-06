import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MapService } from '../services/map.service';
import { NpcService } from '../services/npc.service';
import { DriverModel } from '../models/driver_model';
import { DriverService } from '../services/driver.service';




@Component({
  selector: 'app-ride-booking',
  standalone: true,
  imports: [],
  templateUrl: './ride-booking.component.html',
  styleUrl: './ride-booking.component.css'
})
export class RideBookingComponent {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private mapService: MapService,
    private npcService: NpcService, private driverService: DriverService) {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically import Leaflet only in the browser
      import('leaflet').then(async (L) => {
        this.mapService.initializeMap(L);
        await this.mapService.watchUserLocation(L);
        await this.getNpcDataAndSetOnMap();
        this.mapService.getNearbyAvailableDriversAndRequestbooking(1);
        

      });
    }
  }

  private async getNpcDataAndSetOnMap() {
    // const numVehicles = this.showAlertForm('Enter number of NPC vehicles to generate:');
    // const range = this.showAlertForm('Enter range (in KM) for NPC vehicle generation:');
    const numVehicles = 10;
    const range = 4;
    await this.mapService.setNpcVehicles(Number(numVehicles), Number(range)).then((driversMarkers) => {
      // You can use the drivers array here if needed
      // console.log('NPC drivers:', drivers);
      // this.driverService.getNearbyAvailableDrivers();
      

    });
  }

  showAlertForm(question: string): string {
    let userInput: string | null = null;
    return prompt(question) || '';
  }



  

  
  

  
}
