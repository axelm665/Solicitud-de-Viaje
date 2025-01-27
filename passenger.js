// passenger.js (para pasajeros)
let map, passengerMarker;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -58.4560 },
        zoom: 14
    });

    passengerMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        position: map.getCenter()
    });
}

function calculateFare() {
    // Calcular distancia entre el pasajero y el conductor más cercano
}

function confirmRide() {
    // Enviar la solicitud al webhook de Make para asignar un conductor
}
