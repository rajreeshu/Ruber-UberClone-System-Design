import { Coordinates } from "./coordinates";
import { DriverStatus } from "./driver_status_enum";

export class DriverModel {
    currentLocation: Coordinates;
    driverId: number;
    status: DriverStatus;
    h3TileId?: string;

    constructor(driverId: number, currentLocation: Coordinates, status: DriverStatus) {
        this.driverId = driverId;
        this.currentLocation = currentLocation;
        this.status = status;
    }
}