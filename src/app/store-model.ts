import {} from '@types/googlemaps';

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

    /*getMarker(map: google.maps.Map, infoWindow: google.maps.InfoWindow): google.maps.Marker {
        let html: string = "<b>" + name + "</b> <br/>" + this.address + "<br>" + this.distance + " metros</br> <button onclick='myFunction()'>Indicaciones</button>'";
        let marker: google.maps.Marker = new google.maps.Marker({
            map: map,
            position: this.position
        });

        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });

        return marker;
    }*/
}