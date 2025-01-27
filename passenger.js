let map, originMarker, destinationMarker;
let originLocation = null;
let destinationLocation = null;
let originAutocomplete, destinationAutocomplete;
let directionsService, directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -55.5686 }, // Santo Tomé, Corrientes
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Habilitar Places Autocomplete en los campos de origen y destino
    originAutocomplete = new google.maps.places.Autocomplete(document.getElementById('origin'));
    destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destination'));

    // Evento al seleccionar un origen desde Places
    originAutocomplete.addListener('place_changed', function() {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
            setOrigin(place.geometry.location);
        }
    });

    // Evento al seleccionar un destino desde Places
    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
            setDestination(place.geometry.location);
        }
    });

    // Permitir seleccionar origen o destino tocando el mapa
    google.maps.event.addListener(map, 'click', function(event) {
        if (!originLocation) {
            setOrigin(event.latLng);
        } else if (!destinationLocation) {
            setDestination(event.latLng);
        }
    });
}

// Función para establecer origen
function setOrigin(location) {
    originLocation = location;
    document.getElementById('origin').value = ''; // Limpia el campo para autocompletado

    if (!originMarker) {
        originMarker = new google.maps.Marker({
            map: map,
            position: originLocation,
            draggable: true,
            label: "O"
        });
        google.maps.event.addListener(originMarker, 'dragend', function(event) {
            originLocation = event.latLng;
            calculateFare();
        });
    } else {
        originMarker.setPosition(originLocation);
    }
    map.setCenter(originLocation);
    calculateFare();
}

// Función para establecer destino
function setDestination(location) {
    destinationLocation = location;
    document.getElementById('destination').value = ''; // Limpia el campo para autocompletado

    if (!destinationMarker) {
        destinationMarker = new google.maps.Marker({
            map: map,
            position: destinationLocation,
            draggable: true,
            label: "D"
        });
        google.maps.event.addListener(destinationMarker, 'dragend', function(event) {
            destinationLocation = event.latLng;
            calculateFare();
        });
    } else {
        destinationMarker.setPosition(destinationLocation);
    }
    map.setCenter(destinationLocation);
    calculateFare();
}

// Función para calcular la tarifa automáticamente
function calculateFare() {
    if (!originLocation || !destinationLocation) {
        return;
    }

    const request = {
        origin: originLocation,
        destination: destinationLocation,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const distance = result.routes[0].legs[0].distance.value / 1000; // en km
            const tarifaAuto = distance * 500;  // Tarifa auto: $500 por km
            const tarifaMoto = distance * 300;  // Tarifa moto: $300 por km

            document.getElementById('distance').innerText = `Distancia: ${distance.toFixed(2)} km`;
            document.getElementById('fareAuto').innerText = `Tarifa Auto: $${tarifaAuto.toFixed(2)}`;
            document.getElementById('fareMoto').innerText = `Tarifa Moto: $${tarifaMoto.toFixed(2)}`;
        }
    });
}

function confirmRide() {
    if (!originLocation || !destinationLocation) {
        alert("Selecciona origen y destino.");
        return;
    }

    console.log("Viaje confirmado");
    console.log("Origen:", originLocation.lat(), originLocation.lng());
    console.log("Destino:", destinationLocation.lat(), destinationLocation.lng());
}

function clearMarkers() {
    if (destinationMarker) {
        destinationMarker.setMap(null);
        destinationLocation = null;
        document.getElementById('destination').value = "";
    }
}
