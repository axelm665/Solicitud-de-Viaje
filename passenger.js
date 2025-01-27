let map, originMarker, destinationMarker;
let originLocation = null;
let destinationLocation = null;
let originAutocomplete, destinationAutocomplete;
let directionsService, directionsRenderer;
let geocoder;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -55.5686 }, // Santo Tomé, Corrientes
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    geocoder = new google.maps.Geocoder();

    // Autocompletado para origen y destino
    originAutocomplete = new google.maps.places.Autocomplete(document.getElementById('origin'));
    destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destination'));

    originAutocomplete.addListener('place_changed', function() {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
            setOrigin(place.geometry.location);
        }
    });

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

    // Detectar ubicación del usuario y establecerla como origen
    detectUserLocation();
}

// Función para establecer origen
function setOrigin(location) {
    originLocation = location;

    if (!originMarker) {
        originMarker = new google.maps.Marker({
            map: map,
            position: originLocation,
            draggable: true,
            label: "O"
        });

        google.maps.event.addListener(originMarker, 'dragend', function(event) {
            originLocation = event.latLng;
            updateAddress(originLocation, 'origin');
        });
    } else {
        originMarker.setPosition(originLocation);
    }

    updateAddress(originLocation, 'origin');
    map.setCenter(originLocation);
    calculateFare();
}

// Función para establecer destino
function setDestination(location) {
    destinationLocation = location;

    if (!destinationMarker) {
        destinationMarker = new google.maps.Marker({
            map: map,
            position: destinationLocation,
            draggable: true,
            label: "D"
        });

        google.maps.event.addListener(destinationMarker, 'dragend', function(event) {
            destinationLocation = event.latLng;
            updateAddress(destinationLocation, 'destination');
        });
    } else {
        destinationMarker.setPosition(destinationLocation);
    }

    updateAddress(destinationLocation, 'destination');
    map.setCenter(destinationLocation);
    calculateFare();
}

// Función para detectar la ubicación del usuario y establecerla como origen
function detectUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setOrigin(userLocation);
            },
            () => {
                console.log("Ubicación no permitida. Se mantiene Santo Tomé.");
            }
        );
    }
}

// Función para actualizar la dirección en el campo de texto
function updateAddress(location, fieldId) {
    geocoder.geocode({ location: location }, function(results, status) {
        if (status === 'OK' && results[0]) {
            document.getElementById(fieldId).value = results[0].formatted_address;
        }
    });
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
