// driver.js (para conductores)
function startTracking() {
    const driverId = document.getElementById('driverId').value;
    navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        sendToWebhook('Activo', driverId, lat, lng);
    });
}

function stopTracking() {
    const driverId = document.getElementById('driverId').value;
    sendToWebhook('Inactivo', driverId);
}

function sendToWebhook(status, driverId, lat = null, lng = null) {
    fetch('https://hook.us2.make.com/TOKEN', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, status, lat, lng })
    });
}
