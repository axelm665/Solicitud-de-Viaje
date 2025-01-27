let map, passengerMarker;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -58.4560 }, // Ubicación inicial en Santo Tomé, Corrientes
        zoom: 14
    });

    passengerMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        position: map.getCenter()
    });

    google.maps.event.addListener(passengerMarker, 'dragend', function(event) {
        // Actualizar la ubicación del pasajero cuando arrastra el marcador
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        console.log(`Nueva ubicación del pasajero: ${lat}, ${lng}`);
    });
}

function calculateFare() {
    // Este es un ejemplo básico de cómo calcular la distancia entre dos puntos.
    // Aquí puedes integrar el cálculo de tarifas con la API de Google Maps.
    const origin = passengerMarker.getPosition();
    const destination = document.getElementById('destination').value;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    directionsRenderer.setMap(map);

    const request = {
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            // Aquí puedes calcular la tarifa en función de la distancia.
            console.log(result.routes[0].legs[0].distance.text);
        } else {
            alert('No se pudo calcular la ruta.');
        }
    });
}

function confirmRide() {
    // Aquí enviarías la solicitud de viaje a Make o a tu backend.
    console.log('Viaje confirmado.');
}
