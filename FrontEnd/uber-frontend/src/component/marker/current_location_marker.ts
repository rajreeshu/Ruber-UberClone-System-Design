import { MarkerInterface } from "./marker_interface";
import { MarkerType } from "./marker_type";

export class CurrentLocationMarker extends MarkerInterface {
    
    constructor(id: string, latitude: number, longitude: number, tile_id: string, L:any, map: any) {
        super(id, latitude, longitude, `Current Location Tile ID: ${tile_id}`, tile_id, L, map);
    }
    
    setMarkerOnMap(): void {
        let marker = this.generateMarker();
        marker.addTo(this.getLayerGroup());
        this.mapMarker = marker;
        
        // this.blinkMarker();
        
    }

    getIconPath(): string {
        return 'media/marker-icon-2x.png';
    }

    getMarkerType(): MarkerType {
        return MarkerType.CURRENT_LOCATION;
    }

}