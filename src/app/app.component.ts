import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import {} from '@types/googlemaps';
import { AppService } from './app.service';
import { StoreModel } from './store-model';
import { store } from '../../node_modules/@angular/core/src/render3/instructions';
import { google } from '../../node_modules/@types/google-maps';

declare var google;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private ref: ChangeDetectorRef, private service: AppService){}
    @ViewChild('gmap') gmapElement: any;

    map: google.maps.Map;
    markers: google.maps.Marker[]; 
    infoWindow: google.maps.InfoWindow;
    locationSelect: any;
    userMarker: google.maps.Marker;
    userPosition: string;
    storeModels: StoreModel[];
    showIndications: boolean;

    // Input
    topN: number;

    ngOnInit() {
        this.storeModels = [];
        this.topN = this.service.totalStores();
        this.showIndications = false;
        var mapProp = {
            center: new google.maps.LatLng(-38.7169123,-62.2657356),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
        this.markers = [];
        this.userMarker = new google.maps.Marker({
            map: this.map,
            position: new google.maps.LatLng(-38.7169123,-62.2657356),
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            draggable: true,
        });
        this.userMarker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

        this.userPosition = this.userMarker.getPosition().toString();
        google.maps.event.addListener(this.userMarker, 'dragend', () => {
            this.userPosition = this.userMarker.getPosition().toString();
            this.ref.detectChanges();
            this.loadStores(true);
        });

        google.maps.event.addListener(this.userMarker, 'click', () => {
            this.service.reverseGeocoding(this.userMarker.getPosition()).subscribe((res) => {
              this.infoWindow.setContent("<b>Current position</b> <br/>" + res["results"][0]["address_components"][1]["long_name"] + ' ' + res["results"][0]["address_components"][0]["long_name"] + "<br>");
              this.infoWindow.open(this.map, this.userMarker);
            });
         //   this.infoWindow.setContent("<b>Current position</b> <br/>" + await this.service.reverseGeocoding(this.userMarker.getPosition()) + "<br>");
         //   this.infoWindow.open(this.map, this.userMarker);
        });

        this.infoWindow = new google.maps.InfoWindow();

        this.loadStores(true);
    }



    clearStores(recalculateDistances: boolean) {
        // Close the infoWindow
        this.infoWindow.close();
        
        // Set marker's map to null and delete the references
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];

        // Delete the store models
        if (recalculateDistances) {
            this.storeModels = [];
        }
    }

    async loadStores(recalculateDistances: boolean = false) {
        // Delete the markers
        this.clearStores(recalculateDistances);  

        // Recalculates the distances (only if userPosition changed)
        if (recalculateDistances) {
            this.storeModels = await this.service.calculateStoreDistances(this.userMarker.getPosition());  
        }
      
        // Check the value of topN
        this.topN = (this.topN === undefined || this.topN > this.service.totalStores())? this.service.totalStores() : this.topN;

        // Order stores by distance
        this.storeModels = this.storeModels.sort((store1, store2) => {
            if (store1.distance < store2.distance) {
                return -1;
            }
            else if (store1.distance > store2.distance) {
                return 1;
            }
            else return 0;
        });

        // Add the topN markers
        for (let i = 0; i < this.topN; i++) {
            let html: string = "<b>" + this.storeModels[i].name + "</b> <br/>" + this.storeModels[i].address + "<br>" + this.storeModels[i].distance + " metros</br> <button>Indicaciones</button>";
            let newMarker: google.maps.Marker = new google.maps.Marker({
                map: this.map,
                position: this.storeModels[i].position
            });
  
            google.maps.event.addListener(newMarker, 'click', () => {
                this.infoWindow.setContent(html);
                this.infoWindow.open(this.map, newMarker);
                this.showIndications = true;
            });
  
            this.markers.push(newMarker);
        }
    }
  /*
  createMarker(latlng, name, address, distance) {
    console.log('marcador' + distance);
    let html: string = "<b>" + name + "</b> <br/>" + address + "<br>" + distance + " metros";
    let marker: google.maps.Marker = new google.maps.Marker({
      map: this.map,
      position: latlng
    });

    google.maps.event.addListener(marker, 'click', () => {
      this.infoWindow.setContent(html);
      this.infoWindow.open(this.map, marker);
    });
    this.markers.push(marker);
  }*/
}
