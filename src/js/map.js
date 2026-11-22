let map;
let markerLayer;

// Create the map and an empty layer for the markers
export const createMap = () => {
  map = L.map('map-container').setView([60.195, 24.97], 10);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
};

// Show a marker for every restaurant
// onMarkerClick is called with the restaurant when a marker is clicked
export const showMarkers = (restaurants, onMarkerClick) => {
  markerLayer.clearLayers();
  const points = [];

  restaurants.forEach((restaurant) => {
    if (!restaurant.location) {
      return;
    }
    // The API gives [longitude, latitude], Leaflet wants [latitude, longitude]
    const longitude = restaurant.location.coordinates[0];
    const latitude = restaurant.location.coordinates[1];

    const marker = L.marker([latitude, longitude]);
    marker.bindTooltip(restaurant.name);
    marker.on('click', () => {
      onMarkerClick(restaurant);
    });
    marker.addTo(markerLayer);
    points.push([latitude, longitude]);
  });

  if (points.length > 0) {
    map.fitBounds(points, {maxZoom: 15});
  }
};
