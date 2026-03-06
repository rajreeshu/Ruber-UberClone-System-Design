import { Injectable } from '@angular/core';
import { NpcService } from './npc.service';
import { Coordinates } from '../models/coordinates';
import { DriverModel } from '../models/driver_model';
import { environment } from '../environment/environment-dev';
import { HttpClient } from '@angular/common/http';
import { DriverStatus } from '../models/driver_status_enum';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(private http: HttpClient, private npcService: NpcService) { }
  private driverIds: Set<number> = new Set();

  generateRandomDrivers(currentLocation: Coordinates, range: number, quantity: number): DriverModel[] {
    const npcCoordinates = this.npcService.generateRandomNpc(currentLocation, range, quantity);
    return npcCoordinates.map(coord => new DriverModel(this.generateDriverId(), coord, DriverStatus.AVAILABLE));
  }

  generateDriverId(): number {
    let id: number;
    do {
      id = Math.floor(Math.random() * 1000000) + 1;
    } while (this.driverIds.has(id));
    this.driverIds.add(id);
    return id;
  }

  registerInRedis(driver: DriverModel) {
    return this.http.post<{ h3TileId: string; message: string }>(
      `${environment.apiBaseUrl}/driver/online`,
      driver
    );
  }

  getNearbyAvailableDrivers(h3TileId: string, gridSize: number) : Observable<DriverModel[]> {
    return this.http.get<DriverModel[]>(
      `${environment.apiBaseUrl}/driver/available?h3TileId=${h3TileId}&gridSize=${gridSize}`
    );
  }


}
