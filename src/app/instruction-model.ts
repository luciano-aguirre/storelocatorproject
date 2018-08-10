import {} from 'googlemaps';

export class InstructionModel {
    instruction: string;
    distance: number;
    endLocation: google.maps.LatLng;

    constructor(instruction: string, distance: number, endLocation: google.maps.LatLng) {
        this.instruction = instruction;
        this.distance = distance;
        this.endLocation = endLocation;
    }
}