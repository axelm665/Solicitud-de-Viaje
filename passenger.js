let map, originMarker, destinationMarker;
let originLocation = null;
let destinationLocation = null;
let originAutocomplete, destinationAutocomplete;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -58.4560 }, // Santo Tomé, Corrientes
        zoom: 14
    });

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

                google.maps.event.addListener(originMarker, 'dragend', function(event) {
                    originLocation = event.latLng;
                });

            },
            () => {
                alert("No se pudo obtener la ubicación actual. Por favor, selecciona manualmente el origen.");
                fallbackOrigin(); // Si falla, usa el fallback
            }
        );
    } else {
        alert("Tu navegador no soporta geolocalización.");
        fallbackOrigin(); // Si el navegador no soporta geolocalización, usa el fallback
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
    destinationAutocomplete.setFields(['address_components', 'geometry']);
    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        destinationLocation = place.geometry.location;
        destinationMarker.setPosition(destinationLocation);
        destinationMarker.setVisible(true);
        map.setCenter(destinationLocation);
    });

    // Selección de destino con clic en el mapa
    google.maps.event.addListener(map, 'click', function(event) {
        if (!destinationLocation) {
            destinationLocation = event.latLng;
            destinationMarker.setPosition(destinationLocation);
            destinationMarker.setVisible(true);
        }
    });

    // Evento para mover el marcador de destino
    google.maps.event.addListener(destinationMarker, 'dragend', function(event) {
        destinationLocation = event.latLng;
    });
}

// Función para establecer un origen por defecto si falla la geolocalización
function fallbackOrigin() {
    originLocation = { lat: -27.3876, lng: -58.4560 }; // Santo Tomé, Corrientes (fallback)
    originMarker = new google.maps.Marker({
        map: map,
        position: originLocation,
        draggable: true,
        label: "Origen"
    });
    map.setCenter(originLocation);
}

function calculateFare() {
    if (!originLocation || !destinationLocation) {
        alert("Selecciona origen y destino.");
        return;
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const request = {
        origin: originLocation,
        destination: destinationLocation,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const distance = result.routes[0].legs[0].distance.text;
            console.log("Distancia: ", distance);
        } else {
            alert('No se pudo calcular la ruta.');
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
    }
}
