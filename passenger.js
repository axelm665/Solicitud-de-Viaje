let map, originMarker, destinationMarker;
let originLocation = null;
let destinationLocation = null;
let originAutocomplete, destinationAutocomplete;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.3876, lng: -58.4560 }, // Ubicación inicial en Santo Tomé, Corrientes
        zoom: 14
    });

    // Crear marcadores de origen y destino, inicialmente ocultos
    originMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        label: "Origen",
        position: map.getCenter()
    });

    destinationMarker = new google.maps.Marker({
        map: map,
        draggable: true,
        label: "Destino",
        position: { lat: -27.3876, lng: -58.4560 } // Establecer un destino predeterminado
    });

    // Crear el Autocomplete para Origen
    originAutocomplete = new google.maps.places.Autocomplete(document.getElementById('origin'));
    originAutocomplete.setFields(['address_components', 'geometry']);
    originAutocomplete.addListener('place_changed', function() {
        const place = originAutocomplete.getPlace();
        originLocation = place.geometry.location;
        originMarker.setPosition(originLocation);
        map.setCenter(originLocation);
    });

    // Crear el Autocomplete para Destino
    destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destination'));
    destinationAutocomplete.setFields(['address_components', 'geometry']);
    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        destinationLocation = place.geometry.location;
        destinationMarker.setPosition(destinationLocation);
        map.setCenter(destinationLocation);
    });

    // Evento de mover el marcador de origen
    google.maps.event.addListener(originMarker, 'dragend', function(event) {
        originLocation = event.latLng;
        console.log(`Nuevo origen: ${originLocation.lat()}, ${originLocation.lng()}`);
    });

    // Evento de mover el marcador de destino
    google.maps.event.addListener(destinationMarker, 'dragend', function(event) {
        destinationLocation = event.latLng;
        console.log(`Nuevo destino: ${destinationLocation.lat()}, ${destinationLocation.lng()}`);
    });

    // Evento para seleccionar destino en el mapa
    google.maps.event.addListener(map, 'click', function(event) {
        if (!destinationLocation) {
            destinationLocation = event.latLng;
            destinationMarker.setPosition(destinationLocation);
        }
    });
}

function calculateFare() {
    if (!originLocation || !destinationLocation) {
        alert("Por favor, selecciona tanto el origen como el destino.");
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
            // Aquí puedes calcular la tarifa en función de la distancia
        } else {
            alert('No se pudo calcular la ruta.');
        }
    });
}

function confirmRide() {
    if (!originLocation || !destinationLocation) {
        alert("Por favor, selecciona tanto el origen como el destino.");
        return;
    }

    // Aquí puedes enviar la solicitud de viaje a tu webhook o backend.
    console.log("Viaje confirmado");
    console.log("Origen:", originLocation.lat(), originLocation.lng());
    console.log("Destino:", destinationLocation.lat(), destinationLocation.lng());
}

function clearMarkers() {
    if (originMarker) {
        originMarker.setMap(null);
        originLocation = null;
    }
    if (destinationMarker) {
        destinationMarker.setMap(null);
        destinationLocation = null;
    }
}
