import { Injectable } from '@angular/core';
import { Coordinates } from '../models/coordinates';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root'
})
export class NpcService {

  constructor() { }

  // Range is in KM. 
  generateRandomNpc(currentLocation: Coordinates, range : number, quantity: number): Coordinates[] {
    const npcs: Coordinates[] = [];
    for (let i = 0; i < quantity; i++) {
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomDistance = Math.random() * range;

      const deltaLat = (randomDistance / 111) * Math.cos(randomAngle); // Approx conversion: 1 degree latitude ~ 111 km
      const deltaLng = (randomDistance / (111 * Math.cos(currentLocation.latitude * (Math.PI / 180)))) * Math.sin(randomAngle); // Adjust for longitude

      const npcLat = currentLocation.latitude + deltaLat;
      const npcLng = currentLocation.longitude + deltaLng;

      npcs.push({ latitude: npcLat, longitude: npcLng });
    }
    return npcs;
  }

  registerInRedis(npcs: Coordinates[]): void {

  }

  

  
}
