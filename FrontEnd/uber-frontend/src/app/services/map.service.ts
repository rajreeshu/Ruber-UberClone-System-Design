import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { NpcService } from './npc.service';
import { Coordinates } from '../models/coordinates';
import { MarkerInterface } from '../../component/marker/marker_interface';
import { MarkerFactory } from './factory/marker-factory';
import { MarkerType } from '../../component/marker/marker_type';
import { DriverService } from './driver.service';
import { DriverModel } from '../models/driver_model';

import { environment } from '../environment/environment-dev';
import {Marker, tooltip } from 'leaflet';
import { CarMarker } from '../../component/marker/car_marker';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  // private objectLayers: Map<string, any> = new Map();
  private L : any;
  private map: any;
  private accuracyCircle: any;
  private firstFix = true;
  private driversMarker: MarkerInterface[] = [];
  private userMarker: MarkerInterface | null = null ;
  private hexagons: any[] = []; // Store references to all hexagons

  private current_latitude: number = 0;
  private current_longitude: number = 0;

  private requestedDrivers: string[] = [];

  constructor(private http: HttpClient, private driverService: DriverService) { }

    public initializeMap(L: any) {
      this.map = L.map('map').setView([28.2, 76.1], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
      this.L = L;
    }


  public watchUserLocation(L: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
    if ('geolocation' in navigator) {
      const onSuccess = (position: GeolocationPosition) => {
        this.onLocationSuccess(position);
        resolve();
      };

      const onError = (error: GeolocationPositionError) => {
        reject(error);
      };

      // setTimeout(() => {
      //   navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      //     enableHighAccuracy: true,
      //     maximumAge: 10000,
      //     timeout: 10000,
      //   });
      // }, 10000);

      navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      });
    } else {
      alert('Geolocation is not available in your browser.');
      reject(new Error('Geolocation is not available'));
    }
  });
  }

  private onLocationSuccess(position: GeolocationPosition): void {
    this.current_latitude = position.coords.latitude;
    this.current_longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy || 0;

    console.log(`Location found: Lat ${this.current_latitude}, Lng ${this.current_longitude}, Accuracy ${accuracy} meters`);

    this.setCurrentLocationMarker(this.current_latitude, this.current_longitude, accuracy);
    
    if (this.firstFix) {
      this.map.setView([this.current_latitude, this.current_longitude], 15);
      // this.userMarker.openPopup();
      this.firstFix = false;
    }
    
    this.getTileHexagonCoordinates(this.current_latitude, this.current_longitude, 1).then(() => {
      console.log('Hexagon drawn on the map.');
    }).catch((error) => {
      console.error('Error drawing hexagon:', error);
    });

  }

  // Range in KM, quantity of NPCs
  public async setNpcVehicles(quantity: number, range: number): Promise<MarkerInterface[]> {
    console.log('Setting NPC vehicles on map...');
    const drivers = this.driverService.generateRandomDrivers({latitude: this.current_latitude, longitude: this.current_longitude}, range, quantity);
    
    // let h3TileId = this.driverService.registerInRedis(this.drivers);
    let deleteOldNpcs: boolean = true;
    for (const driver of drivers) {
      try {
        const response = await firstValueFrom(
          this.driverService.registerInRedis(driver)
        );
        console.log(`H3 Tile ID for Driver ID ${driver.driverId}:`, response.h3TileId);
        driver.h3TileId = response.h3TileId;
        // this.markNpcOnMap(ncpList, MarkerType.CAR);
        const driverMarker = await this.setObjectOnMap(this.L, driver.driverId.toString(), driver.currentLocation.latitude, driver.currentLocation.longitude, MarkerType.CAR, deleteOldNpcs);
        deleteOldNpcs = false;
        if(driverMarker instanceof CarMarker){
          (driverMarker as CarMarker).id = driver.driverId.toString();
        }
        // driverMarker.car_driver_id = driver.driverId;
        this.driversMarker.push(driverMarker);
      } catch (error) {
        console.error(`Error registering Driver ID ${driver.driverId}:`, error);
      }
    }

    return this.driversMarker;

  }

  private setAccuracyCircleAroundCurrentLocation(accuracy: number) {
    if (!this.accuracyCircle) {
      this.accuracyCircle = this.L.circle([this.current_latitude, this.current_longitude], {
        radius: accuracy,
        color: '#136AEC',
        fillColor: '#136AEC',
        fillOpacity: 0.15,
      }).addTo(this.map);
    } else {
      this.accuracyCircle.setLatLng([this.current_latitude, this.current_longitude]);
      this.accuracyCircle.setRadius(accuracy);
    }


    this.map.addLayer(this.accuracyCircle, null, 10);
    
  }

  private setCurrentLocationMarker(lat: number, lng: number, accuracy?: number){
    this.getTileId({latitude: lat, longitude: lng}).then((tileId) => {
      console.log('Current Location Tile ID:', tileId);
      let currentUserMarker : MarkerInterface = MarkerFactory.getMarkerInstance(MarkerType.CURRENT_LOCATION,"self", lat, lng, tileId, this.L, this.map);
      let marker : any = currentUserMarker.setMarkersOnMap(true);
      currentUserMarker.setMarkersOnMap(true);
      // currentUserMarker.blinkMarker(new Map([["background", "#3e1fadff"],["border-radius", "50%"]]));
      if(accuracy)
        this.setAccuracyCircleAroundCurrentLocation(accuracy);
      this.userMarker = currentUserMarker;
    }).catch((error) => {
      console.error('Error fetching tile ID for current location:', error);
    });
  }

  public async getTileId(coordinates: Coordinates): Promise<string> {
    return firstValueFrom(
      this.http.get<{ tileId: string }>(`${environment.apiBaseUrl}/map/tile`, {
        params: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      })
    ).then(response => response.tileId);
  }

  public async getTileHexagonCoordinates(lat: number, lng: number, gridSize: number) {

    const response: any = await firstValueFrom(
      this.http.get(`${environment.apiBaseUrl}/map/tiles/info`, {
        params: {
          latitude: lat,
          longitude: lng,
          gridSize: gridSize
        }
      })
    );

    const coordinates = response.tilesCoordinates;

    this.hexagonMapper(coordinates, 'lightgreen');

    const nearbyTiles = response.nearbyTiles;
    console.log('Nearest Tile Info:', nearbyTiles);
    for (const tileCoordinates of nearbyTiles) {
      console.log('Tile Coordinates:', tileCoordinates);
      this.hexagonMapper(tileCoordinates.tilesCoordinates, 'lightblue');
    }
  }

  private hexagonMapper(coordinates: any, color?: string) {
    const hexagonPoints = coordinates.map((c: any) => ({
      lat: c.latitude,
      lng: c.longitude
    }));

    // close polygon
    hexagonPoints.push(hexagonPoints[0]);

    const hexagon = this.L.polygon(hexagonPoints, {
      color: color || 'lightgreen',
      fillOpacity: 0.5
    });

    hexagon.addTo(this.map);
    // Store hexagon reference for later opacity modification
    this.hexagons.push(hexagon);
  }

  async setObjectOnMap(
    L: any,
    id: string,
    lat: number,
    lng: number,
    objectType: MarkerType,
    deleteExisting: boolean, 
  ) :Promise<MarkerInterface>{
   const tileId = await this.getTileId({ latitude: lat, longitude: lng });

    const marker = MarkerFactory.getMarkerInstance(objectType, id, lat, lng, tileId, L, this.map);
    marker.setMarkersOnMap(deleteExisting);
    return marker;
  }

  async getNearbyAvailableDriversAndRequestbooking(gridSize: number): Promise<void> {

    const drivers: DriverModel[] =
      await firstValueFrom(
        this.driverService.getNearbyAvailableDrivers(
          this.userMarker?.tile_id || '',
          gridSize
        )
      );

    console.log('Nearby Available Drivers:', drivers);

    for (const driver of drivers) {
      if (this.requestedDrivers.includes(driver.driverId.toString())) {
        continue;
      }
      const accepted =
        await this.findDriverMarkerAndPingForRideBooking(driver.driverId);
      this.requestedDrivers.push(driver.driverId.toString());

      if (accepted) {
        console.log(`Driver ${driver.driverId} accepted the ride`);
        await this.showPathOnMap(new Coordinates(this.userMarker!.longitude, this.userMarker!.latitude), driver.currentLocation);
        return; // stop pinging others
      }
    }

    gridSize++;
    if (gridSize <= 3) {
      this.getTileHexagonCoordinates(this.current_latitude, this.current_longitude, gridSize);
      this.getNearbyAvailableDriversAndRequestbooking(gridSize);
    }
  }

  private showBookingStatusToolTip(driverMarker : CarMarker ,booked : boolean){
    if(booked){
      driverMarker.mapMarker.bindTooltip('Ride Accepted', {
        direction: 'bottom',
        permanent: false
      });
      driverMarker?.mapMarker.openTooltip();
      driverMarker.blinkMarker(3, new Map([["background", "#19760aff"],["border-radius", "20%"]]), false);

      setTimeout(() => {
        driverMarker.mapMarker.closeTooltip();
      }, 2500); 
            

    }
    else{
      driverMarker.mapMarker.bindTooltip('Ride Not Accepted', {
        direction: 'bottom',
        permanent: false
      });
      driverMarker.mapMarker.openTooltip();
      driverMarker.blinkMarker(3, new Map([["background", "#ef0606ff"],["border-radius", "20%"]]), false);
      setTimeout(() => {
        driverMarker.mapMarker.closeTooltip();
      }, 2500); 

    }
  }



  private async findDriverMarkerAndPingForRideBooking(
    driverId: number
  ): Promise<boolean> {

    const driverMarker =
      CarMarker.markerMap.get(driverId.toString()) ?? null;

    if (!driverMarker) {
      console.log(`Driver ID: ${driverId} is unavailable.`);
      return false;
    }

    console.log(`Pinging Driver ID: ${driverId} for ride booking...`);    

    // ⏱ random delay between 2–5 seconds
    const delayMs = this.getRandomDelay(2000, 5000);
    driverMarker.blinkMarkerDefault(delayMs / 1000);
    // driverMarker.mapMarker.bindTooltip('Booking', {
    //   direction: 'bottom',
    //   permanent: false
    // });
    // driverMarker.mapMarker.openTooltip();
    

    await this.sleep(delayMs);

    // 🎲 random accept / reject

    
    let rand : number = Math.random();
    const accepted =  rand< 0.3;
    console.log(`value: ${rand} accepted? ${accepted}`);

    this.showBookingStatusToolTip(driverMarker, accepted);

    return accepted;


    // console.log(
    //   `Driver ID ${driverId} response after ${delayMs}ms:`,
    //   accepted ? 'ACCEPTED' : 'REJECTED'
    // );

    // return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async showPathOnMap(point1 : Coordinates, point2 : Coordinates){
    try {
      // Use OSRM (Open Source Routing Machine) API to get the actual route
      // Format: /route/v1/{profile}/{coordinates}?overview=full&geometries=geojson
      // profile: driving (for car routes)
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${point1.longitude},${point1.latitude};${point2.longitude},${point2.latitude}?overview=full&geometries=geojson&alternatives=false`;
      
      const response: any = await firstValueFrom(
        this.http.get(osrmUrl)
      );

      if (response.code === 'Ok' && response.routes && response.routes.length > 0) {
        const route = response.routes[0];
        const coordinates = route.geometry.coordinates;
        
        // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
        const latLngs = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        
        // Remove any existing route path
        if ((this.map as any).routePath) {
          this.map.removeLayer((this.map as any).routePath);
        }

        // Draw the route path
        const path = this.L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1
        }).addTo(this.map);

        // Store reference to remove later if needed
        (this.map as any).routePath = path;

        // Zoom map to fit the path
        this.map.fitBounds(path.getBounds(), {
          padding: [50, 50]
        });

        // Log route information
        const distance = (route.distance / 1000).toFixed(2); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes
        console.log(`Route found: ${distance} km, ${duration} minutes`);
        
        // Reduce hexagon opacity to 1/10th (0.1) once route is finalized
        this.reduceHexagonOpacity();
      } else {
        console.error('No route found between the points');
        // Fallback to straight line if routing fails
        this.drawStraightLine(point1, point2);
        // Still reduce hexagon opacity even if route failed
        this.reduceHexagonOpacity();
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to straight line if API call fails
      this.drawStraightLine(point1, point2);
      // Still reduce hexagon opacity even if API call failed
      this.reduceHexagonOpacity();
    }
  }

  private reduceHexagonOpacity(): void {
    // Reduce opacity of all hexagons to 1/10th (0.1)
    this.hexagons.forEach(hexagon => {
      if (hexagon && hexagon.setStyle) {
        hexagon.setStyle({
          fillOpacity: 0.1 // 1/10th opacity
        });
      }
    });
    console.log(`Reduced opacity of ${this.hexagons.length} hexagons to 1/10th (0.1)`);
  }

  private drawStraightLine(point1: Coordinates, point2: Coordinates): void {
    const pointA: [number, number] = [point1.latitude, point1.longitude];
    const pointB: [number, number] = [point2.latitude, point2.longitude];

    // Remove any existing route path
    if ((this.map as any).routePath) {
      this.map.removeLayer((this.map as any).routePath);
    }

    const path = this.L.polyline([pointA, pointB], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.6,
      dashArray: '5, 10' // Dashed line to indicate it's not a real route
    }).addTo(this.map);

    (this.map as any).routePath = path;
    this.map.fitBounds(path.getBounds(), {
      padding: [50, 50]
    });
  }

  // private showPathOnMap(point1 : Coordinates, point2 : Coordinates){
  //   const pointA: [number, number] = [point1.latitude, point1.longitude];
  //   const pointB: [number, number] = [point2.latitude, point2.longitude];

  //     this.L.Routing.control({
  //     waypoints: [
  //       this.L.latLng(point1.latitude, point1.longitude),
  //       this.L.latLng(point2.latitude, point2.longitude)
  //     ],
  //     routeWhileDragging: false,
  //     show: false,
  //     addWaypoints: false
  //   }).addTo(this.map);

  // }



}
