import { Injectable } from '@angular/core';
import { MarkerType } from '../../../component/marker/marker_type';
import { CarMarker } from '../../../component/marker/car_marker';
import { CurrentLocationMarker } from '../../../component/marker/current_location_marker';
import { MarkerInterface } from '../../../component/marker/marker_interface';

@Injectable({
  providedIn: 'root'
})
export class MarkerFactory {

  constructor() { }

  static getMarkerInstance(markerType: MarkerType, id: string, latitude: number, longitude: number, tile_id: string, L:any, map:any) : MarkerInterface {
    switch(markerType) {
      case MarkerType.CAR:
        return new CarMarker(id, latitude, longitude, tile_id, L, map);
      case MarkerType.CURRENT_LOCATION:
        return new CurrentLocationMarker(id, latitude, longitude, tile_id, L, map);
      default:
        throw new Error('Invalid marker type');
    }
  }

}
