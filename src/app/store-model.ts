import {} from 'googlemaps';

export class StoreModel {

    id: number;
    name: string;
    address: string;
    position: google.maps.LatLng;
    distance: number;

    constructor(id: number, name: string, address: string, position: google.maps.LatLng, distance: number) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.position = position;
        this.distance = distance;
    }
}