import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import {} from '@types/googlemaps';
import { AppService } from './app.service';
import { StoreModel } from './store-model';
import { store } from '../../node_modules/@angular/core/src/render3/instructions';
import { google } from '../../node_modules/@types/google-maps';
import { InstructionModel } from './instruction-model';

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
    selectedStores: StoreModel[];
    showDirections: boolean;
    directions: InstructionModel[];
    selectedStore: StoreModel;
    path: google.maps.Polyline;

    // Input
    topN: number;
    maxResults: number;

    ngOnInit() {     

        this.storeModels = [];
        this.selectedStores = [];
        this.selectedStore = undefined;
        this.topN = this.service.totalStores();
        this.maxResults = this.service.totalStores();
        this.showDirections = false;
        this.directions = [];
        var mapProp = {
            center: new google.maps.LatLng(-38.7169123,-62.2657356),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                  "elementType": "labels",
                  "stylers": [
                    {
                      "visibility": "off"
                    }
                  ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels",
                    "stylers": [
                    { "visibility": "on" }
                    ]
                }
            ]
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
        /*google.maps.event.addListener(this.infoWindow, 'closeclick', () => {
            this.showIndications = false;
        });*/

        this.path = new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
  
        this.path.setMap(this.map);


        this.loadStores(true);
    }



    clearStores(recalculateDistances: boolean) {
        // Close the infoWindow
        this.infoWindow.close();

        this.path.setPath([]);
        
        // Set marker's map to null and delete the references
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
        this.selectedStores = [];

        // Delete the store models
        if (recalculateDistances) {
            this.storeModels = [];
        }

        this.ref.detectChanges();
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

        this.selectedStores = this.storeModels.slice(0, this.topN);
        this.ref.detectChanges();

        // Add the topN markers
        for (let i = 0; i < this.selectedStores.length; i++) {
            let html: string = '<b>' + this.selectedStores[i].name + '</b> <br/>' + this.selectedStores[i].address + '<br>' + this.selectedStores[i].distance + ' metros</br>';
            let newMarker: google.maps.Marker = new google.maps.Marker({
                map: this.map,
                position: this.selectedStores[i].position,
                //label: this.selectedStores[i].name,
                icon: {
                    url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png",
                    labelOrigin: new google.maps.Point(0, -10),
                    size: new google.maps.Size(40,40),
                    anchor: new google.maps.Point(16,32)
                  },
                  label: {
                    text: this.selectedStores[i].name,
                    color: "#000",
                    fontWeight: "bold"
                  }
            });
  
            google.maps.event.addListener(newMarker, 'click', () => {
                this.infoWindow.setContent(html);
                this.infoWindow.open(this.map, newMarker);
            });
  
            this.markers.push(newMarker);
        }
    }

    async getDirections(pos: number) {
        let coordinates = [];
        coordinates.push(this.userMarker.getPosition());
        this.selectedStore = this.selectedStores[pos];
        this.directions = await this.service.getDirections(this.userMarker.getPosition(), this.selectedStore.position);
        for(let d of this.directions) {
            coordinates.push(d.endLocation);
        }
        coordinates.push(this.selectedStore.position);
        this.path.setPath(coordinates);
        this.showDirections = true;
    }

    hideDirections() {
        this.showDirections = false;
        this.loadStores(true);
    }
}
