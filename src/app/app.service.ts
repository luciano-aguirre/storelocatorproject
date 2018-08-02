import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {} from '@types/googlemaps';
import { StoreModel } from './store-model';
import * as stores from "./data/stores.json";
 
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
 
@Injectable()
export class AppService {
 
    constructor(private http:HttpClient) {}
 
    async getDistance(origin: google.maps.LatLng, destination: google.maps.LatLng): Promise<number> {
        let response = await this.http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + origin.lat() + ',' + origin.lng() +'&destinations=' + destination.lat() + ',' + destination.lng() +  '&mode=walking&key=AIzaSyAN-iN1ImnlC2jaSrLg32f2RhDkjkmftNQ').toPromise();
        return response["rows"][0]["elements"][0]["distance"]["value"];
    }

    async calculateStoreDistances(origin: google.maps.LatLng): Promise<StoreModel[]> {

        let storeModels: StoreModel[] = [];
        let distance: number;
        
        for (let i = 0; i < stores["stores"].length; i++) {
            let latlng = new google.maps.LatLng(
                parseFloat(stores["stores"][i]["Lat"]),
                parseFloat(stores["stores"][i]["Lng"]));
            distance = await this.getDistance(origin, latlng);
            storeModels.push(new StoreModel(parseInt(stores["stores"][i]["Id"]), stores["stores"][i]["Name"], stores["stores"][i]["Address"], latlng, distance));
        }

        return storeModels;
    }

    totalStores(): number {
        return stores["stores"].length;
    }

    /*async reverseGeocoding(position: google.maps.LatLng): Promise<string> {
        let response = await this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.lat() + ',' + position.lng() + '&result_type=street_address&key=AIzaSyDKhMB2O7xShEa14EFRfsoQcNoWEZ8Fjfw').toPromise();
        return response["results"][0]["address_components"][1]["long_name"] + ' ' + response["results"][0]["address_components"][0]["long_name"];
    }*/
    reverseGeocoding(position: google.maps.LatLng): Observable<any> {
        //let response = await this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.lat() + ',' + position.lng() + '&result_type=street_address&key=AIzaSyDKhMB2O7xShEa14EFRfsoQcNoWEZ8Fjfw').toPromise();
        //return response["results"][0]["address_components"][1]["long_name"] + ' ' + response["results"][0]["address_components"][0]["long_name"];
        return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.lat() + ',' + position.lng() + '&result_type=street_address&key=AIzaSyDKhMB2O7xShEa14EFRfsoQcNoWEZ8Fjfw');
    }

}