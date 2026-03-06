import { get } from "http";
import { MarkerType } from "./marker_type";
import { tooltip } from "leaflet";
import { environment } from "../../app/environment/environment-dev";
import { HttpClient } from "@angular/common/http";

export abstract class MarkerInterface {
    public id: string = '';
    public latitude: number;
    public longitude: number;
    protected toolTip: string;
    public tile_id:string;
    protected L: any;
    protected map: any;
    protected current_location_marker: any;
    public mapMarker: any;
    

    public static objectLayers: Map<string, any> = new Map();  // used to store markers on Layer hence easy to do delete all.

    constructor(id: string, latitude: number, longitude: number, toolTip: string, tile_id : string, L:any, map: any) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.toolTip = toolTip;
        this.L = L;
        this.map = map;

        this.tile_id = tile_id;

        if (!MarkerInterface.objectLayers.has(this.getMarkerType())) {
            MarkerInterface.objectLayers.set(this.getMarkerType(), L.layerGroup().addTo(map));
        }

        


    }

    abstract getIconPath(): string;
    abstract getMarkerType(): MarkerType;

    public setMarkersOnMap(deleteExisting: boolean): any{
        if (deleteExisting) {
            this.deleteExistingMarkers();
        }
        return this.setMarkerOnMap();
    }

    abstract setMarkerOnMap(): any;

    // setToolTip(messge: string): void{
    //     marker.bindTooltip('Driver is available', {
    //     direction: 'top',
    //     permanent: false
    //     });

    // }

    protected deleteExistingMarkers(): void {
        this.getLayerGroup().clearLayers();
    }

    protected getLayerGroup(): any {
        return MarkerInterface.objectLayers.get(this.getMarkerType());
    }

    private generateMarkerIcon(): any{
        return this.L.icon({
            iconUrl: this.getIconPath(),
            iconSize: [35, 25],
            iconAnchor: [12, 12]
        });
        // return this.L.divIcon({
        //     className: 'car-marker-icon',
        //     html: `<img src="${this.getIconPath()}" style = "width: 35px; height: 20px;">`
        // })
    }

    public generateMarker(): L.Marker {
        const marker : L.Marker = this.L.marker([this.latitude, this.longitude], { icon: this.generateMarkerIcon() });
        marker.bindTooltip(this.toolTip, {
            direction: 'top',
            permanent: false
        });
        return marker;
    }

    blinkMarkerDefault(seconds : number): void {
        this.blinkMarker(seconds, new Map([["background", "#3e1fadff"],["border-radius", "50%"]]), true);
    }

    blinkMarker(seconds: number, propertyMap: Map<string, string>, blink : boolean): void {
        const element = this.mapMarker.getElement();
        if (!element) return;

        let visible = false;
        let count = 0;

        const interval = setInterval(() => {
            if(!visible)
            for(const [key, value] of propertyMap) {
                element.style.setProperty(key, value);
            }
            else
                if(blink)
            for(const [key, value] of propertyMap) {
                element.style.setProperty(key, '');
            }
            visible = !visible;
            count++;

            if (count >= seconds*2) { // 5 blinks (on+off)
                clearInterval(interval);
                if(blink)
                for(const [key, value] of propertyMap) {
                    element.style.setProperty(key, '');
                }
            }
        }, 500);
        }

}