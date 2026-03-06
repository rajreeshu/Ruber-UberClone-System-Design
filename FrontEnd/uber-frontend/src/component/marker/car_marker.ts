import { get } from "http";
import { MarkerInterface } from "./marker_interface";
import { MarkerType } from "./marker_type";

export class CarMarker extends MarkerInterface {

    public static markerMap : Map<string, CarMarker> = new Map();

    constructor(id: string, latitude: number, longitude: number, tile_id: string, L:any, map: any) {
        super(id, latitude, longitude, `Car Tile ID: ${tile_id}`, tile_id, L, map);
    }
    
    setMarkerOnMap(): void {
        let layerGroup = this.getLayerGroup();
        if (layerGroup) {

            let marker = this.generateMarker();
            
            marker.addTo(this.getLayerGroup());
            // marker?.getElement()?.style.setProperty('padding', '10');
            // marker?.getElement()?.style.setProperty('background', 'yellow');
            this.mapMarker = marker;
            CarMarker.markerMap.set(this.id, this);
            
            // this.blinkMarker();
        }
    }

    getIconPath(): string {
        return 'media/car-icon.png';
    }

    getMarkerType(): MarkerType {
        return MarkerType.CAR;
    }

}