let map, originMarker, destinationMarker;
let originLocation = null;
let destinationLocation = null;
let originAutocomplete, destinationAutocomplete;
let directionsService, directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -58.4560 }, // Santo Tomé, Corrientes
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Intentar obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                originLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Crear marcador de origen en la ubicación del usuario
                originMarker = new google.maps.Marker({
                    map: map,
                    position: originLocation,
                    draggable: true,
                    label: "Origen"
                });

                map.setCenter(originLocation);

                // Calcular automáticamente cuando se mueve el marcador
                google.maps.event.addListener(originMarker, 'dragend', function(event) {
                    originLocation = event.latLng;
                    calculateFare();
                });
            },
            () => {
                alert("No se pudo obtener la ubicación actual. Selecciona manualmente el origen.");
                fallbackOrigin();
            }
        );
    } else {
        alert("Tu navegador no soporta geolocalización.");
        fallbackOrigin();
    }

    // Crear el marcador de destino (inicialmente oculto)
    destinationMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        label: "Destino",
        visible: false
    });

    // Autocompletado para el destino
    destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destination'));
    destinationAutocomplete.setFields(['geometry']);
    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        destinationLocation = place.geometry.location;
        destinationMarker.setPosition(destinationLocation);
        destinationMarker.setVisible(true);
        map.setCenter(destinationLocation);
        calculateFare();
    });

    // Permitir marcar destino en el mapa
    google.maps.event.addListener(map, 'click', function(event) {
        if (!destinationLocation) {
            destinationLocation = event.latLng;
            destinationMarker.setPosition(destinationLocation);
            destinationMarker.setVisible(true);
        } else {
            destinationLocation = event.latLng;
            destinationMarker.setPosition(destinationLocation);
        }
        calculateFare();
    });

    // Evento para mover el marcador de destino
    google.maps.event.addListener(destinationMarker, 'dragend', function(event) {
        destinationLocation = event.latLng;
        calculateFare();
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

// Función para establecer un origen por defecto si falla la geolocalización
function fallbackOrigin() {
    originLocation = { lat: -27.3876, lng: -58.4560 }; // Santo Tomé, Corrientes
    originMarker = new google.maps.Marker({
        map: map,
        position: originLocation,
        draggable: true,
        label: "Origen"
    });
    map.setCenter(originLocation);
}
